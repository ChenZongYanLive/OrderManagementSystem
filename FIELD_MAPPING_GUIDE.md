# 欄位映射功能使用指南

## 功能概述

欄位映射（Field Mapping）功能讓您可以自定義訂單匯入時的欄位對應關係，支援：

- 📋 檔案預覽：查看上傳檔案的欄位和前幾筆資料
- 🔄 自動建議：系統自動識別並建議欄位映射
- 💾 模板管理：儲存和重用映射配置
- 🎯 視覺化映射：直觀的拖拽式欄位對應
- 📊 多格式支援：CSV、Excel、JSON

## 功能架構

```
訂單匯入流程
├── 快速匯入 (原有功能)
│   └── 使用預設欄位識別規則
└── 進階匯入 (新功能)
    ├── 1. 上傳檔案
    ├── 2. 預覽與映射
    │   ├── 檔案預覽
    │   ├── 自動建議映射
    │   ├── 手動調整映射
    │   └── 儲存為模板
    └── 3. 執行匯入
```

## 使用步驟

### 1. 進階匯入頁面

訪問 **進階匯入** 頁面開始使用欄位映射功能。

### 2. 上傳檔案

1. 點擊選擇檔案或拖拽檔案到上傳區
2. 支援的格式：`.csv`, `.xlsx`, `.xls`, `.json`
3. 檔案大小限制：10MB
4. 點擊「下一步：預覽與映射」

### 3. 預覽與映射

#### 3.1 檔案預覽

系統會顯示：
- 檔案名稱和類型
- 偵測到的欄位數量
- 前 5 筆資料預覽
- 自動偵測的欄位類型（string, number, date, boolean）

#### 3.2 使用現有模板

如果之前儲存過相同檔案類型的模板：
- 點擊模板按鈕快速套用
- 預設模板會自動套用

#### 3.3 欄位映射

**映射界面說明：**

```
源檔案欄位          →    系統欄位
┌─────────────┐          ┌─────────────┐
│ customer    │    →     │ 客戶名稱 *   │
│ (string)    │          └─────────────┘
└─────────────┘
```

**操作說明：**
- 左側：源檔案中的欄位名稱和類型
- 右側：下拉選單選擇對應的系統欄位
- 標記 `*` 的為必填欄位
- 選擇「忽略此欄位」來跳過不需要的欄位

**系統欄位分類：**

**訂單欄位：**
- 訂單號碼 (order_number)
- 客戶名稱 (customer_name) *
- 客戶信箱 (customer_email)
- 客戶電話 (customer_phone)
- 客戶地址 (customer_address)
- 訂單日期 (order_date)
- 訂單狀態 (status)
- 總金額 (total_amount)
- 幣別 (currency)
- 備註 (notes)

**商品欄位：**
- 商品名稱 (product_name) *
- 商品編號 (product_sku)
- 數量 (quantity) *
- 單價 (unit_price) *
- 小計 (subtotal)

#### 3.4 儲存為模板

完成映射後，可以儲存為模板以便日後重用：

1. 在「儲存為新模板」區域輸入模板名稱
2. 點擊「儲存模板」
3. 下次匯入相同格式的檔案時可直接套用

### 4. 執行匯入

確認映射設定後：
1. 點擊「開始匯入」
2. 系統會根據您的映射規則處理資料
3. 查看匯入結果統計

## 欄位映射模板管理

### 訪問模板管理頁面

導覽列選擇 **欄位映射** 進入模板管理頁面。

### 模板列表

顯示所有已儲存的映射模板：
- 模板名稱和描述
- 適用的檔案類型
- 是否為預設模板
- 創建時間

### 模板操作

**檢視模板：**
- 點擊「檢視」查看完整的映射規則
- 顯示所有源欄位到系統欄位的對應關係

**設為預設：**
- 每種檔案類型可設定一個預設模板
- 預設模板會在檔案預覽時自動套用

**刪除模板：**
- 點擊「刪除」移除不需要的模板
- 刪除前會要求確認

## 自動映射建議規則

系統會根據欄位名稱自動建議映射，支援中英文識別：

| 系統欄位 | 識別的源欄位名稱 |
|---------|----------------|
| order_number | order_number, ordernumber, order_id, 訂單號碼, 訂單編號 |
| customer_name | customer_name, customername, name, 客戶名稱, 客戶姓名 |
| customer_email | customer_email, email, e-mail, 客戶信箱, 電子郵件 |
| customer_phone | customer_phone, phone, tel, 客戶電話, 聯絡電話 |
| customer_address | customer_address, address, 客戶地址, 地址 |
| order_date | order_date, date, 訂單日期, 日期 |
| status | status, order_status, 狀態, 訂單狀態 |
| total_amount | total_amount, total, amount, 總金額, 金額 |
| product_name | product_name, item_name, product, 商品名稱, 產品名稱 |
| product_sku | product_sku, sku, item_code, 商品編號, SKU |
| quantity | quantity, qty, amount, 數量, 件數 |
| unit_price | unit_price, price, 單價, 價格 |

## API 端點

### 欄位映射模板

```
GET    /api/field-mapping/templates           # 取得所有模板
GET    /api/field-mapping/templates/:id       # 取得特定模板
POST   /api/field-mapping/templates           # 創建新模板
PUT    /api/field-mapping/templates/:id       # 更新模板
DELETE /api/field-mapping/templates/:id       # 刪除模板
POST   /api/field-mapping/templates/:id/set-default  # 設為預設
```

### 檔案預覽

```
POST   /api/field-mapping/preview             # 預覽檔案
```

### 系統欄位

```
GET    /api/field-mapping/system-fields       # 取得系統欄位定義
```

## 資料庫結構

### field_mapping_templates 表

```sql
CREATE TABLE field_mapping_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  file_type VARCHAR(50) NOT NULL,
  mapping_config JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### mapping_config JSON 格式

```json
{
  "源欄位1": "系統欄位1",
  "源欄位2": "系統欄位2",
  "源欄位3": null,  // 忽略此欄位
  ...
}
```

## 範例：創建映射模板

### CSV 檔案格式

```csv
訂單編號,客戶姓名,客戶電話,商品名稱,數量,單價
ORD001,張三,0912345678,商品A,2,100
```

### 映射配置

```json
{
  "訂單編號": "order_number",
  "客戶姓名": "customer_name",
  "客戶電話": "customer_phone",
  "商品名稱": "product_name",
  "數量": "quantity",
  "單價": "unit_price"
}
```

### 儲存模板 API 呼叫

```javascript
POST /api/field-mapping/templates

{
  "name": "標準訂單格式",
  "description": "公司標準訂單 CSV 格式",
  "file_type": "csv",
  "mapping_config": {
    "訂單編號": "order_number",
    "客戶姓名": "customer_name",
    "客戶電話": "customer_phone",
    "商品名稱": "product_name",
    "數量": "quantity",
    "單價": "unit_price"
  },
  "is_default": true
}
```

## 常見問題

### Q1: 為什麼我的欄位沒有自動映射？

系統會嘗試根據欄位名稱自動建議映射，但如果欄位名稱差異太大，可能無法識別。您可以手動設定映射關係。

### Q2: 可以編輯已存在的模板嗎？

目前版本支援檢視和刪除模板。若要修改模板，建議刪除後重新創建。

### Q3: JSON 格式的嵌套欄位如何處理？

系統會自動展平嵌套物件，使用點號分隔。例如 `customer.name` 會變成 `customer.name`。

### Q4: 匯入時必填欄位沒有映射會怎樣？

匯入時會顯示錯誤，建議至少映射：
- customer_name（客戶名稱）
- product_name（商品名稱）
- quantity（數量）
- unit_price（單價）

### Q5: 可以映射多個源欄位到同一個系統欄位嗎？

不建議。每個源欄位應該映射到唯一的系統欄位。如果多個源欄位映射到同一個系統欄位，只有最後一個會生效。

## 最佳實踐

1. **為常用格式創建模板**
   - 為經常匯入的檔案格式創建並儲存模板
   - 設定預設模板以提高效率

2. **使用描述性模板名稱**
   - 例如：「供應商A訂單格式」、「月度銷售報表」
   - 便於日後識別和使用

3. **定期檢視和清理模板**
   - 刪除不再使用的模板
   - 保持模板列表整潔

4. **驗證映射結果**
   - 匯入前檢查預覽資料
   - 確認欄位映射正確

5. **處理錯誤**
   - 查看匯入結果的錯誤詳情
   - 根據錯誤調整映射規則

## 技術細節

### 欄位類型偵測

系統會自動偵測欄位類型：
- **number**: 所有值都是數字
- **date**: 所有值都是有效日期
- **boolean**: 所有值都是 true/false/yes/no/1/0
- **string**: 預設類型

### 檔案預覽限制

- 預覽前 5 筆資料
- 最大檔案大小：10MB
- 支援 UTF-8 編碼

### 效能考量

- 大檔案匯入建議分批處理
- 映射配置使用 JSONB 儲存，查詢效能佳
- 檔案預覽不會載入全部資料

## 更新日誌

### v1.0.0 (2024-10-22)
- ✨ 初始發布
- 📋 檔案預覽功能
- 🔄 自動映射建議
- 💾 模板管理
- 🎯 視覺化欄位映射界面
