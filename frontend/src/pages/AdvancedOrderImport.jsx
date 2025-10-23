import React, { useState, useEffect } from 'react';
import { fieldMappingAPI, importAPI } from '../services/api';

function AdvancedOrderImport() {
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview & Map, 3: Import
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [fieldMapping, setFieldMapping] = useState({});
  const [systemFields, setSystemFields] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    fetchSystemFields();
    fetchTemplates();
  }, []);

  const fetchSystemFields = async () => {
    try {
      const response = await fieldMappingAPI.getSystemFields();
      setSystemFields(response.data);
    } catch (err) {
      console.error('Error fetching system fields:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fieldMappingAPI.getTemplates();
      setTemplates(response.data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
    setImportResult(null);
  };

  const handlePreview = async () => {
    if (!file) {
      alert('請選擇檔案');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fieldMappingAPI.previewFile(file);
      setPreviewData(response.data);

      // Initialize field mapping with suggested mappings
      setFieldMapping(response.data.suggestedMappings || {});

      // Set default template if available
      if (response.data.defaultTemplate) {
        setSelectedTemplate(response.data.defaultTemplate);
        setFieldMapping(response.data.defaultTemplate.mapping_config || {});
      }

      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || '檔案預覽失敗');
      console.error('Error previewing file:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = (sourceField, targetField) => {
    setFieldMapping((prev) => ({
      ...prev,
      [sourceField]: targetField,
    }));
  };

  const handleApplyTemplate = (template) => {
    setSelectedTemplate(template);
    setFieldMapping(template.mapping_config || {});
  };

  const handleSaveTemplate = async () => {
    if (!templateName) {
      alert('請輸入模板名稱');
      return;
    }

    try {
      setLoading(true);
      await fieldMappingAPI.createTemplate({
        name: templateName,
        description: `${previewData.fileType.toUpperCase()} 匯入模板`,
        file_type: previewData.fileType,
        mapping_config: fieldMapping,
      });
      alert('模板儲存成功');
      setTemplateName('');
      fetchTemplates();
    } catch (err) {
      alert(err.response?.data?.error || '儲存模板失敗');
      console.error('Error saving template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Import with field mapping
      const response = await importAPI.uploadFileWithMapping(
        previewData.tempFilePath,
        previewData.fileName,
        previewData.fileType,
        fieldMapping
      );
      setImportResult(response.data);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || '匯入失敗');
      console.error('Error importing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setFile(null);
    setPreviewData(null);
    setFieldMapping({});
    setSelectedTemplate(null);
    setError(null);
    setImportResult(null);
  };

  // Step 1: Upload File
  if (step === 1) {
    return (
      <div>
        <div className="card">
          <h2>進階訂單匯入</h2>
          <p style={{ marginBottom: '20px', color: '#718096' }}>
            上傳檔案並設定欄位映射規則
          </p>

          <div style={{ marginBottom: '20px' }}>
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".csv,.xlsx,.xls,.json"
              className="form-control"
            />
          </div>

          {file && (
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f7fafc', borderRadius: '4px' }}>
              <p><strong>已選擇檔案：</strong>{file.name}</p>
              <p><strong>檔案大小：</strong>{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          )}

          {error && <div className="error">{error}</div>}

          <div style={{ marginTop: '20px' }}>
            <button
              onClick={handlePreview}
              disabled={!file || loading}
              className="btn btn-primary"
            >
              {loading ? '處理中...' : '下一步：預覽與映射'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Preview & Field Mapping
  if (step === 2 && previewData) {
    return (
      <div>
        <div className="card">
          <h2>欄位映射設定</h2>
          <p style={{ marginBottom: '20px', color: '#718096' }}>
            設定源檔案欄位與系統欄位的對應關係
          </p>

          {/* Template Selection */}
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>使用現有模板</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {templates
                .filter((t) => t.file_type === previewData.fileType)
                .map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleApplyTemplate(template)}
                    className={`btn ${selectedTemplate?.id === template.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '14px', padding: '8px 16px' }}
                  >
                    {template.name}
                    {template.is_default && ' (預設)'}
                  </button>
                ))}
            </div>
          </div>

          {/* File Preview */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>檔案預覽</h3>
            <p><strong>檔案名稱：</strong>{previewData.fileName}</p>
            <p><strong>檔案類型：</strong>{previewData.fileType.toUpperCase()}</p>
            <p><strong>偵測到欄位：</strong>{previewData.headers.length} 個</p>

            <div style={{ marginTop: '15px', maxHeight: '200px', overflow: 'auto', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
              <table className="table" style={{ marginBottom: 0 }}>
                <thead>
                  <tr>
                    {previewData.headers.map((header, idx) => (
                      <th key={idx}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.preview.map((row, idx) => (
                    <tr key={idx}>
                      {previewData.headers.map((header, colIdx) => (
                        <td key={colIdx}>{row[header]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Field Mapping */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>欄位映射</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {previewData.headers.map((header, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1, padding: '10px', backgroundColor: '#edf2f7', borderRadius: '4px' }}>
                    <strong>{header}</strong>
                    <div style={{ fontSize: '12px', color: '#718096' }}>
                      ({previewData.fieldTypes[header] || 'string'})
                    </div>
                  </div>
                  <div style={{ fontSize: '20px', color: '#718096' }}>→</div>
                  <select
                    value={fieldMapping[header] || ''}
                    onChange={(e) => handleMappingChange(header, e.target.value)}
                    className="form-control"
                    style={{ flex: 1 }}
                  >
                    <option value="">忽略此欄位</option>
                    <optgroup label="訂單欄位">
                      {systemFields &&
                        Object.entries(systemFields.order).map(([key, field]) => (
                          <option key={key} value={key}>
                            {field.label} {field.required && '*'}
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="商品欄位">
                      {systemFields &&
                        Object.entries(systemFields.item).map(([key, field]) => (
                          <option key={key} value={key}>
                            {field.label} {field.required && '*'}
                          </option>
                        ))}
                    </optgroup>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Save Template */}
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>儲存為新模板</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="輸入模板名稱..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="form-control"
                style={{ flex: 1 }}
              />
              <button
                onClick={handleSaveTemplate}
                disabled={!templateName || loading}
                className="btn btn-success"
              >
                儲存模板
              </button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={() => setStep(1)} className="btn btn-secondary">
              上一步
            </button>
            <button
              onClick={handleImport}
              disabled={loading}
              className="btn btn-success"
            >
              {loading ? '匯入中...' : '開始匯入'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Import Result
  if (step === 3 && importResult) {
    return (
      <div>
        <div className="card">
          <h2>匯入完成</h2>

          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div>
                <p style={{ color: '#718096', marginBottom: '5px' }}>總記錄數</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748' }}>
                  {importResult.totalRecords}
                </p>
              </div>
              <div>
                <p style={{ color: '#718096', marginBottom: '5px' }}>成功匯入</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#48bb78' }}>
                  {importResult.successCount}
                </p>
              </div>
              <div>
                <p style={{ color: '#718096', marginBottom: '5px' }}>失敗筆數</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f56565' }}>
                  {importResult.errorCount}
                </p>
              </div>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ marginBottom: '10px', color: '#742a2a' }}>錯誤詳情：</h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
                  {importResult.errors.map((err, index) => (
                    <div key={index} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                      <p><strong>第 {err.row} 列：</strong></p>
                      <p style={{ color: '#e53e3e' }}>{err.error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '20px' }}>
            <button onClick={handleReset} className="btn btn-primary">
              繼續匯入其他檔案
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default AdvancedOrderImport;
