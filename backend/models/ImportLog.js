import pool from '../config/database.js';

class ImportLog {
  // Create import log
  static async create(logData) {
    const query = `
      INSERT INTO import_logs (
        batch_id, file_name, file_type, total_records,
        success_count, error_count, status, error_details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      logData.batch_id,
      logData.file_name,
      logData.file_type,
      logData.total_records || 0,
      logData.success_count || 0,
      logData.error_count || 0,
      logData.status || 'processing',
      logData.error_details || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update import log
  static async update(batchId, updateData) {
    const query = `
      UPDATE import_logs
      SET success_count = COALESCE($1, success_count),
          error_count = COALESCE($2, error_count),
          status = COALESCE($3, status),
          error_details = COALESCE($4, error_details)
      WHERE batch_id = $5
      RETURNING *
    `;

    const values = [
      updateData.success_count,
      updateData.error_count,
      updateData.status,
      updateData.error_details,
      batchId,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get all import logs
  static async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT *, COUNT(*) OVER() as total_count
      FROM import_logs
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);

    return {
      logs: result.rows,
      total: result.rows[0]?.total_count || 0,
      page,
      limit,
      totalPages: Math.ceil((result.rows[0]?.total_count || 0) / limit),
    };
  }

  // Get import log by batch ID
  static async findByBatchId(batchId) {
    const query = 'SELECT * FROM import_logs WHERE batch_id = $1';
    const result = await pool.query(query, [batchId]);
    return result.rows[0] || null;
  }
}

export default ImportLog;
