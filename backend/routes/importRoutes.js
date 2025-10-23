import express from 'express';
import upload from '../middleware/upload.js';
import {
  importOrders,
  getImportLogs,
  getImportLogByBatchId,
  importOrdersWithMapping,
} from '../controllers/importController.js';

const router = express.Router();

router.post('/upload', upload.single('file'), importOrders);
router.post('/upload-with-mapping', importOrdersWithMapping);
router.get('/logs', getImportLogs);
router.get('/logs/:batchId', getImportLogByBatchId);

export default router;
