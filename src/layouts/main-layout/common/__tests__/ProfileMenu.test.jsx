/**
 * Unit tests for ProfileMenu component with Supabase authentication
 *
 * RED phase: These tests will fail until ProfileMenu is updated to use Supabase auth
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileMenu from '../ProfileMenu';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useRouter } from 'next/navigation';

// Mock all dependencies
jest.mock('@/hooks/useSupabaseAuth');
jest.mock('next/navigation');
jest.mock('@/hooks/useThemeMode', () => ({
  useThemeMode: jest.fn(),
}));
jest.mock('@/providers/BreakpointsProvider', () => ({
  useBreakpoints: jest.fn(),
}));
jest.mock('@/providers/SettingsProvider', () => ({
  useSettingsContext: jest.fn(),
}));
jest.mock('@/components/sections/organization/OrganizationSwitcher', () => ({
  __esModule: true,
  default: () => <div data-testid="organization-switcher">Organization Switcher</div>,
}));

// Import mocked hooks
const { useThemeMode } = require('@/hooks/useThemeMode');
const { useBreakpoints } = require('@/providers/BreakpointsProvider');
const { useSettingsContext } = require('@/providers/SettingsProvider');

describe('ProfileMenu with Supabase Auth', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: {
      name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
    },
  };

  const mockSignOut = jest.fn();
  const mockPush = jest.fn();
  const mockSetThemeMode = jest.fn();
  const mockUp = jest.fn(() => true);

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useSupabaseAuth
    useSupabaseAuth.mockReturnValue({
      user: mockUser,
      organizationId: 'org-123',
      setOrganization: jest.fn(),
      signOut: mockSignOut,
      loading: false,
    });

    // Mock useRouter
    useRouter.mockReturnValue({
      push: mockPush,
    });

    // Mock useThemeMode
    useThemeMode.mockReturnValue({
      isDark: false,
      setThemeMode: mockSetThemeMode,
    });

    // Mock useBreakpoints
    useBreakpoints.mockReturnValue({
      up: mockUp,
    });

    // Mock useSettingsContext
    useSettingsContext.mockReturnValue({
      config: { textDirection: 'ltr' },
    });
  });

  it('displays user info from Supabase auth', () => {
    render(<ProfileMenu />);

    // Click to open menu
    const avatarButton = screen.getByRole('button');
    fireEvent.click(avatarButton);

    // Check user name is displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders OrganizationSwitcher component in menu', () => {
    render(<ProfileMenu />);

    // Click to open menu
    const avatarButton = screen.getByRole('button');
    fireEvent.click(avatarButton);

    // Check OrganizationSwitcher is rendered
    expect(screen.getByTestId('organization-switcher')).toBeInTheDocument();
  });

  it('calls Supabase signOut when sign out button clicked', async () => {
    mockSignOut.mockResolvedValue();

    render(<ProfileMenu />);

    // Click to open menu
    const avatarButton = screen.getByRole('button');
    fireEvent.click(avatarButton);

    // Click Sign Out
    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);

    // Verify signOut was called
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });

  it('navigates to login after successful sign out', async () => {
    mockSignOut.mockResolvedValue();

    render(<ProfileMenu />);

    // Click to open menu
    const avatarButton = screen.getByRole('button');
    fireEvent.click(avatarButton);

    // Click Sign Out
    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);

    // Verify navigation occurred
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('login'));
    });
  });

  it('handles loading state correctly', () => {
    useSupabaseAuth.mockReturnValue({
      user: null,
      organizationId: null,
      setOrganization: jest.fn(),
      signOut: mockSignOut,
      loading: true,
    });

    render(<ProfileMenu />);

    // During loading, menu should still render but might show different state
    const avatarButton = screen.getByRole('button');
    expect(avatarButton).toBeInTheDocument();
  });

  it('shows fallback when user is null', () => {
    useSupabaseAuth.mockReturnValue({
      user: null,
      organizationId: null,
      setOrganization: jest.fn(),
      signOut: mockSignOut,
      loading: false,
    });

    render(<ProfileMenu />);

    // Click to open menu
    const avatarButton = screen.getByRole('button');
    fireEvent.click(avatarButton);

    // Should show Sign In option when no user
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('menu opens and closes correctly', () => {
    render(<ProfileMenu />);

    // Initially menu should not be visible
    expect(screen.queryByText('Account Settings')).not.toBeInTheDocument();

    // Click to open menu
    const avatarButton = screen.getByRole('button');
    fireEvent.click(avatarButton);

    // Menu items should be visible
    expect(screen.getByText('Account Settings')).toBeInTheDocument();

    // Click outside to close (simulate by clicking on backdrop)
    fireEvent.keyDown(document, { key: 'Escape' });

    // Menu should close
    waitFor(() => {
      expect(screen.queryByText('Account Settings')).not.toBeInTheDocument();
    });
  });

  it('displays user avatar correctly', () => {
    render(<ProfileMenu />);

    // Find avatar by alt text
    const avatar = screen.getByAltText('Test User');
    expect(avatar).toBeInTheDocument();
  });
});
