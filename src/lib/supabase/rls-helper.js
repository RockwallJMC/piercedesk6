/**
 * RLS Helper - Row Level Security session variable utilities
 *
 * This module provides utilities for setting session variables used by
 * Supabase Row Level Security (RLS) policies to control multi-tenant data access.
 */

/**
 * Sets the organization context for the current database session.
 *
 * This function sets the `app.current_org_id` session variable which is used
 * by Row Level Security (RLS) policies to filter data access based on the
 * current organization context.
 *
 * @async
 * @param {Object} supabase - The Supabase client instance
 * @param {string|null} organizationId - The UUID of the organization to set as context
 * @returns {Promise<string|null>} The organization ID that was set
 * @throws {Error} When the RPC call fails
 *
 * @example
 * ```javascript
 * import { createClient } from '@supabase/supabase-js';
 * import { setOrganizationContext } from '@/lib/supabase/rls-helper';
 *
 * const supabase = createClient(url, key);
 * await setOrganizationContext(supabase, 'org-uuid-123');
 *
 * // Now all subsequent queries will be filtered by this organization
 * const { data } = await supabase.from('projects').select('*');
 * ```
 */
async function setOrganizationContext(supabase, organizationId) {
  const { data, error } = await supabase.rpc('set_config', {
    setting: 'app.current_org_id',
    value: organizationId,
    is_local: true,
  });

  if (error) {
    throw new Error(`Failed to set organization context: ${error.message}`);
  }

  return organizationId;
}

module.exports = {
  setOrganizationContext,
};
