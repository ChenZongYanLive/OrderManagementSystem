import fs from 'fs';
import csv from 'csv-parser';
import XLSX from 'xlsx';

class FilePreviewService {
  // Preview CSV file
  static async previewCSV(filePath, limit = 5) {
    return new Promise((resolve, reject) => {
      const results = [];
      let headers = [];
      let count = 0;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('headers', (headerList) => {
          headers = headerList;
        })
        .on('data', (data) => {
          if (count < limit) {
            results.push(data);
            count++;
          }
        })
        .on('end', () => {
          resolve({
            headers: headers,
            preview: results,
            totalPreviewRows: results.length,
          });
        })
        .on('error', (error) => reject(error));
    });
  }

  // Preview Excel file
  static previewExcel(filePath, limit = 5) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Get all data
      const allData = XLSX.utils.sheet_to_json(worksheet);

      // Get headers from first row
      const headers = allData.length > 0 ? Object.keys(allData[0]) : [];

      // Get preview data
      const preview = allData.slice(0, limit);

      return {
        headers,
        preview,
        totalPreviewRows: preview.length,
        totalRows: allData.length,
      };
    } catch (error) {
      throw new Error(`Invalid Excel file: ${error.message}`);
    }
  }

  // Preview JSON file
  static previewJSON(filePath, limit = 5) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const jsonData = JSON.parse(fileContent);
      const allData = Array.isArray(jsonData) ? jsonData : [jsonData];

      // Get headers from first object
      const headers = allData.length > 0 ? Object.keys(allData[0]) : [];

      // Flatten nested objects for headers
      const flatHeaders = new Set();
      allData.forEach((item) => {
        const flatItem = this.flattenObject(item);
        Object.keys(flatItem).forEach((key) => flatHeaders.add(key));
      });

      // Get preview data
      const preview = allData.slice(0, limit).map((item) => this.flattenObject(item));

      return {
        headers: Array.from(flatHeaders),
        preview,
        totalPreviewRows: preview.length,
        totalRows: allData.length,
      };
    } catch (error) {
      throw new Error(`Invalid JSON file: ${error.message}`);
    }
  }

  // Flatten nested object
  static flattenObject(obj, prefix = '') {
    const flattened = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          Object.assign(flattened, this.flattenObject(value, newKey));
        } else if (Array.isArray(value)) {
          flattened[newKey] = JSON.stringify(value);
        } else {
          flattened[newKey] = value;
        }
      }
    }

    return flattened;
  }

  // Preview file based on type
  static async previewFile(filePath, fileType, limit = 5) {
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    if (fileType === 'csv') {
      return await this.previewCSV(filePath, limit);
    } else if (fileType === 'excel' || fileType === 'xlsx') {
      return this.previewExcel(filePath, limit);
    } else if (fileType === 'json') {
      return this.previewJSON(filePath, limit);
    } else {
      throw new Error('Unsupported file type');
    }
  }

  // Detect field types from preview data
  static detectFieldTypes(preview) {
    if (!preview || preview.length === 0) return {};

    const fieldTypes = {};
    const headers = Object.keys(preview[0]);

    headers.forEach((header) => {
      const values = preview.map((row) => row[header]).filter((v) => v !== null && v !== undefined && v !== '');

      if (values.length === 0) {
        fieldTypes[header] = 'string';
        return;
      }

      // Check if all values are numbers
      const allNumbers = values.every((v) => !isNaN(parseFloat(v)) && isFinite(v));
      if (allNumbers) {
        fieldTypes[header] = 'number';
        return;
      }

      // Check if all values are dates
      const allDates = values.every((v) => !isNaN(Date.parse(v)));
      if (allDates) {
        fieldTypes[header] = 'date';
        return;
      }

      // Check if all values are booleans
      const allBooleans = values.every((v) =>
        ['true', 'false', '1', '0', 'yes', 'no'].includes(String(v).toLowerCase())
      );
      if (allBooleans) {
        fieldTypes[header] = 'boolean';
        return;
      }

      fieldTypes[header] = 'string';
    });

    return fieldTypes;
  }

  // Get suggested mappings based on field names
  static getSuggestedMappings(headers) {
    const mappings = {};

    const fieldMappingRules = {
      // Order fields
      order_number: ['order_number', 'ordernumber', 'order_id', 'orderid', '訂單號碼', '訂單編號', 'order no', 'order no.'],
      customer_name: ['customer_name', 'customername', 'name', 'client_name', '客戶名稱', '客戶姓名', '姓名'],
      customer_email: ['customer_email', 'customeremail', 'email', 'e-mail', '客戶信箱', '電子郵件', '信箱'],
      customer_phone: ['customer_phone', 'customerphone', 'phone', 'tel', 'telephone', '客戶電話', '聯絡電話', '電話'],
      customer_address: ['customer_address', 'customeraddress', 'address', '客戶地址', '地址', '收件地址'],
      order_date: ['order_date', 'orderdate', 'date', 'created_at', '訂單日期', '日期', '下單日期'],
      status: ['status', 'order_status', 'orderstatus', '狀態', '訂單狀態'],
      total_amount: ['total_amount', 'totalamount', 'total', 'amount', 'price', '總金額', '金額', '總價'],
      currency: ['currency', '幣別', '貨幣'],
      notes: ['notes', 'note', 'remark', 'remarks', 'comment', '備註', '註記'],

      // Item fields
      product_name: ['product_name', 'productname', 'item_name', 'itemname', 'product', '商品名稱', '產品名稱', '品名'],
      product_sku: ['product_sku', 'productsku', 'sku', 'item_code', 'product_code', '商品編號', 'SKU', '產品編號'],
      quantity: ['quantity', 'qty', 'amount', 'count', '數量', '件數'],
      unit_price: ['unit_price', 'unitprice', 'price', 'item_price', '單價', '價格'],
      subtotal: ['subtotal', 'sub_total', 'item_total', '小計', '金額'],
    };

    headers.forEach((header) => {
      const normalizedHeader = header.toLowerCase().trim().replace(/[_\s-]/g, '');

      for (const [targetField, patterns] of Object.entries(fieldMappingRules)) {
        const matched = patterns.some((pattern) => {
          const normalizedPattern = pattern.toLowerCase().replace(/[_\s-]/g, '');
          return normalizedHeader === normalizedPattern || normalizedHeader.includes(normalizedPattern);
        });

        if (matched) {
          mappings[header] = targetField;
          break;
        }
      }

      // If no match found, keep original
      if (!mappings[header]) {
        mappings[header] = null; // User needs to manually map
      }
    });

    return mappings;
  }
}

export default FilePreviewService;
