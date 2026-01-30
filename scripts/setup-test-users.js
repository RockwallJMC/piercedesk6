#!/usr/bin/env node

/**
 * Setup Test Users for Playwright E2E Tests
 *
 * This script creates test users and organizations in Supabase for E2E testing.
 * It uses the Supabase Admin API to bypass email confirmation.
 *
 * Usage: node scripts/setup-test-users.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env.local
function loadEnvVars() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const vars = {};

    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        vars[match[1].trim()] = match[2].trim();
      }
    });

    return vars;
  } catch (error) {
    console.error('❌ Error reading .env.local:', error.message);
    return {};
  }
}

const env = loadEnvVars();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.NEXT_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   NEXT_SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✓' : '✗');
  process.exit(1);
}

// Create Supabase admin client (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test user definitions
// Note: roles must match organization_members check constraint:
// 'owner', 'admin', 'manager', 'member', 'guest'
const TEST_USERS = [
  {
    email: 'sales.manager@piercedesk.test',
    password: 'TestPassword123!',
    role: 'manager', // Maps to sales_manager in tests
    displayName: 'Sales Manager'
  },
  {
    email: 'sales.rep@piercedesk.test',
    password: 'TestPassword123!',
    role: 'member', // Maps to sales_rep in tests
    displayName: 'Sales Representative'
  }
];

// Test organization definitions
const TEST_ORGS = [
  {
    name: 'Acme Corporation',
    slug: 'acme-corp',
    settings: {
      timezone: 'America/New_York',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY'
    }
  },
  {
    name: 'Globex Industries',
    slug: 'globex-ind',
    settings: {
      timezone: 'America/Chicago',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY'
    }
  }
];

/**
 * Create or get existing user
 */
async function createUser(userData) {
  console.log(`\n📧 Creating user: ${userData.email}`);

  // Check if user already exists
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('   ❌ Error listing users:', listError.message);
    return null;
  }

  const existingUser = existingUsers.users.find(u => u.email === userData.email);

  if (existingUser) {
    console.log(`   ℹ️  User already exists (ID: ${existingUser.id})`);
    return existingUser;
  }

  // Create new user with email confirmed
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      display_name: userData.displayName
    }
  });

  if (createError) {
    console.error('   ❌ Error creating user:', createError.message);
    return null;
  }

  console.log(`   ✅ User created (ID: ${newUser.user.id})`);
  return newUser.user;
}

/**
 * Create or get existing organization
 */
async function createOrganization(orgData) {
  console.log(`\n🏢 Creating organization: ${orgData.name}`);

  // Check if organization already exists
  const { data: existingOrgs, error: listError } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', orgData.slug);

  if (listError) {
    console.error('   ❌ Error checking organization:', listError.message);
    return null;
  }

  if (existingOrgs && existingOrgs.length > 0) {
    console.log(`   ℹ️  Organization already exists (ID: ${existingOrgs[0].id})`);
    return existingOrgs[0];
  }

  // Create new organization (no owner_id column in schema)
  const { data: newOrg, error: createError } = await supabase
    .from('organizations')
    .insert({
      name: orgData.name,
      slug: orgData.slug,
      settings: orgData.settings,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (createError) {
    console.error('   ❌ Error creating organization:', createError.message);
    return null;
  }

  console.log(`   ✅ Organization created (ID: ${newOrg.id})`);
  return newOrg;
}

/**
 * Create user profile
 */
async function createUserProfile(userId, organizationId, displayName) {
  console.log(`   📝 Creating user profile for user ${userId}`);

  // Check if profile already exists
  const { data: existingProfile, error: checkError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (existingProfile) {
    console.log(`      ℹ️  Profile already exists`);
    return existingProfile;
  }

  // Create new profile
  const { data: newProfile, error: createError } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      organization_id: organizationId,
      display_name: displayName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (createError) {
    console.error('      ❌ Error creating profile:', createError.message);
    return null;
  }

  console.log(`      ✅ Profile created`);
  return newProfile;
}

/**
 * Add user to organization
 */
async function addUserToOrganization(userId, organizationId, role) {
  console.log(`   👥 Adding user to organization with role: ${role}`);

  // Check if membership already exists
  const { data: existingMember, error: checkError } = await supabase
    .from('organization_members')
    .select('*')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .single();

  if (existingMember) {
    console.log(`      ℹ️  Membership already exists`);
    return existingMember;
  }

  // Create new membership
  const { data: newMember, error: createError } = await supabase
    .from('organization_members')
    .insert({
      user_id: userId,
      organization_id: organizationId,
      role: role,
      permissions: ['read', 'write'], // Default permissions
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (createError) {
    console.error('      ❌ Error creating membership:', createError.message);
    return null;
  }

  console.log(`      ✅ Membership created`);
  return newMember;
}

/**
 * Main setup function
 */
async function setupTestData() {
  console.log('🚀 Starting test data setup...\n');
  console.log('📍 Supabase URL:', supabaseUrl);
  console.log('🔑 Using service role key\n');

  // Create users
  const createdUsers = [];
  for (const userData of TEST_USERS) {
    const user = await createUser(userData);
    if (user) {
      createdUsers.push({ ...user, role: userData.role, displayName: userData.displayName });
    }
  }

  if (createdUsers.length === 0) {
    console.error('\n❌ Failed to create any users. Aborting.');
    process.exit(1);
  }

  // Create organizations
  const createdOrgs = [];
  for (const orgData of TEST_ORGS) {
    const org = await createOrganization(orgData);
    if (org) {
      createdOrgs.push(org);
    }
  }

  if (createdOrgs.length === 0) {
    console.error('\n❌ Failed to create any organizations. Aborting.');
    process.exit(1);
  }

  // Create user profiles and memberships
  for (const user of createdUsers) {
    for (const org of createdOrgs) {
      // Create profile (only for first org, as profile is user-level)
      if (org === createdOrgs[0]) {
        await createUserProfile(user.id, org.id, user.displayName);
      }

      // Add user to organization
      await addUserToOrganization(user.id, org.id, user.role);
    }
  }

  console.log('\n✅ Test data setup complete!\n');
  console.log('📊 Summary:');
  console.log(`   Users created: ${createdUsers.length}`);
  console.log(`   Organizations created: ${createdOrgs.length}`);
  console.log(`   Memberships created: ${createdUsers.length * createdOrgs.length}\n`);

  console.log('🧪 Test Users:');
  createdUsers.forEach(user => {
    console.log(`   - ${user.email} (${user.role})`);
  });

  console.log('\n🏢 Test Organizations:');
  createdOrgs.forEach(org => {
    console.log(`   - ${org.name} (${org.slug})`);
  });

  console.log('\n🎯 Ready for Playwright tests!');
}

// Run setup
setupTestData().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
