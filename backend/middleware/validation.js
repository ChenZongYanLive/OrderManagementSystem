import { ORDER_STATUS } from '../config/constants.js';

// Validate order creation
export const validateOrderCreation = (req, res, next) => {
  const { orderData, items } = req.body;

  const errors = [];

  // Validate orderData
  if (!orderData) {
    errors.push('orderData is required');
  } else {
    if (!orderData.customer_name || orderData.customer_name.trim() === '') {
      errors.push('customer_name is required');
    }

    if (orderData.customer_name && orderData.customer_name.length > 255) {
      errors.push('customer_name must be less than 255 characters');
    }

    if (orderData.customer_email && !isValidEmail(orderData.customer_email)) {
      errors.push('customer_email must be a valid email address');
    }

    if (orderData.customer_phone && orderData.customer_phone.length > 50) {
      errors.push('customer_phone must be less than 50 characters');
    }

    if (orderData.status && !Object.values(ORDER_STATUS).includes(orderData.status)) {
      errors.push(`status must be one of: ${Object.values(ORDER_STATUS).join(', ')}`);
    }

    if (orderData.total_amount && (isNaN(orderData.total_amount) || orderData.total_amount < 0)) {
      errors.push('total_amount must be a positive number');
    }
  }

  // Validate items
  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('items must be a non-empty array');
  } else {
    items.forEach((item, index) => {
      if (!item.product_name || item.product_name.trim() === '') {
        errors.push(`item[${index}].product_name is required`);
      }

      if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
        errors.push(`item[${index}].quantity must be a positive number`);
      }

      if (!item.unit_price || isNaN(item.unit_price) || item.unit_price < 0) {
        errors.push(`item[${index}].unit_price must be a non-negative number`);
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
};

// Validate order update
export const validateOrderUpdate = (req, res, next) => {
  const errors = [];
  const updateData = req.body;

  if (Object.keys(updateData).length === 0) {
    errors.push('No update data provided');
  }

  if (updateData.customer_name !== undefined) {
    if (typeof updateData.customer_name !== 'string' || updateData.customer_name.trim() === '') {
      errors.push('customer_name must be a non-empty string');
    }
    if (updateData.customer_name.length > 255) {
      errors.push('customer_name must be less than 255 characters');
    }
  }

  if (updateData.customer_email !== undefined && updateData.customer_email !== null) {
    if (!isValidEmail(updateData.customer_email)) {
      errors.push('customer_email must be a valid email address');
    }
  }

  if (updateData.status !== undefined && !Object.values(ORDER_STATUS).includes(updateData.status)) {
    errors.push(`status must be one of: ${Object.values(ORDER_STATUS).join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
};

// Validate ID parameter
export const validateId = (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
    return res.status(400).json({ error: 'Invalid ID parameter' });
  }

  req.params.id = parseInt(id);
  next();
};

// Validate pagination parameters
export const validatePagination = (req, res, next) => {
  const errors = [];

  if (req.query.page !== undefined) {
    const page = parseInt(req.query.page);
    if (isNaN(page) || page < 1) {
      errors.push('page must be a positive integer');
    }
    req.query.page = page;
  }

  if (req.query.limit !== undefined) {
    const limit = parseInt(req.query.limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      errors.push('limit must be between 1 and 100');
    }
    req.query.limit = limit;
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
};

// Helper function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize string input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};
