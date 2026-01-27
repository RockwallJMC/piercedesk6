/**
 * Tests for RLS Helper - Row Level Security session variable utilities
 */

describe('setOrganizationContext', () => {
  let mockSupabase;
  let setOrganizationContext;

  beforeEach(() => {
    // Reset modules to get fresh import
    jest.resetModules();

    // Mock Supabase client with rpc method
    mockSupabase = {
      rpc: jest.fn(),
    };

    // Import the function to test
    const rlsHelper = require('../rls-helper');
    setOrganizationContext = rlsHelper.setOrganizationContext;
  });

  it('should call Supabase rpc with correct parameters', async () => {
    const organizationId = 'org-uuid-123';

    // Mock successful RPC response
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: null,
    });

    await setOrganizationContext(mockSupabase, organizationId);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('set_config', {
      setting: 'app.current_org_id',
      value: organizationId,
      is_local: true,
    });
  });

  it('should return the organization ID on success', async () => {
    const organizationId = 'org-uuid-456';

    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await setOrganizationContext(mockSupabase, organizationId);

    expect(result).toBe(organizationId);
  });

  it('should throw error when RPC call fails', async () => {
    const organizationId = 'org-uuid-789';
    const rpcError = new Error('Database connection failed');

    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: rpcError,
    });

    await expect(
      setOrganizationContext(mockSupabase, organizationId)
    ).rejects.toThrow('Failed to set organization context: Database connection failed');
  });

  it('should handle null organization ID gracefully', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: null,
    });

    await setOrganizationContext(mockSupabase, null);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('set_config', {
      setting: 'app.current_org_id',
      value: null,
      is_local: true,
    });
  });
});
