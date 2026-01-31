/**
 * Check current database schema for contacts and companies tables
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://iixfjulmrexivuehoxti.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
  console.error('   Please set SUPABASE_SERVICE_ROLE_KEY before running this script.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkSchema() {
  console.log('🔍 Checking current database schema...\n');

  const query = `
    SELECT
      table_name,
      column_name,
      data_type,
      is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN ('contacts', 'companies')
    ORDER BY table_name, ordinal_position;
  `;

  const { data, error } = await supabase.rpc('exec_sql', { sql: query });

  if (error) {
    console.error('❌ Error querying schema:', error);

    // Try alternative approach using direct query
    const { error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .limit(0);

    if (contactsError) {
      console.error('❌ Error with contacts table:', contactsError);
    } else {
      console.log('✅ Contacts table exists');
    }

    const { error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(0);

    if (companiesError) {
      console.error('❌ Error with companies table:', companiesError);
    } else {
      console.log('✅ Companies table exists');
    }

    return;
  }

  console.log('Schema information:');
  console.log(data);
}

checkSchema();
