// Fix workflow GIN index issue
require('dotenv').config();
const { Sequelize } = require('sequelize');

async function fixWorkflowIndex() {
  console.log('Fixing workflow GIN index...');

  const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        logging: console.log
      })
    : new Sequelize({
        dialect: process.env.DB_DIALECT || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'gaia_db',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        logging: console.log
      });

  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Drop the problematic GIN index if it exists
    try {
      await sequelize.query('DROP INDEX IF EXISTS workflows_tags;');
      console.log('✓ Dropped workflows_tags index');
    } catch (error) {
      console.log('Index does not exist or already dropped');
    }

    // Check if tags column needs to be converted to JSONB
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'workflows' AND column_name = 'tags';
    `);

    if (columns.length > 0 && columns[0].data_type !== 'jsonb') {
      console.log(`Current tags column type: ${columns[0].data_type}`);
      console.log('Converting tags column to JSONB...');
      
      // Convert TEXT to JSONB
      await sequelize.query(`
        ALTER TABLE workflows 
        ALTER COLUMN tags TYPE JSONB USING 
        CASE 
          WHEN tags IS NULL THEN '[]'::jsonb
          WHEN tags = '' THEN '[]'::jsonb
          ELSE tags::jsonb
        END;
      `);
      console.log('✓ Converted tags column to JSONB');
    } else {
      console.log('✓ Tags column is already JSONB or does not exist');
    }

    console.log('\n✅ Workflow index fix completed successfully!');

  } catch (error) {
    console.error('❌ Error fixing workflow index:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixWorkflowIndex()
  .then(() => {
    console.log('\n✅ All done! You can now start the server.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fix failed:', error);
    process.exit(1);
  });
