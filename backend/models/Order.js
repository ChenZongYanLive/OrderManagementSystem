import pool from '../config/database.js';

class Order {
  // Create new order with items
  static async create(orderData, items) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert order
      const orderQuery = `
        INSERT INTO orders (
          order_number, customer_id, customer_name, customer_email,
          customer_phone, customer_address, order_date, status,
          total_amount, currency, notes, source, import_batch_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;
      const orderValues = [
        orderData.order_number,
        orderData.customer_id || null,
        orderData.customer_name,
        orderData.customer_email || null,
        orderData.customer_phone || null,
        orderData.customer_address || null,
        orderData.order_date || new Date(),
        orderData.status || 'pending',
        orderData.total_amount || 0,
        orderData.currency || 'TWD',
        orderData.notes || null,
        orderData.source || 'manual',
        orderData.import_batch_id || null,
      ];

      const orderResult = await client.query(orderQuery, orderValues);
      const order = orderResult.rows[0];

      // Insert order items
      if (items && items.length > 0) {
        for (const item of items) {
          const itemQuery = `
            INSERT INTO order_items (
              order_id, product_name, product_sku, quantity, unit_price, subtotal
            ) VALUES ($1, $2, $3, $4, $5, $6)
          `;
          const itemValues = [
            order.id,
            item.product_name,
            item.product_sku || null,
            item.quantity,
            item.unit_price,
            item.subtotal || (item.quantity * item.unit_price),
          ];
          await client.query(itemQuery, itemValues);
        }
      }

      await client.query('COMMIT');
      return await this.findById(order.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get all orders with pagination
  static async findAll(page = 1, limit = 20, filters = {}) {
    let query = `
      SELECT o.*,
             COUNT(*) OVER() as total_count,
             COALESCE(json_agg(
               json_build_object(
                 'id', oi.id,
                 'product_name', oi.product_name,
                 'product_sku', oi.product_sku,
                 'quantity', oi.quantity,
                 'unit_price', oi.unit_price,
                 'subtotal', oi.subtotal
               )
             ) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;

    const conditions = [];
    const values = [];
    let valueIndex = 1;

    if (filters.status) {
      conditions.push(`o.status = $${valueIndex++}`);
      values.push(filters.status);
    }

    if (filters.search) {
      conditions.push(`(o.order_number ILIKE $${valueIndex} OR o.customer_name ILIKE $${valueIndex})`);
      values.push(`%${filters.search}%`);
      valueIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;

    const offset = (page - 1) * limit;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    return {
      orders: result.rows,
      total: result.rows[0]?.total_count || 0,
      page,
      limit,
      totalPages: Math.ceil((result.rows[0]?.total_count || 0) / limit),
    };
  }

  // Get order by ID
  static async findById(id) {
    const query = `
      SELECT o.*,
             COALESCE(json_agg(
               json_build_object(
                 'id', oi.id,
                 'product_name', oi.product_name,
                 'product_sku', oi.product_sku,
                 'quantity', oi.quantity,
                 'unit_price', oi.unit_price,
                 'subtotal', oi.subtotal
               )
             ) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Update order
  static async update(id, orderData) {
    const query = `
      UPDATE orders
      SET customer_name = COALESCE($1, customer_name),
          customer_email = COALESCE($2, customer_email),
          customer_phone = COALESCE($3, customer_phone),
          customer_address = COALESCE($4, customer_address),
          status = COALESCE($5, status),
          notes = COALESCE($6, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;

    const values = [
      orderData.customer_name,
      orderData.customer_email,
      orderData.customer_phone,
      orderData.customer_address,
      orderData.status,
      orderData.notes,
      id,
    ];

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Delete order
  static async delete(id) {
    const query = 'DELETE FROM orders WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Get order statistics
  static async getStatistics() {
    const query = `
      SELECT
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
        COUNT(*) FILTER (WHERE status = 'processing') as processing_orders,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
        COALESCE(SUM(total_amount) FILTER (WHERE status != 'cancelled'), 0) as total_revenue
      FROM orders
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }
}

export default Order;
