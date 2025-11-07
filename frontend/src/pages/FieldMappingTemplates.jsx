import React, { useState, useEffect } from 'react';
import { fieldMappingAPI } from '../services/api';

function FieldMappingTemplates() {
  const [templates, setTemplates] = useState([]);
  const [systemFields, setSystemFields] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
    fetchSystemFields();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fieldMappingAPI.getTemplates();
      setTemplates(response.data);
      setError(null);
    } catch (err) {
      setError('無法載入模板列表');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemFields = async () => {
    try {
      const response = await fieldMappingAPI.getSystemFields();
      setSystemFields(response.data);
    } catch (err) {
      console.error('Error fetching system fields:', err);
    }
  };

  const handleView = async (id) => {
    try {
      const response = await fieldMappingAPI.getTemplateById(id);
      setSelectedTemplate(response.data);
    } catch (err) {
      alert('無法載入模板詳情');
      console.error('Error fetching template:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('確定要刪除此模板嗎？')) return;

    try {
      await fieldMappingAPI.deleteTemplate(id);
      fetchTemplates();
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
      }
    } catch (err) {
      alert('刪除模板失敗');
      console.error('Error deleting template:', err);
    }
  };

  const handleSetDefault = async (id, fileType) => {
    try {
      await fieldMappingAPI.setDefaultTemplate(id, fileType);
      fetchTemplates();
      alert('已設為預設模板');
    } catch (err) {
      alert('設定預設模板失敗');
      console.error('Error setting default template:', err);
    }
  };

  const getFieldLabel = (fieldName) => {
    if (!systemFields) return fieldName;

    if (systemFields.order[fieldName]) {
      return systemFields.order[fieldName].label;
    }

    if (systemFields.item[fieldName]) {
      return systemFields.item[fieldName].label;
    }

    return fieldName;
  };

  if (loading) return <div className="loading">載入中...</div>;

  return (
    <div>
      <div className="card">
        <h2>欄位映射模板管理</h2>
        <p style={{ marginBottom: '20px', color: '#718096' }}>
          管理您的欄位映射模板，提高匯入效率
        </p>

        {error && <div className="error">{error}</div>}

        {templates.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            尚無映射模板
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>模板名稱</th>
                <th>描述</th>
                <th>檔案類型</th>
                <th>預設</th>
                <th>創建時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id}>
                  <td><strong>{template.name}</strong></td>
                  <td>{template.description || '-'}</td>
                  <td>{template.file_type.toUpperCase()}</td>
                  <td>
                    {template.is_default ? (
                      <span className="badge badge-completed">是</span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(template.id, template.file_type)}
                        className="btn btn-secondary"
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        設為預設
                      </button>
                    )}
                  </td>
                  <td>{new Date(template.created_at).toLocaleString('zh-TW')}</td>
                  <td>
                    <button
                      onClick={() => handleView(template.id)}
                      className="btn btn-primary"
                      style={{ marginRight: '5px', fontSize: '12px', padding: '6px 12px' }}
                    >
                      檢視
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
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
        )}
      </div>

      {selectedTemplate && (
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
          onClick={() => setSelectedTemplate(null)}
        >
          <div
            className="card"
            style={{ maxWidth: '800px', maxHeight: '80vh', overflow: 'auto', margin: '20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>模板詳情</h2>

            <table style={{ width: '100%', marginTop: '20px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold', width: '150px' }}>模板名稱：</td>
                  <td style={{ padding: '10px' }}>{selectedTemplate.name}</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>描述：</td>
                  <td style={{ padding: '10px' }}>{selectedTemplate.description || '-'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>檔案類型：</td>
                  <td style={{ padding: '10px' }}>{selectedTemplate.file_type.toUpperCase()}</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>預設模板：</td>
                  <td style={{ padding: '10px' }}>{selectedTemplate.is_default ? '是' : '否'}</td>
                </tr>
              </tbody>
            </table>

            <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>欄位映射規則</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>源欄位</th>
                    <th>映射到</th>
                    <th>系統欄位名稱</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(selectedTemplate.mapping_config || {}).map(
                    ([sourceField, targetField]) =>
                      targetField && (
                        <tr key={sourceField}>
                          <td><strong>{sourceField}</strong></td>
                          <td>→</td>
                          <td>
                            {getFieldLabel(targetField)}
                            <div style={{ fontSize: '12px', color: '#718096' }}>
                              ({targetField})
                            </div>
                          </td>
                        </tr>
                      )
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button onClick={() => setSelectedTemplate(null)} className="btn btn-secondary">
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FieldMappingTemplates;
