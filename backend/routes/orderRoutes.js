import express from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderStatistics,
} from '../controllers/orderController.js';
import {
  validateOrderCreation,
  validateOrderUpdate,
  validateId,
  validatePagination,
} from '../middleware/validation.js';

const router = express.Router();

router.get('/', validatePagination, getAllOrders);
router.get('/statistics', getOrderStatistics);
router.get('/:id', validateId, getOrderById);
router.post('/', validateOrderCreation, createOrder);
router.put('/:id', validateId, validateOrderUpdate, updateOrder);
router.delete('/:id', validateId, deleteOrder);

export default router;
