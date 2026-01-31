import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Environment variables loaded by Playwright from .env.test
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

// Test users from .env.test
const TEST_USERS = {
  singleOrg: {
    email: process.env.PLAYWRIGHT_SINGLE_ORG_EMAIL || 'test-single-org@piercedesk.test',
    password: process.env.PLAYWRIGHT_SINGLE_ORG_PASSWORD || 'TestPassword123!',
  },
};

test.describe('Phase 1.4 - Deal Details API', () => {
  let supabase;
  let authToken;
  let userId;

  test.beforeAll(async () => {
    // Create Supabase client for auth
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Authenticate as test user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_USERS.singleOrg.email,
      password: TEST_USERS.singleOrg.password,
    });

    if (error) throw error;

    authToken = data.session.access_token;
    userId = data.user.id;
  });

  test.afterAll(async () => {
    // Clean up auth session
    await supabase.auth.signOut();
  });

  test('GET /api/crm/deals/[id] returns deal with nested data', async ({ request }) => {
    // Use actual seed data ID
    const dealId = '33000000-0000-0000-0000-000000000001';

    const response = await request.get(`${BASE_URL}/api/crm/deals/${dealId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    expect(response.status()).toBe(200);

    const deal = await response.json();

    // Verify deal fields
    expect(deal.id).toBe(dealId);
    expect(deal.name).toBeTruthy();
    expect(deal.stage).toBeTruthy();
    expect(deal.amount).toBeDefined();

    // Verify nested contact
    expect(deal.contact).toBeTruthy();
    expect(deal.contact.id).toBeTruthy();
    expect(deal.contact.first_name).toBeTruthy();

    // Verify nested company (via contact)
    expect(deal.contact.company).toBeTruthy();
    expect(deal.contact.company.name).toBeTruthy();

    // Verify company with all deals
    expect(deal.company).toBeTruthy();
    expect(deal.company.deals).toBeInstanceOf(Array);

    // Verify collaborators
    expect(deal.collaborators).toBeTruthy();
    expect(deal.collaborators.owner).toBeDefined();
    expect(deal.collaborators.collaborators).toBeInstanceOf(Array);
    expect(deal.collaborators.followers).toBeInstanceOf(Array);

    // Verify activity summary
    expect(deal.activity_summary).toBeTruthy();
    expect(deal.activity_summary.total).toBeGreaterThanOrEqual(0);
    expect(deal.activity_summary.by_type).toBeTruthy();
  });

  test('GET /api/crm/deals/[id] returns 404 for non-existent deal', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/crm/deals/00000000-0000-0000-0000-000000000000`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    expect(response.status()).toBe(404);
  });

  test('GET /api/crm/deals/[id] returns 401 for unauthenticated request', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/crm/deals/33000000-0000-0000-0000-000000000001`);
    expect(response.status()).toBe(401);
  });

  test('GET /api/crm/deals/[id]/analytics returns aggregations', async ({ request }) => {
    const dealId = '33000000-0000-0000-0000-000000000001';

    const response = await request.get(`${BASE_URL}/api/crm/deals/${dealId}/analytics`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    expect(response.status()).toBe(200);

    const analytics = await response.json();

    // Verify structure
    expect(analytics.deal_progress).toBeGreaterThanOrEqual(0);
    expect(analytics.deal_progress).toBeLessThanOrEqual(100);
    expect(analytics.win_loss_ratio).toBeDefined();
    expect(analytics.conversion_rate).toBeDefined();
    expect(analytics.engagement_metrics).toBeDefined();
  });
});
