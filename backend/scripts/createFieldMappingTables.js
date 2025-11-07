import pool from '../config/database.js';

const createFieldMappingTables = async () => {
  const client = await pool.connect();

  try {
    console.log('Creating field mapping tables...');

    // Create field_mapping_templates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS field_mapping_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        file_type VARCHAR(50) NOT NULL,
        mapping_config JSONB NOT NULL,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Field mapping templates table created');

    // Create index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_field_mapping_templates_name ON field_mapping_templates(name);
      CREATE INDEX IF NOT EXISTS idx_field_mapping_templates_file_type ON field_mapping_templates(file_type);
    `);
    console.log('✓ Indexes created');

    console.log('\n✅ Field mapping tables initialization completed successfully!');
  } catch (error) {
    console.error('❌ Error creating field mapping tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createFieldMappingTables()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      pool.end();
      process.exit(1);
    });
}

export default createFieldMappingTables;
