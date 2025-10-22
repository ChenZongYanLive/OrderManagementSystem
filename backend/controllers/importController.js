import OrderImportService from '../services/orderImportService.js';
import ImportLog from '../models/ImportLog.js';

export const importOrders = async (req, res) => {
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
      return res.status(400).json({ error: 'Unsupported file type. Please upload CSV, Excel, or JSON file.' });
    }

    const result = await OrderImportService.importOrders(path, originalname, fileType);

    res.json({
      message: 'Import completed',
      ...result,
    });
  } catch (error) {
    console.error('Error importing orders:', error);
    res.status(500).json({ error: error.message || 'Failed to import orders' });
  }
};

export const getImportLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await ImportLog.findAll(page, limit);
    res.json(result);
  } catch (error) {
    console.error('Error fetching import logs:', error);
    res.status(500).json({ error: 'Failed to fetch import logs' });
  }
};

export const getImportLogByBatchId = async (req, res) => {
  try {
    const { batchId } = req.params;
    const log = await ImportLog.findByBatchId(batchId);

    if (!log) {
      return res.status(404).json({ error: 'Import log not found' });
    }

    res.json(log);
  } catch (error) {
    console.error('Error fetching import log:', error);
    res.status(500).json({ error: 'Failed to fetch import log' });
  }
};
