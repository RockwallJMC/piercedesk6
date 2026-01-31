/**
 * Seed test data for Add Contact form E2E tests
 * Run this AFTER migration 003 has been executed
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://iixfjulmrexivuehoxti.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
  console.error('   Please set SUPABASE_SERVICE_ROLE_KEY before running this seed script.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedTestData() {
  console.log('🌱 Seeding test data for Add Contact form...\n');

  try {
    // First, get the admin user ID
    const { data: users, error: userError } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('email', 'admin@acme-corp.com')
      .single();

    if (userError || !users) {
      console.error('❌ Could not find admin user (admin@acme-corp.com)');
      console.error('   Make sure Phase 1.2 auth setup is complete');
      return;
    }

    const adminUserId = users.id;
    console.log(`✅ Found admin user: ${users.email} (${adminUserId})`);

    // Insert test company
    console.log('\n📦 Inserting test company...');
    const testCompany = {
      id: 'c0000000-0000-0000-0000-000000000001',
      name: 'Existing Test Company Inc',
      logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=ETC',
      industry: 'technology',
      website: 'https://existingtestco.com',
      phone: '+1-555-TEST-001',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      founding_year: 2015
    };

    const { error: companyError } = await supabase
      .from('companies')
      .upsert(testCompany, { onConflict: 'id' });

    if (companyError) {
      console.error('❌ Error inserting company:', companyError.message);
      return;
    }
    console.log(`   ✅ Company: ${testCompany.name}`);

    // Insert test contact
    console.log('\n👤 Inserting test contact...');
    const testContact = {
      id: 'ct000000-0000-0000-0000-000000000001',
      user_id: adminUserId,
      first_name: 'Existing',
      last_name: 'Contact',
      email: 'existing.contact@test.com',
      phone: '+1-555-EXIST-01',
      company_id: testCompany.id,
      lead_source: 'organic_search',
      lead_status: 'new',
      priority: 'medium',
      created_by: adminUserId
    };

    const { error: contactError } = await supabase
      .from('contacts')
      .upsert(testContact, { onConflict: 'id' });

    if (contactError) {
      console.error('❌ Error inserting contact:', contactError.message);
      return;
    }
    console.log(`   ✅ Contact: ${testContact.first_name} ${testContact.last_name}`);

    console.log('\n✨ Test data seeded successfully!\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  }
}

seedTestData();
