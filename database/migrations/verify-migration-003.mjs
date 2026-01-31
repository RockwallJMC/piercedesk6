/**
 * Verify that migration 003 was applied successfully
 * Checks for existence of new columns
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

async function verifyMigration() {
  console.log('🔍 Verifying migration 003...\n');

  const checks = [];
  let allPassed = true;

  // Test 1: Check contacts table new columns
  console.log('1️⃣  Checking contacts table columns...');
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('personal_email, alternate_phone, date_of_birth, linkedin_url, profile_image_url, status, notes, priority, tags')
      .limit(0);

    if (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
      console.log(`   Missing columns in contacts table`);
      allPassed = false;
    } else {
      console.log(`   ✅ PASSED: All contacts columns exist`);
      checks.push('contacts columns');
    }
  } catch (e) {
    console.log(`   ❌ FAILED: ${e.message}`);
    allPassed = false;
  }

  // Test 2: Check companies table new columns
  console.log('\n2️⃣  Checking companies table columns...');
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('phone, street_address, city, state, country, zip_code, founding_year, notes')
      .limit(0);

    if (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
      console.log(`   Missing columns in companies table`);
      allPassed = false;
    } else {
      console.log(`   ✅ PASSED: All companies columns exist`);
      checks.push('companies columns');
    }
  } catch (e) {
    console.log(`   ❌ FAILED: ${e.message}`);
    allPassed = false;
  }

  // Test 3: Try inserting test data to verify constraints
  console.log('\n3️⃣  Testing data insertion with new columns...');
  try {
    const testContact = {
      id: 'test-' + Date.now(),
      first_name: 'Test',
      last_name: 'Verification',
      email: 'test-verify-' + Date.now() + '@example.com',
      personal_email: 'personal@example.com',
      alternate_phone: '+1-555-TEST',
      status: 'currentlyWorking',
      priority: 'medium',
      lead_status: 'new',
      lead_source: 'organic_search',
      tags: ['test', 'verification']
    };

    const { data, error } = await supabase
      .from('contacts')
      .insert(testContact)
      .select()
      .single();

    if (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
      allPassed = false;
    } else {
      console.log(`   ✅ PASSED: Data insertion with new columns works`);
      checks.push('data insertion');

      // Clean up test data
      await supabase.from('contacts').delete().eq('id', testContact.id);
      console.log(`   🧹 Cleaned up test record`);
    }
  } catch (e) {
    console.log(`   ❌ FAILED: ${e.message}`);
    allPassed = false;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ MIGRATION 003 VERIFIED SUCCESSFULLY!');
    console.log(`   All ${checks.length} checks passed`);
    console.log('\nNext steps:');
    console.log('  1. Run seed data: node database/migrations/seed-contact-test-data.mjs');
    console.log('  2. Proceed to Task 2 (API Layer)');
  } else {
    console.log('❌ MIGRATION 003 VERIFICATION FAILED');
    console.log('\nThe migration has not been applied yet.');
    console.log('Please execute the SQL manually:');
    console.log('  1. Go to: https://app.supabase.com/project/iixfjulmrexivuehoxti/sql');
    console.log('  2. Run: database/migrations/003_add_contact_form_fields.sql');
    console.log('  3. Re-run this verification script');
  }
  console.log('='.repeat(60) + '\n');

  process.exit(allPassed ? 0 : 1);
}

verifyMigration();
