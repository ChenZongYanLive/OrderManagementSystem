import fs from 'fs';
import csv from 'csv-parser';
import XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import Order from '../models/Order.js';
import ImportLog from '../models/ImportLog.js';

class OrderImportService {
  // Parse CSV file
  static async parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  // Parse Excel file
  static parseExcel(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  }

  // Parse JSON file
  static parseJSON(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  }

  // Normalize order data from different formats
  static normalizeOrderData(rawData) {
    // Handle different field naming conventions
    return {
      order_number: rawData.order_number || rawData.orderNumber || rawData['訂單號碼'] || rawData['訂單編號'] || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customer_name: rawData.customer_name || rawData.customerName || rawData['客戶名稱'] || rawData['客戶姓名'] || '',
      customer_email: rawData.customer_email || rawData.customerEmail || rawData['客戶信箱'] || rawData['電子郵件'] || null,
      customer_phone: rawData.customer_phone || rawData.customerPhone || rawData['客戶電話'] || rawData['聯絡電話'] || null,
      customer_address: rawData.customer_address || rawData.customerAddress || rawData['客戶地址'] || rawData['地址'] || null,
      order_date: rawData.order_date || rawData.orderDate || rawData['訂單日期'] || new Date().toISOString(),
      status: rawData.status || rawData['狀態'] || 'pending',
      total_amount: parseFloat(rawData.total_amount || rawData.totalAmount || rawData['總金額'] || rawData['金額'] || 0),
      currency: rawData.currency || rawData['幣別'] || 'TWD',
      notes: rawData.notes || rawData['備註'] || null,
      source: 'import',
    };
  }

  // Normalize order items
  static normalizeOrderItems(rawData) {
    // Check if items are in a separate field
    let items = [];

    if (rawData.items) {
      items = Array.isArray(rawData.items) ? rawData.items : JSON.parse(rawData.items);
    } else if (rawData['商品']) {
      items = Array.isArray(rawData['商品']) ? rawData['商品'] : JSON.parse(rawData['商品']);
    } else {
      // Single item per row format
      const productName = rawData.product_name || rawData.productName || rawData['商品名稱'] || rawData['產品名稱'];
      if (productName) {
        items = [{
          product_name: productName,
          product_sku: rawData.product_sku || rawData.productSku || rawData['商品編號'] || rawData['SKU'] || null,
          quantity: parseInt(rawData.quantity || rawData['數量'] || 1),
          unit_price: parseFloat(rawData.unit_price || rawData.unitPrice || rawData['單價'] || 0),
          subtotal: parseFloat(rawData.subtotal || rawData['小計'] || 0),
        }];
      }
    }

    return items.map(item => ({
      product_name: item.product_name || item.productName || item['商品名稱'] || '',
      product_sku: item.product_sku || item.productSku || item['商品編號'] || null,
      quantity: parseInt(item.quantity || item['數量'] || 1),
      unit_price: parseFloat(item.unit_price || item.unitPrice || item['單價'] || 0),
      subtotal: parseFloat(item.subtotal || item['小計'] || (item.quantity * item.unit_price) || 0),
    }));
  }

  // Import orders from file
  static async importOrders(filePath, fileName, fileType) {
    const batchId = uuidv4();
    let rawData = [];
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    try {
      // Parse file based on type
      if (fileType === 'csv') {
        rawData = await this.parseCSV(filePath);
      } else if (fileType === 'excel' || fileType === 'xlsx') {
        rawData = this.parseExcel(filePath);
      } else if (fileType === 'json') {
        const jsonData = this.parseJSON(filePath);
        rawData = Array.isArray(jsonData) ? jsonData : [jsonData];
      } else {
        throw new Error('Unsupported file type');
      }

      // Create import log
      await ImportLog.create({
        batch_id: batchId,
        file_name: fileName,
        file_type: fileType,
        total_records: rawData.length,
        status: 'processing',
      });

      // Process each record
      for (let i = 0; i < rawData.length; i++) {
        try {
          const orderData = this.normalizeOrderData(rawData[i]);
          const items = this.normalizeOrderItems(rawData[i]);

          orderData.import_batch_id = batchId;

          // Calculate total if not provided
          if (!orderData.total_amount && items.length > 0) {
            orderData.total_amount = items.reduce((sum, item) => sum + item.subtotal, 0);
          }

          await Order.create(orderData, items);
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push({
            row: i + 1,
            error: error.message,
            data: rawData[i],
          });
        }
      }

      // Update import log
      await ImportLog.update(batchId, {
        success_count: successCount,
        error_count: errorCount,
        status: errorCount === 0 ? 'completed' : 'completed_with_errors',
        error_details: errors.length > 0 ? JSON.stringify(errors) : null,
      });

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      return {
        batchId,
        totalRecords: rawData.length,
        successCount,
        errorCount,
        errors,
      };
    } catch (error) {
      // Update import log with error
      await ImportLog.update(batchId, {
        status: 'failed',
        error_details: JSON.stringify({ message: error.message }),
      });

      // Clean up uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      throw error;
    }
  }
}

export default OrderImportService;
