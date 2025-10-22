import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getById(id);
      setOrder(response.data);
      setFormData({
        customer_name: response.data.customer_name,
        customer_email: response.data.customer_email || '',
        customer_phone: response.data.customer_phone || '',
        customer_address: response.data.customer_address || '',
        status: response.data.status,
        notes: response.data.notes || '',
      });
      setError(null);
    } catch (err) {
      setError('無法載入訂單詳情');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await orderAPI.update(id, formData);
      await fetchOrder();
      setEditing(false);
      alert('訂單更新成功');
    } catch (err) {
      alert('更新訂單失敗');
      console.error('Error updating order:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('確定要刪除此訂單嗎？')) return;

    try {
      await orderAPI.delete(id);
      alert('訂單已刪除');
      navigate('/orders');
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
  if (error) return <div className="error">{error}</div>;
  if (!order) return <div className="error">找不到訂單</div>;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/orders')} className="btn btn-secondary">
          ← 返回列表
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>訂單詳情</h2>
          <div>
            {!editing ? (
              <>
                <button onClick={() => setEditing(true)} className="btn btn-primary" style={{ marginRight: '10px' }}>
                  編輯
                </button>
                <button onClick={handleDelete} className="btn btn-danger">
                  刪除
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(false)} className="btn btn-secondary">
                取消編輯
              </button>
            )}
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>客戶名稱 *</label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label>客戶信箱</label>
              <input
                type="email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>客戶電話</label>
              <input
                type="text"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>客戶地址</label>
              <textarea
                name="customer_address"
                value={formData.customer_address}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>訂單狀態 *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                <option value="pending">待處理</option>
                <option value="processing">處理中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>

            <div className="form-group">
              <label>備註</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
              />
            </div>

            <button type="submit" className="btn btn-success">
              儲存變更
            </button>
          </form>
        ) : (
          <div>
            <table style={{ width: '100%', marginBottom: '30px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold', width: '200px' }}>訂單號碼：</td>
                  <td style={{ padding: '10px' }}>{order.order_number}</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>客戶名稱：</td>
                  <td style={{ padding: '10px' }}>{order.customer_name}</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>客戶信箱：</td>
                  <td style={{ padding: '10px' }}>{order.customer_email || '-'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>客戶電話：</td>
                  <td style={{ padding: '10px' }}>{order.customer_phone || '-'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>客戶地址：</td>
                  <td style={{ padding: '10px' }}>{order.customer_address || '-'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>訂單日期：</td>
                  <td style={{ padding: '10px' }}>{formatDate(order.order_date)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>訂單狀態：</td>
                  <td style={{ padding: '10px' }}>{getStatusBadge(order.status)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>總金額：</td>
                  <td style={{ padding: '10px' }}>
                    {order.currency} {parseFloat(order.total_amount).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>來源：</td>
                  <td style={{ padding: '10px' }}>{order.source === 'import' ? '匯入' : '手動'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>備註：</td>
                  <td style={{ padding: '10px' }}>{order.notes || '-'}</td>
                </tr>
              </tbody>
            </table>

            <h3 style={{ marginBottom: '15px' }}>訂單項目</h3>
            {order.items && order.items.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>商品名稱</th>
                    <th>商品編號</th>
                    <th>數量</th>
                    <th>單價</th>
                    <th>小計</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>{item.product_sku || '-'}</td>
                      <td>{item.quantity}</td>
                      <td>NT$ {parseFloat(item.unit_price).toLocaleString()}</td>
                      <td>NT$ {parseFloat(item.subtotal).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#718096' }}>此訂單沒有項目</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderDetail;
