import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCard from './UserProfileCard';

// Mock the fetch API
global.fetch = jest.fn();

describe('UserProfileCard', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Reset fetch mock after each test
    global.fetch.mockReset();
  });

  describe('Loading State', () => {
    it('shows loading spinner on initial mount', () => {
      // Mock a pending fetch (never resolves during this test)
      global.fetch.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<UserProfileCard />);

      // Assert loading spinner is present
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('shows loading spinner when refetching', async () => {
      const user = userEvent.setup();

      // First call: successful response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'Alice', email: 'alice@example.com' }),
      });

      // Second call: pending (never resolves)
      global.fetch.mockImplementationOnce(
        () => new Promise(() => {}) // Never resolves
      );

      render(<UserProfileCard />);

      // Wait for initial load to complete
      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toBeInTheDocument();
      });

      // Click refresh button
      const refreshButton = screen.getByTestId('refresh-button');
      await user.click(refreshButton);

      // Assert loading spinner appears during refetch
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when fetch fails', async () => {
      // Mock a failed fetch
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<UserProfileCard />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Verify error message content
      expect(screen.getByTestId('error-message')).toHaveTextContent('Network error');
    });

    it('shows error message when API returns error response', async () => {
      // Mock an HTTP error response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      render(<UserProfileCard />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Verify error state is shown
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });

    it('shows refresh button in error state', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<UserProfileCard />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Verify refresh button is present in error state
      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('displays user data after successful fetch', async () => {
      // Mock successful API response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'Alice Johnson',
          email: 'alice@example.com',
        }),
      });

      render(<UserProfileCard />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toBeInTheDocument();
      });

      // Verify user data is displayed
      expect(screen.getByTestId('user-name')).toHaveTextContent('Alice Johnson');
      expect(screen.getByTestId('user-email')).toHaveTextContent('alice@example.com');
    });

    it('hides loading spinner after successful fetch', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'Bob Smith',
          email: 'bob@example.com',
        }),
      });

      render(<UserProfileCard />);

      // Initially shows loading spinner
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toBeInTheDocument();
      });

      // Loading spinner should be gone
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    it('shows refresh button in success state', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'Charlie Brown',
          email: 'charlie@example.com',
        }),
      });

      render(<UserProfileCard />);

      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toBeInTheDocument();
      });

      // Verify refresh button is present
      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
    });
  });

  describe('useEffect Behavior', () => {
    it('fetches data automatically on mount', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'David Wilson',
          email: 'david@example.com',
        }),
      });

      render(<UserProfileCard />);

      // Verify fetch was called on mount
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Verify data appears
      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toBeInTheDocument();
      });
    });

    it('does not refetch on re-render with same props', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'Eve Adams',
          email: 'eve@example.com',
        }),
      });

      const { rerender } = render(<UserProfileCard />);

      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toBeInTheDocument();
      });

      // Re-render component
      rerender(<UserProfileCard />);

      // Should still only have called fetch once (from initial mount)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Refresh Button', () => {
    it('refetches data when refresh button is clicked', async () => {
      const user = userEvent.setup();

      // First fetch: success
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'Frank Miller',
          email: 'frank@example.com',
        }),
      });

      // Second fetch: success with updated data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'Frank Miller Jr.',
          email: 'frank.jr@example.com',
        }),
      });

      render(<UserProfileCard />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent('Frank Miller');
      });

      // Click refresh button
      const refreshButton = screen.getByTestId('refresh-button');
      await user.click(refreshButton);

      // Wait for updated data
      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent('Frank Miller Jr.');
      });

      // Verify fetch was called twice
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('can retry after error', async () => {
      const user = userEvent.setup();

      // First fetch: error
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      // Second fetch: success
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'Grace Hopper',
          email: 'grace@example.com',
        }),
      });

      render(<UserProfileCard />);

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Click refresh button in error state
      const refreshButton = screen.getByTestId('refresh-button');
      await user.click(refreshButton);

      // Wait for successful load
      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent('Grace Hopper');
      });

      // Error should be gone
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('clears previous error when refresh starts', async () => {
      const user = userEvent.setup();

      // First fetch: error
      global.fetch.mockRejectedValueOnce(new Error('First error'));

      // Second fetch: also error (but different)
      global.fetch.mockRejectedValueOnce(new Error('Second error'));

      render(<UserProfileCard />);

      // Wait for first error
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('First error');
      });

      // Click refresh
      const refreshButton = screen.getByTestId('refresh-button');
      await user.click(refreshButton);

      // Wait for second error
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Second error');
      });

      // Should show new error, not old one
      expect(screen.getByTestId('error-message')).not.toHaveTextContent('First error');
    });
  });

  describe('Async State Transitions', () => {
    it('transitions from loading to success', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'Hannah Davis',
          email: 'hannah@example.com',
        }),
      });

      render(<UserProfileCard />);

      // Initial: loading
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // After fetch: success
      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('transitions from loading to error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Fetch failed'));

      render(<UserProfileCard />);

      // Initial: loading
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // After fetch: error
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.queryByTestId('user-name')).not.toBeInTheDocument();
    });

    it('transitions from success to loading to success on refresh', async () => {
      const user = userEvent.setup();

      // First fetch
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'Ian McKellen',
          email: 'ian@example.com',
        }),
      });

      // Second fetch (will be pending)
      let resolveSecondFetch;
      global.fetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecondFetch = resolve;
          })
      );

      render(<UserProfileCard />);

      // Wait for initial success
      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toBeInTheDocument();
      });

      // Click refresh
      const refreshButton = screen.getByTestId('refresh-button');
      await user.click(refreshButton);

      // Should show loading
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // Resolve second fetch
      resolveSecondFetch({
        ok: true,
        json: async () => ({
          name: 'Ian McKellen Sr.',
          email: 'ian.sr@example.com',
        }),
      });

      // Should show new data
      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent('Ian McKellen Sr.');
      });
    });

    it('transitions from error to loading to success on retry', async () => {
      const user = userEvent.setup();

      // First fetch: error
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      // Second fetch: success
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'Jane Austen',
          email: 'jane@example.com',
        }),
      });

      render(<UserProfileCard />);

      // Wait for error
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Click refresh
      const refreshButton = screen.getByTestId('refresh-button');
      await user.click(refreshButton);

      // Should show loading (briefly)
      // Then success
      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });
});
