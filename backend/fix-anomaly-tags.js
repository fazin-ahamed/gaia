// Fix anomaly tags column type
require('dotenv').config();
const { Sequelize } = require('sequelize');

async function fixAnomalyTags() {
  console.log('Fixing anomaly tags column...');

  // Set NODE_TLS_REJECT_UNAUTHORIZED for SSL
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        logging: false
      })
    : new Sequelize({
        dialect: process.env.DB_DIALECT || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'gaia_db',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        logging: false
      });

  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Check if anomalies table exists
    const [tables] = await sequelize.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'anomalies';"
    ).catch(() => [[]]);

    if (!tables || tables.length === 0) {
      console.log('✓ Anomalies table does not exist, no fix needed');
      await sequelize.close();
      return;
    }

    // Drop the GIN index if it exists
    try {
      await sequelize.query('DROP INDEX IF EXISTS anomalies_tags;');
      console.log('✓ Dropped anomalies_tags index');
    } catch (error) {
      console.log('Index does not exist or already dropped');
    }

    // Check if tags column exists and its type
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'anomalies' AND column_name = 'tags';
    `);

    if (columns.length > 0 && columns[0].data_type !== 'jsonb') {
      console.log(`Current tags column type: ${columns[0].data_type}`);
      console.log('Converting tags column to JSONB...');
      
      // Convert TEXT to JSONB with proper USING clause
      await sequelize.query(`
        ALTER TABLE anomalies 
        ALTER COLUMN tags TYPE JSONB USING 
        CASE 
          WHEN tags IS NULL THEN '[]'::jsonb
          WHEN tags = '' THEN '[]'::jsonb
          WHEN tags::text ~ '^\\[.*\\]$' THEN tags::jsonb
          ELSE ('["' || tags || '"]')::jsonb
        END;
      `);
      console.log('✓ Converted tags column to JSONB');
      
      // Set default
      await sequelize.query(`
        ALTER TABLE anomalies ALTER COLUMN tags SET DEFAULT '[]'::jsonb;
      `);
      console.log('✓ Set default value');
    } else {
      console.log('✓ Tags column is already JSONB or does not exist');
    }

    console.log('\n✅ Anomaly tags fix completed successfully!');

  } catch (error) {
    console.error('❌ Error fixing anomaly tags:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixAnomalyTags()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fix failed:', error);
    process.exit(1);
  });
