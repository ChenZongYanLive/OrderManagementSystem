# 訂單管理系統 (Order Management System)

一個功能完整的訂單管理系統，支援多種格式的訂單匯入和統一管理。

## 主要功能

- ✅ 完整的訂單 CRUD 操作（新增、查詢、更新、刪除）
- ✅ 多種格式訂單匯入：CSV、Excel (.xlsx, .xls)、JSON
- ✅ 自動識別並統一不同格式的訂單資料
- ✅ 訂單狀態追蹤：待處理、處理中、已完成、已取消
- ✅ 訂單統計分析與報表
- ✅ 匯入記錄追蹤與錯誤日誌
- ✅ 響應式界面設計

## 技術架構

### 後端
- **Node.js** + **Express**：RESTful API 服務
- **PostgreSQL**：關聯式資料庫
- **multer**：文件上傳處理
- **xlsx**：Excel 檔案解析
- **csv-parser**：CSV 檔案解析

### 前端
- **React 18**：使用者界面
- **React Router**：路由管理
- **Axios**：HTTP 請求
- **Vite**：開發建置工具

## 項目結構

```
OrderManagementSystem/
├── backend/                  # 後端應用
│   ├── config/              # 配置文件
│   │   └── database.js      # 數據庫配置
│   ├── controllers/         # 控制器
│   │   ├── orderController.js
│   │   └── importController.js
│   ├── models/              # 數據模型
│   │   ├── Order.js
│   │   └── ImportLog.js
│   ├── routes/              # 路由
│   │   ├── orderRoutes.js
│   │   └── importRoutes.js
│   ├── services/            # 業務邏輯
│   │   └── orderImportService.js
│   ├── middleware/          # 中間件
│   │   └── upload.js
│   ├── scripts/             # 腳本
│   │   └── initDatabase.js  # 數據庫初始化
│   ├── .env.example         # 環境變數範例
│   ├── package.json
│   └── server.js            # 主入口
│
├── frontend/                # 前端應用
│   ├── src/
│   │   ├── pages/           # 頁面組件
│   │   │   ├── Dashboard.jsx
│   │   │   ├── OrderList.jsx
│   │   │   ├── OrderDetail.jsx
│   │   │   ├── OrderImport.jsx
│   │   │   └── ImportLogs.jsx
│   │   ├── services/        # API 服務
│   │   │   └── api.js
│   │   ├── App.jsx          # 主應用組件
│   │   ├── main.jsx         # 入口文件
│   │   └── index.css        # 全局樣式
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 快速開始

### 前置需求

- Node.js (v16 或以上)
- PostgreSQL (v12 或以上)
- npm 或 yarn

### 1. 克隆項目

```bash
git clone https://github.com/yourusername/OrderManagementSystem.git
cd OrderManagementSystem
```

### 2. 設定資料庫

創建 PostgreSQL 資料庫：

```sql
CREATE DATABASE order_management;
```

### 3. 安裝並啟動後端

```bash
cd backend

# 安裝依賴
npm install

# 複製環境變數文件並配置
cp .env.example .env

# 編輯 .env 文件，設定資料庫連接資訊
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=order_management
# DB_USER=postgres
# DB_PASSWORD=your_password

# 初始化資料庫表結構
npm run init-db

# 啟動開發服務器
npm run dev
```

後端將運行在 http://localhost:5000

### 4. 安裝並啟動前端

```bash
# 開新終端
cd frontend

# 安裝依賴
npm install

# 啟動開發服務器
npm run dev
```

前端將運行在 http://localhost:3000

### 5. 訪問應用

打開瀏覽器訪問 http://localhost:3000

## API 端點

### 訂單管理

- `GET /api/orders` - 獲取訂單列表（支援分頁和篩選）
- `GET /api/orders/:id` - 獲取訂單詳情
- `POST /api/orders` - 創建新訂單
- `PUT /api/orders/:id` - 更新訂單
- `DELETE /api/orders/:id` - 刪除訂單
- `GET /api/orders/statistics` - 獲取訂單統計

### 訂單匯入

- `POST /api/import/upload` - 上傳並匯入訂單檔案
- `GET /api/import/logs` - 獲取匯入記錄
- `GET /api/import/logs/:batchId` - 獲取特定批次的匯入詳情

## 資料庫結構

### orders 表
- 儲存訂單主要資訊
- 包含客戶資訊、訂單狀態、金額等

### order_items 表
- 儲存訂單項目（商品）
- 與 orders 表是一對多關係

### customers 表
- 儲存客戶資訊
- 可選用，支援訂單與客戶關聯

### import_logs 表
- 記錄每次匯入操作
- 追蹤成功/失敗筆數和錯誤詳情

## 訂單匯入格式

系統支援以下格式的訂單檔案匯入：

### CSV 格式

```csv
order_number,customer_name,customer_email,customer_phone,total_amount,status,product_name,quantity,unit_price
ORD-001,張三,zhang@example.com,0912345678,1500,pending,商品A,2,750
```

### JSON 格式

```json
[
  {
    "order_number": "ORD-001",
    "customer_name": "張三",
    "customer_email": "zhang@example.com",
    "total_amount": 1500,
    "items": [
      {
        "product_name": "商品A",
        "quantity": 2,
        "unit_price": 750
      }
    ]
  }
]
```

### Excel 格式

支援 .xlsx 和 .xls 檔案，格式與 CSV 相同。

### 支援的欄位

系統自動識別以下欄位（支援中英文）：

**訂單資訊：**
- order_number / 訂單號碼
- order_date / 訂單日期
- status / 狀態
- total_amount / 總金額
- currency / 幣別

**客戶資訊：**
- customer_name / 客戶名稱
- customer_email / 客戶信箱
- customer_phone / 客戶電話
- customer_address / 客戶地址

**商品資訊：**
- product_name / 商品名稱
- product_sku / 商品編號
- quantity / 數量
- unit_price / 單價

## 部署

### 生產環境建置

後端：
```bash
cd backend
npm install --production
NODE_ENV=production npm start
```

前端：
```bash
cd frontend
npm run build
# 建置檔案會在 dist/ 目錄
```

### 環境變數配置

確保生產環境設定正確的環境變數：

```env
NODE_ENV=production
PORT=5000
DB_HOST=your_production_db_host
DB_PORT=5432
DB_NAME=order_management
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

## 授權

MIT License

## 作者

Your Name

## 貢獻

歡迎提交 Pull Request 或 Issue！
