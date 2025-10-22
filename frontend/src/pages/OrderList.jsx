import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });

  useEffect(() => {
    fetchOrders();
  }, [page, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...filters,
      };
      const response = await orderAPI.getAll(params);
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError('無法載入訂單列表');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('確定要刪除此訂單嗎？')) return;

    try {
      await orderAPI.delete(id);
      fetchOrders();
    } catch (err) {
      alert('刪除訂單失敗');
      console.error('Error deleting order:', err);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: 'badge-pending', text: '待處理' },
      processing: { class: 'badge-processing', text: '處理中' },
      completed: { class: 'badge-completed', text: '已完成' },
      cancelled: { class: 'badge-cancelled', text: '已取消' },
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
        <h2>訂單列表</h2>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            name="search"
            placeholder="搜尋訂單號碼或客戶名稱..."
            value={filters.search}
            onChange={handleFilterChange}
            className="form-control"
            style={{ flex: 1 }}
          />
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="form-control"
            style={{ width: '200px' }}
          >
            <option value="">所有狀態</option>
            <option value="pending">待處理</option>
            <option value="processing">處理中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>

        {error && <div className="error">{error}</div>}

        {orders.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            沒有找到訂單
          </p>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>訂單號碼</th>
                  <th>客戶名稱</th>
                  <th>訂單日期</th>
                  <th>狀態</th>
                  <th>總金額</th>
                  <th>來源</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link to={`/orders/${order.id}`} style={{ color: '#667eea', textDecoration: 'none' }}>
                        {order.order_number}
                      </Link>
                    </td>
                    <td>{order.customer_name}</td>
                    <td>{formatDate(order.order_date)}</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>NT$ {parseFloat(order.total_amount).toLocaleString()}</td>
                    <td>{order.source === 'import' ? '匯入' : '手動'}</td>
                    <td>
                      <Link to={`/orders/${order.id}`} className="btn btn-primary" style={{ marginRight: '5px', fontSize: '12px', padding: '6px 12px' }}>
                        檢視
                      </Link>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="btn btn-danger"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        刪除
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
    </div>
  );
}

export default OrderList;
