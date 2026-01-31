/**
 * Check current database schema for contacts and companies tables
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iixfjulmrexivuehoxti.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGZqdWxtcmV4aXZ1ZWhveHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ3MzUzNywiZXhwIjoyMDgzMDQ5NTM3fQ.-9kWLYoix_N4B1YgSyn6e2Mw1iIKknPFBfCB88FW_lU';

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
    const { data: contactsData, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .limit(0);

    if (contactsError) {
      console.error('❌ Error with contacts table:', contactsError);
    } else {
      console.log('✅ Contacts table exists');
    }

    const { data: companiesData, error: companiesError } = await supabase
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
