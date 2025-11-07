import pool from '../config/database.js';

class FieldMapping {
  // Create field mapping template
  static async create(templateData) {
    const query = `
      INSERT INTO field_mapping_templates (
        name, description, file_type, mapping_config, is_default
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      templateData.name,
      templateData.description || null,
      templateData.file_type,
      JSON.stringify(templateData.mapping_config),
      templateData.is_default || false,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get all templates
  static async findAll(fileType = null) {
    let query = 'SELECT * FROM field_mapping_templates';
    const values = [];

    if (fileType) {
      query += ' WHERE file_type = $1';
      values.push(fileType);
    }

    query += ' ORDER BY is_default DESC, name ASC';

    const result = await pool.query(query, values);
    return result.rows.map(row => ({
      ...row,
      mapping_config: row.mapping_config,
    }));
  }

  // Get template by ID
  static async findById(id) {
    const query = 'SELECT * FROM field_mapping_templates WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows[0]) {
      return {
        ...result.rows[0],
        mapping_config: result.rows[0].mapping_config,
      };
    }

    return null;
  }

  // Get template by name
  static async findByName(name) {
    const query = 'SELECT * FROM field_mapping_templates WHERE name = $1';
    const result = await pool.query(query, [name]);

    if (result.rows[0]) {
      return {
        ...result.rows[0],
        mapping_config: result.rows[0].mapping_config,
      };
    }

    return null;
  }

  // Get default template for file type
  static async findDefault(fileType) {
    const query = `
      SELECT * FROM field_mapping_templates
      WHERE file_type = $1 AND is_default = true
      LIMIT 1
    `;
    const result = await pool.query(query, [fileType]);

    if (result.rows[0]) {
      return {
        ...result.rows[0],
        mapping_config: result.rows[0].mapping_config,
      };
    }

    return null;
  }

  // Update template
  static async update(id, templateData) {
    const query = `
      UPDATE field_mapping_templates
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          mapping_config = COALESCE($3, mapping_config),
          is_default = COALESCE($4, is_default),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const values = [
      templateData.name,
      templateData.description,
      templateData.mapping_config ? JSON.stringify(templateData.mapping_config) : null,
      templateData.is_default,
      id,
    ];

    const result = await pool.query(query, values);

    if (result.rows[0]) {
      return {
        ...result.rows[0],
        mapping_config: result.rows[0].mapping_config,
      };
    }

    return null;
  }

  // Delete template
  static async delete(id) {
    const query = 'DELETE FROM field_mapping_templates WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Set as default
  static async setDefault(id, fileType) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Unset all defaults for this file type
      await client.query(
        'UPDATE field_mapping_templates SET is_default = false WHERE file_type = $1',
        [fileType]
      );

      // Set this template as default
      const result = await client.query(
        'UPDATE field_mapping_templates SET is_default = true WHERE id = $1 RETURNING *',
        [id]
      );

      await client.query('COMMIT');

      if (result.rows[0]) {
        return {
          ...result.rows[0],
          mapping_config: result.rows[0].mapping_config,
        };
      }

      return null;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default FieldMapping;
