/**
 * Execute migration using Supabase Management API
 * Uses SQL Editor endpoint to run migrations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase project details
const projectRef = 'iixfjulmrexivuehoxti';
const accessToken = process.env.SUPABASE_ACCESS_TOKEN; // Need to set this

async function executeMigration() {
  console.log('🔄 Executing migration via Supabase Management API...\n');

  if (!accessToken) {
    console.log('❌ SUPABASE_ACCESS_TOKEN environment variable not set');
    console.log('   Please visit: https://app.supabase.com/account/tokens');
    console.log('   Generate a token and run:');
    console.log('   export SUPABASE_ACCESS_TOKEN=your_token_here\n');

    console.log('⚠️  Alternative: Use Supabase Dashboard SQL Editor');
    console.log('   1. Go to: https://app.supabase.com/project/' + projectRef + '/sql');
    console.log('   2. Paste the contents of 003_add_contact_form_fields.sql');
    console.log('   3. Click "Run"\n');

    // Print the SQL file path
    const sqlFile = path.join(__dirname, '003_add_contact_form_fields.sql');
    console.log(`   SQL file location: ${sqlFile}\n`);

    // Show the SQL content
    const sql = fs.readFileSync(sqlFile, 'utf8');
    console.log('='.repeat(80));
    console.log('SQL TO EXECUTE:');
    console.log('='.repeat(80));
    console.log(sql);
    console.log('='.repeat(80));

    return;
  }

  // If token is available, use Management API
  const migrationPath = path.join(__dirname, '003_add_contact_form_fields.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: migrationSQL
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API Error:', error);
      throw new Error(`API returned ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Migration executed successfully!');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

executeMigration();
