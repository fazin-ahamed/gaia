// Fix workflow status enum type issue
require('dotenv').config();
const { Sequelize } = require('sequelize');

async function fixWorkflowEnum() {
  console.log('Fixing workflow status enum...');

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

    // Check if workflows table exists
    const [tables] = await sequelize.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'workflows';"
    ).catch(() => [[]]);

    if (!tables || tables.length === 0) {
      console.log('✓ Workflows table does not exist, no fix needed');
      await sequelize.close();
      return;
    }

    console.log('Workflows table exists, checking status column...');

    // Drop the enum type if it exists
    await sequelize.query('DROP TYPE IF EXISTS "enum_workflows_status" CASCADE;');
    console.log('✓ Dropped old enum type');

    // Check if status column exists
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'workflows' AND column_name = 'status';
    `);

    if (columns.length > 0) {
      console.log(`Current status column type: ${columns[0].data_type}`);
      
      // Drop the status column
      await sequelize.query('ALTER TABLE workflows DROP COLUMN IF EXISTS status;');
      console.log('✓ Dropped status column');
    }

    // Create the enum type
    await sequelize.query(`
      CREATE TYPE "enum_workflows_status" AS ENUM('active', 'inactive', 'draft');
    `);
    console.log('✓ Created new enum type');

    // Add the status column with the enum type
    await sequelize.query(`
      ALTER TABLE workflows 
      ADD COLUMN status "enum_workflows_status" DEFAULT 'active' NOT NULL;
    `);
    console.log('✓ Added status column with enum type');

    // Update any existing rows
    await sequelize.query(`
      UPDATE workflows SET status = 'active' WHERE status IS NULL;
    `);
    console.log('✓ Updated existing rows');

    console.log('\n✅ Workflow enum fix completed successfully!');

  } catch (error) {
    console.error('❌ Error fixing workflow enum:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixWorkflowEnum()
  .then(() => {
    console.log('\n✅ All done! You can now start the server.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fix failed:', error);
    process.exit(1);
  });
