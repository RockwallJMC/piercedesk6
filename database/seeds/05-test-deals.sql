-- Seed test deal data for Phase 1.4 tests
-- Creates company, contact, and deal for the test user to enable comprehensive API testing

-- Get test user ID and organization for use in subsequent inserts
DO $$
DECLARE
  test_user_id UUID;
  test_org_id UUID;
BEGIN
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'test-single-org@piercedesk.test';

  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'Test user not found: test-single-org@piercedesk.test';
  END IF;

  -- Get user's organization
  SELECT organization_id INTO test_org_id
  FROM organization_members
  WHERE user_id = test_user_id
  LIMIT 1;

  IF test_org_id IS NULL THEN
    RAISE EXCEPTION 'No organization found for test user';
  END IF;

  -- Insert test company
  INSERT INTO companies (
    id,
    name,
    industry,
    website,
    phone,
    street_address,
    city,
    state,
    country,
    zip_code,
    organization_id
  ) VALUES (
    '50000000-0000-0000-0000-000000000001',
    'Global Bank Corp Test',
    'Finance',
    'https://globalbank.com',
    '555-0101',
    '123 Bank Street',
    'New York',
    'NY',
    'USA',
    '10001',
    test_org_id
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = now();

  -- Insert test contact
  INSERT INTO crm_contacts (
    id,
    user_id,
    company_id,
    first_name,
    last_name,
    email,
    phone,
    title,
    created_by
  ) VALUES (
    '51000000-0000-0000-0000-000000000001',
    test_user_id,
    '50000000-0000-0000-0000-000000000001',
    'John',
    'Smith',
    'john.smith@globalbank.com',
    '555-0101',
    'VP of Security',
    test_user_id
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = now();

  -- Insert test deal
  INSERT INTO deals (
    id,
    user_id,
    name,
    stage,
    stage_order,
    company_id,
    contact_id,
    amount,
    priority,
    progress,
    close_date,
    created_by,
    organization_id
  ) VALUES (
    '33000000-0000-0000-0000-000000000001',
    test_user_id,
    'Global Bank HQ Security Upgrade',
    'proposal',
    3,
    '50000000-0000-0000-0000-000000000001',
    '51000000-0000-0000-0000-000000000001',
    250000,
    'high',
    45,
    '2026-03-15',
    test_user_id,
    test_org_id
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    amount = EXCLUDED.amount,
    updated_at = now();

END $$;
