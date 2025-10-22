import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getStatistics();
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError('無法載入統計資料');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">載入中...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="card">
        <h2>訂單統計概覽</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>總訂單數</h3>
            <p>{stats?.total_orders || 0}</p>
          </div>

          <div className="stat-card">
            <h3>待處理</h3>
            <p>{stats?.pending_orders || 0}</p>
          </div>

          <div className="stat-card">
            <h3>處理中</h3>
            <p>{stats?.processing_orders || 0}</p>
          </div>

          <div className="stat-card">
            <h3>已完成</h3>
            <p>{stats?.completed_orders || 0}</p>
          </div>

          <div className="stat-card">
            <h3>已取消</h3>
            <p>{stats?.cancelled_orders || 0}</p>
          </div>

          <div className="stat-card">
            <h3>總營收</h3>
            <p>NT$ {parseFloat(stats?.total_revenue || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>快速操作</h2>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <Link to="/orders" className="btn btn-primary">查看所有訂單</Link>
          <Link to="/import" className="btn btn-success">匯入訂單</Link>
          <Link to="/import-logs" className="btn btn-secondary">查看匯入記錄</Link>
        </div>
      </div>

      <div className="card">
        <h2>系統功能</h2>
        <ul style={{ lineHeight: '2', marginLeft: '20px' }}>
          <li>完整的訂單 CRUD 操作（新增、查詢、更新、刪除）</li>
          <li>支援多種格式訂單匯入：CSV、Excel (.xlsx, .xls)、JSON</li>
          <li>自動識別並統一不同格式的訂單資料</li>
          <li>訂單狀態追蹤：待處理、處理中、已完成、已取消</li>
          <li>訂單統計分析與報表</li>
          <li>匯入記錄追蹤與錯誤日誌</li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
