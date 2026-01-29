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

  // Get next sequence number for the current year atomically from the database
  const { data, error } = await supabase.rpc('next_proposal_sequence', {
    year: currentYear,
  });

  if (error) {
    throw new Error('Failed to generate proposal number: ' + error.message);
  }

  // Depending on how the RPC is defined, `data` may be the number itself or an object.
  const sequence =
    typeof data === 'number'
      ? data
      : data && typeof data.sequence === 'number'
      ? data.sequence
      : null;

  if (sequence == null || Number.isNaN(sequence)) {
    throw new Error('Failed to generate proposal number: invalid sequence from database');
  }

  return `PROP-${currentYear}-${sequence.toString().padStart(4, '0')}`;
}
