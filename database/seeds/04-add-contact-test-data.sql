-- Test data for Add Contact form E2E tests
-- Uses existing user from Phase 1.2 auth setup (admin@acme-corp.com)

-- Test Company 1: Existing company (should be selected, not created)
INSERT INTO companies (id, name, logo_url, industry, website, phone, city, state, country, founding_year)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'Existing Test Company Inc',
  'https://api.dicebear.com/7.x/initials/svg?seed=ETC',
  'technology',
  'https://existingtestco.com',
  '+1-555-TEST-001',
  'San Francisco',
  'CA',
  'USA',
  2015
) ON CONFLICT (id) DO NOTHING;

-- Test Contact 1: For duplicate email test
INSERT INTO contacts (
  id, user_id, first_name, last_name, email, phone, company_id,
  lead_source, lead_status, priority, created_by
)
VALUES (
  'ct000000-0000-0000-0000-000000000001',
  (SELECT id FROM auth.users WHERE email = 'admin@acme-corp.com'),
  'Existing',
  'Contact',
  'existing.contact@test.com',
  '+1-555-EXIST-01',
  'c0000000-0000-0000-0000-000000000001',
  'organic_search',
  'new',
  'medium',
  (SELECT id FROM auth.users WHERE email = 'admin@acme-corp.com')
) ON CONFLICT (id) DO NOTHING;
