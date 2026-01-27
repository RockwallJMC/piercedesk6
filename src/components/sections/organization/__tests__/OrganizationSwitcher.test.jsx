/**
 * Unit tests for OrganizationSwitcher component
 *
 * RED phase: These tests will fail until OrganizationSwitcher.jsx is implemented
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrganizationSwitcher from '../OrganizationSwitcher';
import { useUserOrganizations, useSwitchOrganization } from '@/services/swr/api-hooks/useOrganizationApi';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

// Mock the hooks
jest.mock('@/services/swr/api-hooks/useOrganizationApi', () => ({
  useUserOrganizations: jest.fn(),
  useSwitchOrganization: jest.fn(),
}));

jest.mock('@/hooks/useSupabaseAuth', () => ({
  useSupabaseAuth: jest.fn(),
}));

describe('OrganizationSwitcher', () => {
  const mockOrganizations = [
    {
      id: 'org-1',
      name: 'Organization One',
      slug: 'org-one',
      isActive: true,
    },
    {
      id: 'org-2',
      name: 'Organization Two',
      slug: 'org-two',
      isActive: false,
    },
    {
      id: 'org-3',
      name: 'Organization Three',
      slug: 'org-three',
      isActive: false,
    },
  ];

  const mockSwitchTrigger = jest.fn();
  const mockSetOrganization = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    useUserOrganizations.mockReturnValue({
      data: mockOrganizations,
      isLoading: false,
      error: null,
    });

    useSwitchOrganization.mockReturnValue({
      trigger: mockSwitchTrigger,
      isMutating: false,
    });

    useSupabaseAuth.mockReturnValue({
      setOrganization: mockSetOrganization,
    });
  });

  it('renders current organization name', () => {
    render(<OrganizationSwitcher />);

    const currentOrg = mockOrganizations.find(org => org.isActive);
    expect(screen.getByText(currentOrg.name)).toBeInTheDocument();
  });

  it('displays all organizations in dropdown when clicked', async () => {
    const user = userEvent.setup();
    render(<OrganizationSwitcher />);

    // Open dropdown
    const selectButton = screen.getByRole('combobox');
    await user.click(selectButton);

    // Check all organizations are shown
    await waitFor(() => {
      mockOrganizations.forEach((org) => {
        expect(screen.getByText(org.name)).toBeInTheDocument();
      });
    });
  });

  it('switches organization when different org is selected', async () => {
    const user = userEvent.setup();
    mockSwitchTrigger.mockResolvedValue({ organization_id: 'org-2' });

    render(<OrganizationSwitcher />);

    // Open dropdown
    const selectButton = screen.getByRole('combobox');
    await user.click(selectButton);

    // Select Organization Two
    const orgTwoOption = screen.getByRole('option', { name: 'Organization Two' });
    await user.click(orgTwoOption);

    // Should call switch organization
    await waitFor(() => {
      expect(mockSwitchTrigger).toHaveBeenCalledWith({ organizationId: 'org-2' });
    });

    // Should update auth context after successful switch
    await waitFor(() => {
      expect(mockSetOrganization).toHaveBeenCalledWith('org-2');
    });
  });

  it('shows loading state while switching organizations', async () => {
    const user = userEvent.setup();
    useSwitchOrganization.mockReturnValue({
      trigger: mockSwitchTrigger,
      isMutating: true,
    });

    render(<OrganizationSwitcher />);

    // Should show loading indicator (component is disabled during mutation)
    const selectButton = screen.getByRole('combobox');
    expect(selectButton).toBeDisabled();
  });

  it('shows loading state while fetching organizations', () => {
    useUserOrganizations.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<OrganizationSwitcher />);

    // Should show loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error message when switching fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to switch organization';
    mockSwitchTrigger.mockRejectedValue(new Error(errorMessage));

    render(<OrganizationSwitcher />);

    // Open dropdown and select different org
    const selectButton = screen.getByRole('combobox');
    await user.click(selectButton);

    const orgTwoOption = screen.getByRole('option', { name: 'Organization Two' });
    await user.click(orgTwoOption);

    // Should display error message
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('handles empty organizations list gracefully', () => {
    useUserOrganizations.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<OrganizationSwitcher />);

    // Should show placeholder text
    expect(screen.getByText(/no organizations/i)).toBeInTheDocument();
  });

  it('does not call switch when selecting already active organization', async () => {
    const user = userEvent.setup();
    render(<OrganizationSwitcher />);

    // Open dropdown
    const selectButton = screen.getByRole('combobox');
    await user.click(selectButton);

    // Select the already active Organization One
    const orgOneOption = screen.getByRole('option', { name: 'Organization One' });
    await user.click(orgOneOption);

    // Should not call switch organization API
    expect(mockSwitchTrigger).not.toHaveBeenCalled();
  });
});
