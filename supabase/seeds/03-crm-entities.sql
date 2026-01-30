-- =============================================================================
-- 03-crm-entities.sql
-- Seed data for CRM entities: companies, crm_contacts, deals, leads, accounts
-- =============================================================================
--
-- This file contains the seed data for CRM-related tables.
-- Run with: supabase db seed or via Supabase dashboard
--
-- Test Data Counts:
--   - 9 companies
--   - 10 crm_contacts
--   - 15 deals (4 Contact, 3 MQL, 3 SQL, 2 Opportunity, 2 Won, 1 Lost)
--   - 5 leads (3 in Acme Corp, 2 in TechStart)
--   - 27+ accounts
-- =============================================================================

-- =============================================================================
-- Companies (Shared CRM Companies)
-- =============================================================================

TRUNCATE companies CASCADE;

INSERT INTO companies (id, name, logo_url, industry, website)
VALUES
  ('21721848-b113-4727-b7bf-414e43abe919', 'Adobe', '/assets/logos/adobe.svg', 'Technology', 'https://www.adobe.com'),
  ('a0d0ffde-762c-4ae0-b6bb-412d231b7010', 'Amazon', '/assets/logos/amazon.svg', 'E-commerce', 'https://www.amazon.com'),
  ('c4fb342a-197a-49b6-9709-7996c1d0d299', 'Apple', '/assets/logos/apple.svg', 'Technology', 'https://www.apple.com'),
  ('9606ea3e-4a27-4b56-a9c9-15fb83c8969d', 'Google', '/assets/logos/google.svg', 'Technology', 'https://www.google.com'),
  ('9cd16e2d-6b30-44d6-b6e6-5d20570b1ddf', 'Microsoft', '/assets/logos/microsoft.svg', 'Technology', 'https://www.microsoft.com'),
  ('3f58624d-cca3-41be-9392-21a7fa050bd2', 'Netflix', '/assets/logos/netflix.svg', 'Entertainment', 'https://www.netflix.com'),
  ('f2c77242-6e1f-4c5f-85c4-67c5ebaefc69', 'Salesforce', '/assets/logos/salesforce.svg', 'CRM Software', 'https://www.salesforce.com'),
  ('2e143d53-05e0-4350-996d-985788e79e21', 'Spotify', '/assets/logos/spotify.svg', 'Music Streaming', 'https://www.spotify.com'),
  ('238a43a1-24a3-40ed-a0fb-84a36479d19f', 'Tesla', '/assets/logos/tesla.svg', 'Automotive', 'https://www.tesla.com');

-- =============================================================================
-- CRM Contacts (10 contacts linked to companies)
-- =============================================================================
-- Note: user_id should be a2222222-... (Bob Manager from Acme Corp)

TRUNCATE crm_contacts CASCADE;

INSERT INTO crm_contacts (id, first_name, last_name, email, title, company_id, user_id, created_by)
VALUES
  -- Adobe contact
  ('ad5a43cd-24bb-4b5b-b43a-9511c1debb08', 'John', 'Smith', 'john.smith@adobe.com', 'VP of Sales',
   '21721848-b113-4727-b7bf-414e43abe919', 'a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222'),

  -- Google contacts (2)
  ('f483c7d9-4943-41ba-98e2-65435cb05653', 'Sarah', 'Johnson', 'sarah.j@google.com', 'Head of Marketing',
   '9606ea3e-4a27-4b56-a9c9-15fb83c8969d', 'a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222'),
  ('e24e0dfd-2115-405e-9327-1b2b4fe4f151', 'Jennifer', 'Thomas', 'jennifer.t@google.com', 'Account Executive',
   '9606ea3e-4a27-4b56-a9c9-15fb83c8969d', 'a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222'),

  -- Netflix contact
  ('c9c677c6-51c1-4950-9121-65ccbb38263a', 'Michael', 'Brown', 'mbrown@netflix.com', 'Director of Content',
   '3f58624d-cca3-41be-9392-21a7fa050bd2', 'a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222'),

  -- Microsoft contact
  ('7eda7090-babc-4a8b-9b0c-0c8797ef639a', 'Emily', 'Davis', 'edavis@microsoft.com', 'Product Manager',
   '9cd16e2d-6b30-44d6-b6e6-5d20570b1ddf', 'a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222'),

  -- Tesla contact
  ('4195243b-5be9-43e9-894a-5e2216d1960b', 'James', 'Wilson', 'jwilson@tesla.com', 'Chief Engineer',
   '238a43a1-24a3-40ed-a0fb-84a36479d19f', 'a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222'),

  -- Amazon contact
  ('43d3bcb4-1356-47af-8895-185d3f65bde4', 'Linda', 'Martinez', 'linda.m@amazon.com', 'Operations Lead',
   'a0d0ffde-762c-4ae0-b6bb-412d231b7010', 'a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222'),

  -- Apple contact
  ('6b6346dc-d397-4c80-977e-a85ef3071b8a', 'Robert', 'Garcia', 'robert.g@apple.com', 'Innovation Director',
   'c4fb342a-197a-49b6-9709-7996c1d0d299', 'a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222'),

  -- Spotify contact
  ('3f702bef-29d1-45be-a6cb-68065d2bdf61', 'Patricia', 'Anderson', 'patricia.a@spotify.com', 'Business Development',
   '2e143d53-05e0-4350-996d-985788e79e21', 'a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222'),

  -- Salesforce contact
  ('530eaca0-9a6b-403c-9068-80830a320c10', 'David', 'Taylor', 'dtaylor@salesforce.com', 'Sales Director',
   'f2c77242-6e1f-4c5f-85c4-67c5ebaefc69', 'a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222');

-- =============================================================================
-- Deals (15 deals distributed across pipeline stages)
-- =============================================================================
-- Stage distribution: Contact(4), MQL(3), SQL(3), Opportunity(2), Won(2), Lost(1)
-- user_id should be a2222222-... (Bob Manager from Acme Corp)

TRUNCATE deals CASCADE;

INSERT INTO deals (id, user_id, name, company_id, contact_id, amount, stage, priority, stage_order, created_by)
VALUES
  -- Contact Stage (4 deals)
  ('e954c46c-0507-4d84-afbc-9a23a6d51b2f', 'a2222222-2222-2222-2222-222222222222',
   'Enterprise Security Platform', '21721848-b113-4727-b7bf-414e43abe919', 'ad5a43cd-24bb-4b5b-b43a-9511c1debb08',
   250000.00, 'Contact', 'High', 0, 'a2222222-2222-2222-2222-222222222222'),
  ('b7b15747-c948-4b34-9467-9350ecd9cf0d', 'a2222222-2222-2222-2222-222222222222',
   'Cloud Infrastructure Upgrade', '9606ea3e-4a27-4b56-a9c9-15fb83c8969d', 'f483c7d9-4943-41ba-98e2-65435cb05653',
   180000.00, 'Contact', 'Medium', 1, 'a2222222-2222-2222-2222-222222222222'),
  ('66ac91fb-d9fc-40ec-8895-a50afed94d3e', 'a2222222-2222-2222-2222-222222222222',
   'Content Delivery Network', '3f58624d-cca3-41be-9392-21a7fa050bd2', 'c9c677c6-51c1-4950-9121-65ccbb38263a',
   420000.00, 'Contact', 'Urgent', 2, 'a2222222-2222-2222-2222-222222222222'),
  ('ff808c73-8ff9-42a7-9bf5-7e588830123c', 'a2222222-2222-2222-2222-222222222222',
   'Office 365 Migration', '9cd16e2d-6b30-44d6-b6e6-5d20570b1ddf', '7eda7090-babc-4a8b-9b0c-0c8797ef639a',
   95000.00, 'Contact', 'Low', 3, 'a2222222-2222-2222-2222-222222222222'),

  -- MQL Stage (3 deals)
  ('967f5dcf-e825-4a5c-810d-541e20cea7f6', 'a2222222-2222-2222-2222-222222222222',
   'Electric Vehicle Fleet Management', '238a43a1-24a3-40ed-a0fb-84a36479d19f', '4195243b-5be9-43e9-894a-5e2216d1960b',
   500000.00, 'MQL', 'High', 0, 'a2222222-2222-2222-2222-222222222222'),
  ('653876fa-b87a-409a-b393-aa8050a696e5', 'a2222222-2222-2222-2222-222222222222',
   'Warehouse Automation System', 'a0d0ffde-762c-4ae0-b6bb-412d231b7010', '43d3bcb4-1356-47af-8895-185d3f65bde4',
   340000.00, 'MQL', 'Medium', 1, 'a2222222-2222-2222-2222-222222222222'),
  ('f0f24452-d3f7-4d1c-9bc6-f7196735f803', 'a2222222-2222-2222-2222-222222222222',
   'Innovation Lab Setup', 'c4fb342a-197a-49b6-9709-7996c1d0d299', '6b6346dc-d397-4c80-977e-a85ef3071b8a',
   280000.00, 'MQL', 'High', 2, 'a2222222-2222-2222-2222-222222222222'),

  -- SQL Stage (3 deals)
  ('6ce9d276-75fc-4e55-a1fe-db19f5ff07f4', 'a2222222-2222-2222-2222-222222222222',
   'Music Streaming Infrastructure', '2e143d53-05e0-4350-996d-985788e79e21', '3f702bef-29d1-45be-a6cb-68065d2bdf61',
   215000.00, 'SQL', 'Medium', 0, 'a2222222-2222-2222-2222-222222222222'),
  ('b852d7d1-69b7-41b9-ab20-4c390fd0dc32', 'a2222222-2222-2222-2222-222222222222',
   'CRM Analytics Platform', 'f2c77242-6e1f-4c5f-85c4-67c5ebaefc69', '530eaca0-9a6b-403c-9068-80830a320c10',
   175000.00, 'SQL', 'High', 1, 'a2222222-2222-2222-2222-222222222222'),
  ('f7615f76-6d24-4f29-992c-0e09511bb31c', 'a2222222-2222-2222-2222-222222222222',
   'Search Engine Optimization Suite', '9606ea3e-4a27-4b56-a9c9-15fb83c8969d', 'e24e0dfd-2115-405e-9327-1b2b4fe4f151',
   310000.00, 'SQL', 'Urgent', 2, 'a2222222-2222-2222-2222-222222222222'),

  -- Opportunity Stage (2 deals)
  ('a6d33048-e398-4b0a-b0f7-9a7485b75998', 'a2222222-2222-2222-2222-222222222222',
   'Data Center Expansion', '9cd16e2d-6b30-44d6-b6e6-5d20570b1ddf', '7eda7090-babc-4a8b-9b0c-0c8797ef639a',
   450000.00, 'Opportunity', 'High', 0, 'a2222222-2222-2222-2222-222222222222'),
  ('2254b333-a8fe-45ea-aecd-205d2c269e2c', 'a2222222-2222-2222-2222-222222222222',
   'Global Content Platform', '3f58624d-cca3-41be-9392-21a7fa050bd2', 'c9c677c6-51c1-4950-9121-65ccbb38263a',
   380000.00, 'Opportunity', 'Urgent', 1, 'a2222222-2222-2222-2222-222222222222'),

  -- Won Stage (2 deals)
  ('0812376e-ca82-4beb-b119-339f73529082', 'a2222222-2222-2222-2222-222222222222',
   'Design Suite Integration', '21721848-b113-4727-b7bf-414e43abe919', 'ad5a43cd-24bb-4b5b-b43a-9511c1debb08',
   125000.00, 'Won', 'High', 0, 'a2222222-2222-2222-2222-222222222222'),
  ('6a6258a4-6931-48c8-8f6c-3a3656961ec1', 'a2222222-2222-2222-2222-222222222222',
   'Premium Audio Processing', '2e143d53-05e0-4350-996d-985788e79e21', '3f702bef-29d1-45be-a6cb-68065d2bdf61',
   89000.00, 'Won', 'Medium', 1, 'a2222222-2222-2222-2222-222222222222'),

  -- Lost Stage (1 deal)
  ('6428f73f-1723-4eaf-9b62-9471dc6c40c9', 'a2222222-2222-2222-2222-222222222222',
   'Retail Analytics Solution', 'a0d0ffde-762c-4ae0-b6bb-412d231b7010', '43d3bcb4-1356-47af-8895-185d3f65bde4',
   195000.00, 'Lost', 'Low', 0, 'a2222222-2222-2222-2222-222222222222');

-- =============================================================================
-- Leads (5 leads across organizations)
-- =============================================================================

-- Note: Don't truncate leads - use upsert pattern to preserve existing data
INSERT INTO leads (id, organization_id, first_name, last_name, email, company, title, source, status, lead_score, created_by, assigned_to)
VALUES
  -- Acme Corporation leads (3)
  ('32000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   'Robert', 'Brown', 'robert.brown@newco.com', 'NewCo Industries', 'Security Manager',
   'Website', 'new', 75, 'a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222'),
  ('32000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   'Lisa', 'Martinez', 'lisa.martinez@startup.io', 'Startup.io', 'Founder',
   'Referral', 'contacted', 85, 'a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222'),
  ('32000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   'Tom', 'Wilson', 'tom.wilson@enterprise.com', 'Enterprise Solutions', 'VP Operations',
   'Trade Show', 'qualified', 90, 'a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222'),

  -- TechStart Industries leads (2)
  ('42000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
   'Jennifer', 'Lee', 'jennifer.lee@innovate.com', 'Innovate Corp', 'COO',
   'LinkedIn', 'new', 70, 'b2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222'),
  ('42000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
   'David', 'Chen', 'david.chen@growth.io', 'Growth.io', 'VP Security',
   'Email Campaign', 'contacted', 80, 'b2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  company = EXCLUDED.company,
  title = EXCLUDED.title,
  source = EXCLUDED.source,
  status = EXCLUDED.status,
  lead_score = EXCLUDED.lead_score;

-- =============================================================================
-- Verification Queries
-- =============================================================================
-- Run these to verify seed data:
--
-- Companies:
-- SELECT COUNT(*) as company_count FROM companies;
-- Expected: 9
--
-- CRM Contacts:
-- SELECT COUNT(*) as contact_count FROM crm_contacts;
-- Expected: 10
--
-- Deals by Stage:
-- SELECT stage, COUNT(*) as count FROM deals GROUP BY stage ORDER BY
--   CASE stage WHEN 'Contact' THEN 1 WHEN 'MQL' THEN 2 WHEN 'SQL' THEN 3
--   WHEN 'Opportunity' THEN 4 WHEN 'Won' THEN 5 WHEN 'Lost' THEN 6 END;
-- Expected: Contact=4, MQL=3, SQL=3, Opportunity=2, Won=2, Lost=1
--
-- Leads:
-- SELECT organization_id, COUNT(*) FROM leads WHERE deleted_at IS NULL GROUP BY organization_id;
-- Expected: Acme Corp=3, TechStart=2
-- =============================================================================
