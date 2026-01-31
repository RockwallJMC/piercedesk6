/**
 * Execute migration 003 - Add Contact Form Fields
 * Uses Supabase management API to execute raw SQL
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL || 'https://iixfjulmrexivuehoxti.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
  console.error('   Please set SUPABASE_SERVICE_ROLE_KEY before running this migration script.');
  process.exit(1);
}

async function executeMigration() {
  console.log('🔄 Executing migration 003 - Add Contact Form Fields...\n');

  // Read the migration SQL file
  const migrationPath = path.join(__dirname, '003_add_contact_form_fields.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  try {
    // Split SQL into individual statements (simple split by semicolon)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    // Execute via REST API using fetch
    const results = [];
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'; // Add semicolon back

      console.log(`Executing statement ${i + 1}/${statements.length}...`);

      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ query: statement })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error executing statement ${i + 1}:`, errorText);
        console.error(`Statement: ${statement.substring(0, 100)}...`);
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
        results.push({ success: true, statement: i + 1 });
      }
    }

    console.log(`\n✨ Migration complete! Executed ${results.filter(r => r.success).length}/${statements.length} statements\n`);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

executeMigration();
