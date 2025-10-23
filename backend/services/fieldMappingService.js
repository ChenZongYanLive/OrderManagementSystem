/**
 * 欄位映射轉換服務
 * 負責將源資料根據映射配置轉換為系統格式
 */
class FieldMappingService {
  /**
   * 轉換單筆記錄
   * @param {Object} rawData - 源資料
   * @param {Object} fieldMapping - 欄位映射配置 { 源欄位: 目標欄位 }
   * @returns {Object} 轉換後的資料
   */
  static transformRecord(rawData, fieldMapping) {
    const transformed = {};

    for (const [sourceField, targetField] of Object.entries(fieldMapping)) {
      // 忽略未映射的欄位
      if (!targetField || targetField === '') continue;

      // 複製資料
      if (rawData[sourceField] !== undefined && rawData[sourceField] !== null) {
        transformed[targetField] = rawData[sourceField];
      }
    }

    return transformed;
  }

  /**
   * 分離訂單和項目資料
   * @param {Object} transformedData - 已轉換的資料
   * @returns {Object} { orderData, itemData }
   */
  static separateOrderAndItems(transformedData) {
    const orderFields = [
      'order_number',
      'customer_id',
      'customer_name',
      'customer_email',
      'customer_phone',
      'customer_address',
      'order_date',
      'status',
      'total_amount',
      'currency',
      'notes',
      'source',
      'import_batch_id',
    ];

    const itemFields = [
      'product_name',
      'product_sku',
      'quantity',
      'unit_price',
      'subtotal',
    ];

    const orderData = {};
    const itemData = {};

    for (const [key, value] of Object.entries(transformedData)) {
      if (orderFields.includes(key)) {
        orderData[key] = value;
      } else if (itemFields.includes(key)) {
        itemData[key] = value;
      }
    }

    return { orderData, itemData };
  }

  /**
   * 驗證必填欄位
   * @param {Object} data - 資料
   * @param {Object} systemFields - 系統欄位定義
   * @returns {Array} 錯誤訊息陣列
   */
  static validateRequiredFields(data, systemFields) {
    const errors = [];

    // 檢查訂單必填欄位
    if (systemFields.order) {
      for (const [field, definition] of Object.entries(systemFields.order)) {
        if (definition.required && !data[field]) {
          errors.push(`缺少必填欄位: ${definition.label} (${field})`);
        }
      }
    }

    return errors;
  }

  /**
   * 驗證項目必填欄位
   * @param {Object} itemData - 項目資料
   * @param {Object} systemFields - 系統欄位定義
   * @returns {Array} 錯誤訊息陣列
   */
  static validateItemFields(itemData, systemFields) {
    const errors = [];

    if (systemFields.item) {
      for (const [field, definition] of Object.entries(systemFields.item)) {
        if (definition.required && !itemData[field]) {
          errors.push(`商品缺少必填欄位: ${definition.label} (${field})`);
        }
      }
    }

    return errors;
  }

  /**
   * 類型轉換
   * @param {*} value - 原始值
   * @param {string} type - 目標類型
   * @returns {*} 轉換後的值
   */
  static convertType(value, type) {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    try {
      switch (type) {
        case 'number':
          const num = parseFloat(value);
          return isNaN(num) ? null : num;

        case 'integer':
          const int = parseInt(value);
          return isNaN(int) ? null : int;

        case 'boolean':
          if (typeof value === 'boolean') return value;
          const strValue = String(value).toLowerCase();
          return ['true', '1', 'yes', 'y'].includes(strValue);

        case 'date':
          const date = new Date(value);
          return isNaN(date.getTime()) ? null : date.toISOString();

        case 'string':
        default:
          return String(value);
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * 根據系統欄位定義轉換資料類型
   * @param {Object} data - 資料
   * @param {Object} systemFields - 系統欄位定義
   * @returns {Object} 類型轉換後的資料
   */
  static convertDataTypes(data, systemFields) {
    const converted = { ...data };

    // 轉換訂單欄位類型
    if (systemFields.order) {
      for (const [field, definition] of Object.entries(systemFields.order)) {
        if (converted[field] !== undefined && definition.type) {
          converted[field] = this.convertType(converted[field], definition.type);
        }
      }
    }

    return converted;
  }

  /**
   * 取得系統欄位定義
   * @returns {Object} 系統欄位定義
   */
  static getSystemFieldDefinitions() {
    return {
      order: {
        order_number: { label: '訂單號碼', type: 'string', required: false },
        customer_name: { label: '客戶名稱', type: 'string', required: true },
        customer_email: { label: '客戶信箱', type: 'string', required: false },
        customer_phone: { label: '客戶電話', type: 'string', required: false },
        customer_address: { label: '客戶地址', type: 'string', required: false },
        order_date: { label: '訂單日期', type: 'date', required: false },
        status: {
          label: '訂單狀態',
          type: 'string',
          required: false,
          options: ['pending', 'processing', 'completed', 'cancelled'],
        },
        total_amount: { label: '總金額', type: 'number', required: false },
        currency: { label: '幣別', type: 'string', required: false },
        notes: { label: '備註', type: 'string', required: false },
      },
      item: {
        product_name: { label: '商品名稱', type: 'string', required: true },
        product_sku: { label: '商品編號', type: 'string', required: false },
        quantity: { label: '數量', type: 'integer', required: true },
        unit_price: { label: '單價', type: 'number', required: true },
        subtotal: { label: '小計', type: 'number', required: false },
      },
    };
  }
}

export default FieldMappingService;
