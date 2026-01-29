/**
 * Proposal number generator utility
 *
 * Generates unique proposal numbers in PROP-YYYY-NNNN format using database-backed sequence.
 */

import createClient from 'lib/supabase/client';

/**
 * Generate a unique proposal number using database
 *
 * Format: PROP-YYYY-NNNN
 * - PROP: Prefix
 * - YYYY: Current year
 * - NNNN: Sequential number padded to 4 digits (0001, 0002, ..., 9999)
 *
 * @returns {Promise<string>} Generated proposal number (e.g., "PROP-2026-0001")
 *
 * @example
 * const number = await generateProposalNumber(); // "PROP-2026-0001"
 * const number2 = await generateProposalNumber(); // "PROP-2026-0002"
 */
export async function generateProposalNumber() {
  const supabase = createClient();
  const currentYear = new Date().getFullYear();

  // Get last proposal number for current year
  const { data, error } = await supabase
    .from('proposals')
    .select('proposal_number')
    .gte('created_at', `${currentYear}-01-01T00:00:00Z`)
    .order('proposal_number', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error('Failed to generate proposal number: ' + error.message);
  }

  let sequence = 1;
  if (data && data.length > 0) {
    // Extract sequence from PROP-YYYY-NNNN format
    const match = data[0].proposal_number.match(/PROP-\d{4}-(\d{4})/);
    if (match) {
      sequence = parseInt(match[1], 10) + 1;
    }
  }

  return `PROP-${currentYear}-${sequence.toString().padStart(4, '0')}`;
}
