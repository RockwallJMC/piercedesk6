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
  const prefix = `PROP-${currentYear}-`;

  // Get all proposal numbers for current year that match our exact prefix format
  // Filter to avoid custom prefixes like PROP-TS-2026-001
  const { data, error } = await supabase
    .from('proposals')
    .select('proposal_number')
    .gte('created_at', `${currentYear}-01-01T00:00:00Z`)
    .like('proposal_number', `${prefix}%`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to generate proposal number: ' + error.message);
  }

  let maxSequence = 0;

  // Parse all matching proposal numbers to find the highest sequence
  if (data && data.length > 0) {
    for (const row of data) {
      // Match PROP-YYYY-NNN or PROP-YYYY-NNNN (3 or 4 digits)
      // Only match our exact prefix to avoid custom formats
      const match = row.proposal_number.match(/^PROP-\d{4}-(\d{3,4})$/);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (!isNaN(seq) && seq > maxSequence) {
          maxSequence = seq;
        }
      }
    }
  }

  const nextSequence = maxSequence + 1;

  // Validate sequence is within acceptable range (1-9999)
  if (nextSequence < 1 || nextSequence > 9999) {
    throw new Error(
      `Proposal sequence out of range: ${nextSequence}. Maximum 9999 proposals per year.`
    );
  }

  return `PROP-${currentYear}-${nextSequence.toString().padStart(4, '0')}`;
}
