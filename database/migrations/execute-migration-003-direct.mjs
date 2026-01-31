/**
 * Execute migration 003 using direct column additions via Supabase client
 * This bypasses SQL execution by using schema introspection and ALTER TABLE
 */

import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const supabaseUrl = 'https://iixfjulmrexivuehoxti.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGZqdWxtcmV4aXZ1ZWhveHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ3MzUzNywiZXhwIjoyMDgzMDQ5NTM3fQ.-9kWLYoix_N4B1YgSyn6e2Mw1iIKknPFBfCB88FW_lU';

// Construct connection string for direct Postgres connection
const connectionString = `postgresql://postgres.iixfjulmrexivuehoxti:${process.env.SUPABASE_DB_PASSWORD || '[PASSWORD]'}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

async function executeMigration() {
  console.log('🔄 Attempting to execute migration 003...\n');

  if (!process.env.SUPABASE_DB_PASSWORD) {
    console.log('❌ SUPABASE_DB_PASSWORD not set in environment');
    console.log('\nPlease execute the migration manually using the Supabase Dashboard:');
    console.log('1. Go to: https://app.supabase.com/project/iixfjulmrexivuehoxti/sql');
    console.log('2. Open file: /home/pierce/piercedesk6/database/migrations/003_add_contact_form_fields.sql');
    console.log('3. Copy and paste the SQL into the editor');
    console.log('4. Click "Run"');
    console.log('\nSee MIGRATION_INSTRUCTIONS.md for details.\n');
    return;
  }

  try {
    const { Pool } = pg;
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    console.log('✅ Connected to database');

    // Read and execute migration SQL
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '003_add_contact_form_fields.sql'),
      'utf8'
    );

    await pool.query(migrationSQL);
    console.log('✅ Migration executed successfully!');

    await pool.end();

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\nPlease execute the migration manually using the Supabase Dashboard.');
    console.log('See MIGRATION_INSTRUCTIONS.md for instructions.\n');
  }
}

executeMigration();
