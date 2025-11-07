import FieldMapping from '../models/FieldMapping.js';
import FilePreviewService from '../services/filePreviewService.js';

// Get all field mapping templates
export const getAllTemplates = async (req, res) => {
  try {
    const { fileType } = req.query;
    const templates = await FieldMapping.findAll(fileType);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

// Get template by ID
export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await FieldMapping.findById(id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
};

// Create new template
export const createTemplate = async (req, res) => {
  try {
    const templateData = req.body;

    // Validate required fields
    if (!templateData.name || !templateData.file_type || !templateData.mapping_config) {
      return res.status(400).json({
        error: 'name, file_type, and mapping_config are required',
      });
    }

    const template = await FieldMapping.create(templateData);
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);

    if (error.code === '23505') {
      // Unique violation
      return res.status(409).json({ error: 'Template name already exists' });
    }

    res.status(500).json({ error: 'Failed to create template' });
  }
};

// Update template
export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const templateData = req.body;

    const template = await FieldMapping.update(id, templateData);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
};

// Delete template
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await FieldMapping.delete(id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ message: 'Template deleted successfully', template });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
};

// Set template as default
export const setDefaultTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { file_type } = req.body;

    if (!file_type) {
      return res.status(400).json({ error: 'file_type is required' });
    }

    const template = await FieldMapping.setDefault(id, file_type);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error setting default template:', error);
    res.status(500).json({ error: 'Failed to set default template' });
  }
};

// Preview file for field mapping
export const previewFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { path, originalname, mimetype } = req.file;

    // Determine file type
    let fileType = 'unknown';
    if (mimetype === 'text/csv' || originalname.endsWith('.csv')) {
      fileType = 'csv';
    } else if (mimetype === 'application/json' || originalname.endsWith('.json')) {
      fileType = 'json';
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimetype === 'application/vnd.ms-excel' ||
      originalname.endsWith('.xlsx') ||
      originalname.endsWith('.xls')
    ) {
      fileType = 'excel';
    } else {
      return res.status(400).json({
        error: 'Unsupported file type. Please upload CSV, Excel, or JSON file.',
      });
    }

    // Preview file
    const previewData = await FilePreviewService.previewFile(path, fileType, 5);

    // Detect field types
    const fieldTypes = FilePreviewService.detectFieldTypes(previewData.preview);

    // Get suggested mappings
    const suggestedMappings = FilePreviewService.getSuggestedMappings(previewData.headers);

    // Check if there's a default template for this file type
    const defaultTemplate = await FieldMapping.findDefault(fileType);

    res.json({
      fileName: originalname,
      fileType,
      ...previewData,
      fieldTypes,
      suggestedMappings,
      defaultTemplate: defaultTemplate || null,
      tempFilePath: path, // Keep temp file for actual import
    });
  } catch (error) {
    console.error('Error previewing file:', error);

    // Clean up temp file
    if (req.file && req.file.path) {
      const fs = await import('fs');
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    res.status(500).json({ error: error.message || 'Failed to preview file' });
  }
};

// Get system field definitions
export const getSystemFields = async (req, res) => {
  try {
    const systemFields = {
      order: {
        order_number: { label: '訂單號碼', type: 'string', required: false },
        customer_name: { label: '客戶名稱', type: 'string', required: true },
        customer_email: { label: '客戶信箱', type: 'string', required: false },
        customer_phone: { label: '客戶電話', type: 'string', required: false },
        customer_address: { label: '客戶地址', type: 'string', required: false },
        order_date: { label: '訂單日期', type: 'date', required: false },
        status: {
          label: '訂單狀態',
          type: 'enum',
          required: false,
          options: ['pending', 'processing', 'completed', 'cancelled'],
        },
        total_amount: { label: '總金額', type: 'number', required: false },
        currency: { label: '幣別', type: 'string', required: false },
        notes: { label: '備註', type: 'string', required: false },
      },
      item: {
        product_name: { label: '商品名稱', type: 'string', required: true },
        product_sku: { label: '商品編號', type: 'string', required: false },
        quantity: { label: '數量', type: 'number', required: true },
        unit_price: { label: '單價', type: 'number', required: true },
        subtotal: { label: '小計', type: 'number', required: false },
      },
    };

    res.json(systemFields);
  } catch (error) {
    console.error('Error fetching system fields:', error);
    res.status(500).json({ error: 'Failed to fetch system fields' });
  }
};
