'use client';

import createClient from 'lib/supabase/client';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { generateProposalNumber } from 'utils/crm/proposalNumberGenerator';
import { recalculateProposalTotals } from 'utils/crm/proposalCalculations';

/**
 * Fetcher function for all proposals with optional filters
 * Filters: status, opportunity_id, search
 *
 * @param {Object} filters - Filter options
 * @param {string} filters.status - Optional status filter ('draft', 'sent', 'accepted', 'rejected', 'expired')
 * @param {string} filters.opportunity_id - Optional opportunity ID filter
 * @param {string} filters.search - Optional search term (searches proposal_number, title, description)
 * @returns {Promise<Array>} Array of proposal objects filtered by organization_id (via RLS)
 */
const proposalsFetcher = async (filters = {}) => {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  let query = supabase
    .from('proposals')
    .select(
      `
      *,
      opportunity:opportunities(
        *,
        account:accounts(*)
      )
    `
    )
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.opportunity_id) {
    query = query.eq('opportunity_id', filters.opportunity_id);
  }

  if (filters.search) {
    // Sanitize search input to prevent SQL injection
    const sanitizedSearch = filters.search.replace(/[%_]/g, '\\$&');
    query = query.or(
      `proposal_number.ilike.%${sanitizedSearch}%,title.ilike.%${sanitizedSearch}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * Hook to fetch all proposals for the current organization
 * Proposals are automatically filtered by organization_id via Row Level Security
 *
 * @param {Object} filters - Optional filters
 * @param {string} filters.status - Filter by status
 * @param {string} filters.opportunity_id - Filter by opportunity
 * @param {string} filters.search - Search term
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with proposals data
 *
 * @example
 * const { data: proposals, error, isLoading, mutate } = useProposals();
 * const { data: draftProposals } = useProposals({ status: 'draft' });
 * const { data: oppProposals } = useProposals({ opportunity_id: 'opp_001' });
 * const { data: searchResults } = useProposals({ search: 'payment' });
 */
export const useProposals = (filters = {}, config) => {
  const swr = useSWR(
    ['proposals', filters], // Key includes filters for separate caches
    () => proposalsFetcher(filters),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );

  return swr;
};

/**
 * Fetcher function for a single proposal by ID with joins
 * Returns proposal + line_items + opportunity + account
 *
 * @param {string} id - Proposal ID
 * @returns {Promise<Object>} Proposal object with joined data
 */
const proposalFetcher = async (id) => {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('proposals')
    .select(
      `
      *,
      line_items:proposal_line_items(*),
      opportunity:opportunities(
        *,
        account:accounts(*)
      )
    `
    )
    .is('deleted_at', null)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch proposal ${id}: ${error.message}`);
  }

  return data;
};

/**
 * Hook to fetch a single proposal by ID with all related data
 *
 * @param {string} id - Proposal ID
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with proposal data (includes line_items, opportunity, account)
 *
 * @example
 * const { data: proposal, error, isLoading } = useProposal('prop_001');
 */
export const useProposal = (id, config) => {
  const swr = useSWR(
    id ? ['proposal', id] : null, // Key with ID for cache, null if no ID
    () => proposalFetcher(id),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );

  return swr;
};

/**
 * Mutation function to create a new proposal
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {Object} options.arg - Proposal data to create
 * @returns {Promise<Object>} Created proposal object
 */
const createProposalMutation = async (url, { arg }) => {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Validate required fields
  if (!arg.opportunity_id) {
    throw new Error('opportunity_id is required');
  }

  if (!arg.title) {
    throw new Error('title is required');
  }

  // Generate proposal number using database-backed generator
  const proposalNumber = await generateProposalNumber();

  const { data, error } = await supabase
    .from('proposals')
    .insert([
      {
        ...arg,
        proposal_number: proposalNumber,
        status: 'draft',
      },
    ])
    .select(
      `
      *,
      opportunity:opportunities(
        *,
        account:accounts(*)
      )
    `
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Hook to create a new proposal
 * Automatically revalidates the proposals list after creation
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useCreateProposal();
 * const newProposal = await trigger({
 *   opportunity_id: 'opp_001',
 *   title: 'Website Redesign Proposal',
 *   description: 'Complete website redesign with modern UX',
 *   valid_until: '2026-03-31',
 *   tax_rate: 8.25,
 *   terms_and_conditions: 'Payment due within 30 days...',
 * });
 */
export const useCreateProposal = () => {
  const mutation = useSWRMutation('create-proposal', createProposalMutation, {
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};

/**
 * Mutation function to update an existing proposal
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.id - Proposal ID to update
 * @param {Object} options.arg.updates - Fields to update
 * @returns {Promise<Object>} Updated proposal object
 */
const updateProposalMutation = async (url, { arg }) => {
  const { id, updates } = arg;
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  if (!id) {
    throw new Error('Proposal ID is required');
  }

  const { data, error } = await supabase
    .from('proposals')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(
      `
      *,
      opportunity:opportunities(
        *,
        account:accounts(*)
      )
    `
    )
    .single();

  if (error) {
    throw new Error(`Failed to update proposal ${id}: ${error.message}`);
  }

  return data;
};

/**
 * Hook to update an existing proposal
 * Automatically revalidates the proposal and proposals list after update
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useUpdateProposal();
 * const updatedProposal = await trigger({
 *   id: 'prop_001',
 *   updates: {
 *     title: 'Updated Title',
 *     description: 'Updated description',
 *     tax_rate: 8.25,
 *   }
 * });
 */
export const useUpdateProposal = () => {
  const mutation = useSWRMutation('update-proposal', updateProposalMutation, {
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};

/**
 * Mutation function to update proposal line items
 * Replaces all line items and recalculates totals
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.proposal_id - Proposal ID
 * @param {Array} options.arg.line_items - New line items array
 * @param {number} options.arg.tax_rate - Tax rate for recalculation
 * @returns {Promise<Object>} Updated proposal object with new totals
 */
const updateLineItemsMutation = async (url, { arg }) => {
  const { proposal_id, line_items, tax_rate } = arg;
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  if (!proposal_id) {
    throw new Error('Proposal ID is required');
  }

  // Transaction: Delete old line items, insert new ones, update proposal totals
  const { error: deleteError } = await supabase
    .from('proposal_line_items')
    .delete()
    .eq('proposal_id', proposal_id);

  if (deleteError) {
    throw new Error(`Failed to delete line items for proposal ${proposal_id}: ${deleteError.message}`);
  }

  if (line_items && line_items.length > 0) {
    const { error: insertError } = await supabase
      .from('proposal_line_items')
      .insert(line_items.map((item) => ({ ...item, proposal_id })));

    if (insertError) {
      throw new Error(`Failed to insert line items for proposal ${proposal_id}: ${insertError.message}`);
    }
  }

  // Recalculate totals
  const { subtotal, taxAmount, total } = recalculateProposalTotals(
    line_items || [],
    tax_rate || 0
  );

  const { data, error } = await supabase
    .from('proposals')
    .update({
      total_amount: parseFloat(total),
      updated_at: new Date().toISOString(),
    })
    .eq('id', proposal_id)
    .select(
      `
      *,
      line_items:proposal_line_items(*),
      opportunity:opportunities(
        *,
        account:accounts(*)
      )
    `
    )
    .single();

  if (error) {
    throw new Error(`Failed to update proposal ${proposal_id}: ${error.message}`);
  }

  return data;
};

/**
 * Hook to update proposal line items
 * Batch updates all line items and recalculates proposal totals
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useUpdateLineItems();
 * const updatedProposal = await trigger({
 *   proposal_id: 'prop_001',
 *   line_items: [
 *     {
 *       id: 'item_001',
 *       item_type: 'service',
 *       description: 'Web Design',
 *       quantity: 1,
 *       unit_price: 5000.00,
 *       total_price: 5000.00,
 *       sort_order: 0,
 *     },
 *     // ... more items
 *   ],
 *   tax_rate: 8.25,
 * });
 */
export const useUpdateLineItems = () => {
  const mutation = useSWRMutation('update-line-items', updateLineItemsMutation, {
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};

/**
 * Mutation function to update proposal status
 * Sets appropriate timestamps based on status
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.id - Proposal ID
 * @param {string} options.arg.status - New status ('draft', 'sent', 'accepted', 'rejected', 'expired')
 * @returns {Promise<Object>} Updated proposal object
 */
const updateProposalStatusMutation = async (url, { arg }) => {
  const { id, status } = arg;
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  if (!id) {
    throw new Error('Proposal ID is required');
  }

  if (!status) {
    throw new Error('Status is required');
  }

  const updates = {
    status,
    updated_at: new Date().toISOString(),
  };

  // Set timestamps based on status
  if (status === 'sent') {
    updates.sent_at = new Date().toISOString();
  } else if (status === 'accepted') {
    updates.accepted_at = new Date().toISOString();
  } else if (status === 'rejected') {
    updates.rejected_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('proposals')
    .update(updates)
    .eq('id', id)
    .select(
      `
      *,
      opportunity:opportunities(
        *,
        account:accounts(*)
      )
    `
    )
    .single();

  if (error) {
    throw new Error(`Failed to update proposal status ${id}: ${error.message}`);
  }

  return data;
};

/**
 * Hook to update proposal status
 * Automatically sets appropriate timestamps (sent_at, accepted_at, rejected_at)
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useUpdateProposalStatus();
 * await trigger({ id: 'prop_001', status: 'sent' }); // Sets sent_at
 * await trigger({ id: 'prop_001', status: 'accepted' }); // Sets accepted_at
 * await trigger({ id: 'prop_001', status: 'rejected' }); // Sets rejected_at
 */
export const useUpdateProposalStatus = () => {
  const mutation = useSWRMutation('update-proposal-status', updateProposalStatusMutation, {
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};

/**
 * Mutation function to generate PDF for a proposal
 *
 * TODO: Replace with React-PDF + Supabase Storage in future phase
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.proposal_id - Proposal ID
 * @returns {Promise<Object>} PDF blob URL and filename
 */
const generateProposalPDFMutation = async (url, { arg }) => {
  const { proposal_id } = arg;

  // TODO: Replace with React-PDF implementation in future phase
  // import { pdf } from '@react-pdf/renderer';
  // import { ProposalPDF } from 'components/sections/crm/proposal-detail/ProposalPDF';
  //
  // const supabase = createClient();
  // const { data: proposal, error } = await supabase
  //   .from('proposals')
  //   .select('*, line_items:proposal_line_items(*), opportunity:opportunities(*), account:accounts(*)')
  //   .eq('id', proposal_id)
  //   .single();
  //
  // if (error) throw new Error(error.message);
  //
  // // Generate PDF blob
  // const blob = await pdf(<ProposalPDF proposal={proposal} />).toBlob();
  //
  // // Upload to Supabase Storage
  // const filename = `${proposal.proposal_number}.pdf`;
  // const { data: uploadData, error: uploadError } = await supabase.storage
  //   .from('proposals')
  //   .upload(`${proposal.organization_id}/${filename}`, blob, {
  //     contentType: 'application/pdf',
  //     upsert: true,
  //   });
  //
  // if (uploadError) throw new Error(uploadError.message);
  //
  // // Get public URL
  // const { data: { publicUrl } } = supabase.storage
  //   .from('proposals')
  //   .getPublicUrl(`${proposal.organization_id}/${filename}`);
  //
  // return { blob_url: publicUrl, filename };

  // MOCK IMPLEMENTATION - Remove after Phase 1.2 complete
  console.log('useGenerateProposalPDF mutation called with:', { proposal_id });
  return new Promise((resolve) => {
    setTimeout(() => {
      const proposal = getProposalById(proposal_id);
      const filename = proposal ? `${proposal.proposal_number}.pdf` : 'proposal.pdf';
      const mockBlob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(mockBlob);

      resolve({
        blob_url: blobUrl,
        filename,
      });
    }, 100);
  });
};

/**
 * Hook to generate PDF for a proposal
 * Returns blob URL for preview/download
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useGenerateProposalPDF();
 * const { blob_url, filename } = await trigger({ proposal_id: 'prop_001' });
 * // Use blob_url for preview or trigger download
 * window.open(blob_url, '_blank');
 * // OR download:
 * const a = document.createElement('a');
 * a.href = blob_url;
 * a.download = filename;
 * a.click();
 */
export const useGenerateProposalPDF = () => {
  const mutation = useSWRMutation('generate-proposal-pdf', generateProposalPDFMutation, {
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};
