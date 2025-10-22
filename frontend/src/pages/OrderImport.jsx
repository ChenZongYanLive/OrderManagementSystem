import React, { useState } from 'react';
import { importAPI } from '../services/api';

function OrderImport() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('請選擇檔案');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const response = await importAPI.uploadFile(file);
      setResult(response.data);
      setFile(null);

      // Reset file input
      document.getElementById('fileInput').value = '';
    } catch (err) {
      setError(err.response?.data?.error || '上傳失敗');
      console.error('Error uploading file:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>訂單匯入</h2>
        <p style={{ marginBottom: '20px', color: '#718096' }}>
          支援 CSV、Excel (.xlsx, .xls) 和 JSON 格式的訂單檔案匯入
        </p>

        <div
          className={`upload-area ${dragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            accept=".csv,.xlsx,.xls,.json"
            style={{ display: 'none' }}
          />

          {file ? (
            <div>
              <p style={{ fontSize: '18px', marginBottom: '10px' }}>已選擇檔案：</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#667eea' }}>
                {file.name}
              </p>
              <p style={{ marginTop: '10px', color: '#718096' }}>
                ({(file.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '18px', marginBottom: '10px' }}>
                拖曳檔案到這裡，或點擊選擇檔案
              </p>
              <p style={{ color: '#718096' }}>
                支援 .csv, .xlsx, .xls, .json 格式
              </p>
            </div>
          )}
        </div>

        {file && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn btn-success"
              style={{ marginRight: '10px' }}
            >
              {uploading ? '上傳中...' : '開始匯入'}
            </button>
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
                setError(null);
                document.getElementById('fileInput').value = '';
              }}
              disabled={uploading}
              className="btn btn-secondary"
            >
              取消
            </button>
          </div>
        )}

        {error && (
          <div className="error" style={{ marginTop: '20px' }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '15px', color: '#2d3748' }}>匯入結果</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div>
                <p style={{ color: '#718096', marginBottom: '5px' }}>總記錄數</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748' }}>
                  {result.totalRecords}
                </p>
              </div>
              <div>
                <p style={{ color: '#718096', marginBottom: '5px' }}>成功匯入</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#48bb78' }}>
                  {result.successCount}
                </p>
              </div>
              <div>
                <p style={{ color: '#718096', marginBottom: '5px' }}>失敗筆數</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f56565' }}>
                  {result.errorCount}
                </p>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ marginBottom: '10px', color: '#742a2a' }}>錯誤詳情：</h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
                  {result.errors.map((err, index) => (
                    <div key={index} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                      <p><strong>第 {err.row} 列：</strong></p>
                      <p style={{ color: '#e53e3e' }}>{err.error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '20px' }}>
              <p style={{ color: '#718096', marginBottom: '5px' }}>批次 ID</p>
              <p style={{ fontSize: '14px', fontFamily: 'monospace', color: '#4a5568' }}>
                {result.batchId}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2>檔案格式說明</h2>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>CSV 格式範例</h3>
        <pre style={{ backgroundColor: '#f7fafc', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
{`order_number,customer_name,customer_email,customer_phone,total_amount,status,product_name,quantity,unit_price
ORD-001,張三,zhang@example.com,0912345678,1500,pending,商品A,2,750
ORD-002,李四,li@example.com,0923456789,3000,processing,商品B,3,1000`}
        </pre>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>JSON 格式範例</h3>
        <pre style={{ backgroundColor: '#f7fafc', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
{`[
  {
    "order_number": "ORD-001",
    "customer_name": "張三",
    "customer_email": "zhang@example.com",
    "customer_phone": "0912345678",
    "total_amount": 1500,
    "status": "pending",
    "items": [
      {
        "product_name": "商品A",
        "quantity": 2,
        "unit_price": 750
      }
    ]
  }
]`}
        </pre>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>支援的欄位</h3>
        <ul style={{ lineHeight: '2', marginLeft: '20px' }}>
          <li><strong>訂單資訊：</strong>order_number（訂單號碼）、order_date（訂單日期）、status（狀態）、total_amount（總金額）</li>
          <li><strong>客戶資訊：</strong>customer_name（客戶名稱）、customer_email（信箱）、customer_phone（電話）、customer_address（地址）</li>
          <li><strong>商品資訊：</strong>product_name（商品名稱）、product_sku（商品編號）、quantity（數量）、unit_price（單價）</li>
        </ul>

        <p style={{ marginTop: '15px', color: '#718096' }}>
          註：系統會自動識別中文和英文欄位名稱，並統一處理
        </p>
      </div>
    </div>
  );
}

export default OrderImport;
