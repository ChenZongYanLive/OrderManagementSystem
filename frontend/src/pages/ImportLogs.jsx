import React, { useState, useEffect } from 'react';
import { importAPI } from '../services/api';

function ImportLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      const response = await importAPI.getLogs(params);
      setLogs(response.data.logs);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError('無法載入匯入記錄');
      console.error('Error fetching import logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const showLogDetails = async (batchId) => {
    try {
      const response = await importAPI.getLogByBatchId(batchId);
      setSelectedLog(response.data);
    } catch (err) {
      alert('無法載入詳細記錄');
      console.error('Error fetching log details:', err);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      processing: { class: 'badge-processing', text: '處理中' },
      completed: { class: 'badge-completed', text: '完成' },
      completed_with_errors: { class: 'badge-pending', text: '部分成功' },
      failed: { class: 'badge-cancelled', text: '失敗' },
    };
    const statusInfo = statusMap[status] || { class: '', text: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-TW');
  };

  if (loading) return <div className="loading">載入中...</div>;

  return (
    <div>
      <div className="card">
        <h2>匯入記錄</h2>

        {error && <div className="error">{error}</div>}

        {logs.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            沒有匯入記錄
          </p>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>批次 ID</th>
                  <th>檔案名稱</th>
                  <th>檔案類型</th>
                  <th>總記錄數</th>
                  <th>成功</th>
                  <th>失敗</th>
                  <th>狀態</th>
                  <th>匯入時間</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                      {log.batch_id.substring(0, 8)}...
                    </td>
                    <td>{log.file_name}</td>
                    <td>{log.file_type.toUpperCase()}</td>
                    <td>{log.total_records}</td>
                    <td style={{ color: '#48bb78', fontWeight: 'bold' }}>{log.success_count}</td>
                    <td style={{ color: '#f56565', fontWeight: 'bold' }}>{log.error_count}</td>
                    <td>{getStatusBadge(log.status)}</td>
                    <td>{formatDate(log.created_at)}</td>
                    <td>
                      <button
                        onClick={() => showLogDetails(log.batch_id)}
                        className="btn btn-primary"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        詳情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                上一頁
              </button>
              <span style={{ padding: '8px 12px' }}>
                第 {page} / {totalPages} 頁
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                下一頁
              </button>
            </div>
          </>
        )}
      </div>

      {selectedLog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="card"
            style={{ maxWidth: '800px', maxHeight: '80vh', overflow: 'auto', margin: '20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>匯入記錄詳情</h2>

            <table style={{ width: '100%', marginTop: '20px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold', width: '150px' }}>批次 ID：</td>
                  <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '12px' }}>
                    {selectedLog.batch_id}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>檔案名稱：</td>
                  <td style={{ padding: '10px' }}>{selectedLog.file_name}</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>檔案類型：</td>
                  <td style={{ padding: '10px' }}>{selectedLog.file_type.toUpperCase()}</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>總記錄數：</td>
                  <td style={{ padding: '10px' }}>{selectedLog.total_records}</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>成功筆數：</td>
                  <td style={{ padding: '10px', color: '#48bb78', fontWeight: 'bold' }}>
                    {selectedLog.success_count}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>失敗筆數：</td>
                  <td style={{ padding: '10px', color: '#f56565', fontWeight: 'bold' }}>
                    {selectedLog.error_count}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>狀態：</td>
                  <td style={{ padding: '10px' }}>{getStatusBadge(selectedLog.status)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>匯入時間：</td>
                  <td style={{ padding: '10px' }}>{formatDate(selectedLog.created_at)}</td>
                </tr>
              </tbody>
            </table>

            {selectedLog.error_details && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ marginBottom: '10px' }}>錯誤詳情：</h3>
                <div
                  style={{
                    backgroundColor: '#f7fafc',
                    padding: '15px',
                    borderRadius: '4px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                  }}
                >
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                    {JSON.stringify(JSON.parse(selectedLog.error_details), null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button onClick={() => setSelectedLog(null)} className="btn btn-secondary">
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportLogs;
