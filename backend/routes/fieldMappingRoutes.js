import express from 'express';
import upload from '../middleware/upload.js';
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  setDefaultTemplate,
  previewFile,
  getSystemFields,
} from '../controllers/fieldMappingController.js';

const router = express.Router();

// Field mapping templates
router.get('/templates', getAllTemplates);
router.get('/templates/:id', getTemplateById);
router.post('/templates', createTemplate);
router.put('/templates/:id', updateTemplate);
router.delete('/templates/:id', deleteTemplate);
router.post('/templates/:id/set-default', setDefaultTemplate);

// File preview
router.post('/preview', upload.single('file'), previewFile);

// System field definitions
router.get('/system-fields', getSystemFields);

export default router;
