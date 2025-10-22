import express from 'express';
import upload from '../middleware/upload.js';
import {
  importOrders,
  getImportLogs,
  getImportLogByBatchId,
} from '../controllers/importController.js';

const router = express.Router();

router.post('/upload', upload.single('file'), importOrders);
router.get('/logs', getImportLogs);
router.get('/logs/:batchId', getImportLogByBatchId);

export default router;
