# Database Migrations

## Migration 003: Add Contact Form Fields

**Status**: ⏳ Pending Manual Execution

### Quick Start

1. **Execute Migration SQL**:
   - Open [Supabase SQL Editor](https://app.supabase.com/project/iixfjulmrexivuehoxti/sql)
   - Copy and paste the contents of `003_add_contact_form_fields.sql`
   - Click "Run"

2. **Verify Migration**:
   ```bash
   node database/migrations/verify-migration-003.mjs
   ```

3. **Seed Test Data**:
   ```bash
   node database/migrations/seed-contact-test-data.mjs
   ```

### Files Created

- `003_add_contact_form_fields.sql` - Migration SQL (ADD COLUMNS, INDEXES, CONSTRAINTS)
- `04-add-contact-test-data.sql` - Seed data SQL (test company + contact)
- `verify-migration-003.mjs` - Verification script
- `seed-contact-test-data.mjs` - Test data seeding script
- `MIGRATION_INSTRUCTIONS.md` - Detailed instructions

### What This Migration Adds

**Companies Table**:
- phone, street_address, city, state, country, zip_code, founding_year, notes

**Contacts Table**:
- personal_email, alternate_phone, date_of_birth, linkedin_url
- profile_image_url, status, notes, priority, tags[]

**Indexes**:
- idx_contacts_personal_email
- idx_companies_city
- idx_companies_industry

**Constraints**:
- Check constraints for: status, lead_status, priority, lead_source

### Troubleshooting

**If verification fails**:
- Check that you executed the SQL in the correct database
- Look for error messages in the Supabase SQL Editor
- Ensure all statements completed successfully

**If seeding fails**:
- Verify migration was applied (`verify-migration-003.mjs`)
- Check that admin@acme-corp.com user exists (Phase 1.2 prerequisite)

### Next Steps

After successful migration + seeding:
- ✅ Mark Task 1 complete
- ➡️  Proceed to Task 2: API Layer (service endpoints + SWR hooks)
