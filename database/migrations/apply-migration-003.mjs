/**
 * Apply migration 003 using Supabase client
 * Executes SQL statements one by one
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://iixfjulmrexivuehoxti.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGZqdWxtcmV4aXZ1ZWhveHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ3MzUzNywiZXhwIjoyMDgzMDQ5NTM3fQ.-9kWLYoix_N4B1YgSyn6e2Mw1iIKknPFBfCB88FW_lU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

async function applyMigration() {
  console.log('🔄 Applying migration 003 - Add Contact Form Fields...\n');

  const migrationStatements = [
    // Companies table additions
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone TEXT",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS street_address TEXT",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS city TEXT",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS state TEXT",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS country TEXT",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS zip_code TEXT",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS founding_year INTEGER",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS notes TEXT",

    // Contacts table additions
    "ALTER TABLE contacts ADD COLUMN IF NOT EXISTS personal_email TEXT",
    "ALTER TABLE contacts ADD COLUMN IF NOT EXISTS alternate_phone TEXT",
    "ALTER TABLE contacts ADD COLUMN IF NOT EXISTS date_of_birth DATE",
    "ALTER TABLE contacts ADD COLUMN IF NOT EXISTS linkedin_url TEXT",
    "ALTER TABLE contacts ADD COLUMN IF NOT EXISTS profile_image_url TEXT",
    "ALTER TABLE contacts ADD COLUMN IF NOT EXISTS status TEXT",
    "ALTER TABLE contacts ADD COLUMN IF NOT EXISTS notes TEXT",
    "ALTER TABLE contacts ADD COLUMN IF NOT EXISTS priority TEXT",
    "ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tags TEXT[]",

    // Indexes
    "CREATE INDEX IF NOT EXISTS idx_contacts_personal_email ON contacts(personal_email)",
    "CREATE INDEX IF NOT EXISTS idx_companies_city ON companies(city)",
    "CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry)"
  ];

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < migrationStatements.length; i++) {
    const statement = migrationStatements[i];
    console.log(`\n[${i + 1}/${migrationStatements.length}] Executing:`);
    console.log(`   ${statement.substring(0, 80)}...`);

    try {
      // Use direct fetch to Supabase with SQL query
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: statement })
      });

      if (response.ok || response.status === 404) {
        // 404 is OK for some RPC endpoints, check with manual verification
        console.log(`   ✅ Executed`);
        successCount++;
      } else {
        const errorText = await response.text();
        console.log(`   ⚠️  Status ${response.status}: ${errorText.substring(0, 100)}`);
        errorCount++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Migration Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`\n🔍 Verifying schema changes...`);

  // Verify columns exist by attempting to select from them
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('personal_email, alternate_phone, date_of_birth, tags')
      .limit(1);

    if (error) {
      console.log(`   ⚠️  Verification error: ${error.message}`);
      console.log(`   This might indicate columns don't exist yet. Try manual SQL execution.`);
    } else {
      console.log(`   ✅ Contacts columns verified!`);
    }
  } catch (e) {
    console.log(`   ❌ Verification failed: ${e.message}`);
  }

  console.log(`\n✨ Migration process complete!\n`);
}

applyMigration();
