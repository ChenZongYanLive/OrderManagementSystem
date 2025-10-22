import Order from '../models/Order.js';

export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      status: req.query.status,
      search: req.query.search,
    };

    const result = await Order.findAll(page, limit, filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { orderData, items } = req.body;

    if (!orderData || !items || items.length === 0) {
      return res.status(400).json({ error: 'Order data and items are required' });
    }

    // Calculate total amount
    orderData.total_amount = items.reduce((sum, item) => {
      const subtotal = item.quantity * item.unit_price;
      item.subtotal = subtotal;
      return sum + subtotal;
    }, 0);

    const order = await Order.create(orderData, items);
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const orderData = req.body;

    const order = await Order.update(id, orderData);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.delete(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully', order });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};

export const getOrderStatistics = async (req, res) => {
  try {
    const stats = await Order.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};
