# 範例訂單檔案

此目錄包含範例訂單檔案，可用於測試訂單匯入功能。

## 檔案列表

- `sample_orders.csv` - CSV 格式的範例訂單
- `sample_orders.json` - JSON 格式的範例訂單

## 使用方式

1. 啟動訂單管理系統
2. 前往「訂單匯入」頁面
3. 上傳這些範例檔案進行測試

## 檔案格式說明

### CSV 格式

每一列代表一個訂單及其主要商品項目。適合單一商品訂單或簡單的訂單匯入。

### JSON 格式

支援複雜的訂單結構，包含多個商品項目。適合複雜訂單或需要詳細資料的匯入。

## 自訂匯入檔案

您可以參考這些範例建立自己的訂單匯入檔案。系統會自動識別以下欄位：

### 中文欄位名稱
- 訂單號碼、訂單編號
- 客戶名稱、客戶姓名
- 客戶信箱、電子郵件
- 客戶電話、聯絡電話
- 客戶地址、地址
- 訂單日期
- 狀態
- 總金額、金額
- 幣別
- 商品名稱、產品名稱
- 商品編號、SKU
- 數量
- 單價

### 英文欄位名稱
- order_number, orderNumber
- customer_name, customerName
- customer_email, customerEmail
- customer_phone, customerPhone
- customer_address, customerAddress
- order_date, orderDate
- status
- total_amount, totalAmount
- currency
- product_name, productName
- product_sku, productSku
- quantity
- unit_price, unitPrice
