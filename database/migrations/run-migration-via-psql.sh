#!/bin/bash

# Run migration 003 using Supabase CLI
# This script executes the SQL migration file against the linked Supabase database

echo "🔄 Running migration 003 - Add Contact Form Fields"
echo ""

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Execute the migration SQL file
npx supabase db execute \
  --file "${SCRIPT_DIR}/003_add_contact_form_fields.sql" \
  --linked

echo ""
echo "✅ Migration execution complete!"
