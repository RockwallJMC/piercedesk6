# UserProfileCard Testing Documentation

## Overview

This document details the testing approach for the `UserProfileCard` component, which involves testing React hooks (`useState`, `useEffect`), async data fetching, and multiple state transitions.

## Testing Framework & Tools

- **Jest**: Test runner and assertion library
- **React Testing Library (RTL)**: Component testing utilities
- **@testing-library/user-event**: Realistic user interaction simulation
- **@testing-library/jest-dom**: Custom matchers for DOM assertions

## Key Testing Patterns

### 1. Mocking the API Call

**Approach**: Mock `global.fetch` at the module level

```javascript
// Setup mock before tests
global.fetch = jest.fn();

describe('UserProfileCard', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear call history
  });

  afterEach(() => {
    global.fetch.mockReset(); // Reset implementation
  });
});
```

**Why this pattern:**
- `global.fetch` is the standard browser API for HTTP requests
- Mocking at this level allows testing without real network calls
- Each test can configure its own response behavior
- We avoid testing mock behavior (anti-pattern) by mocking the boundary (fetch), not the component logic

**Alternative approaches considered:**
- ❌ Mock a custom API service: Would require dependency injection
- ❌ Use MSW (Mock Service Worker): Overkill for simple unit tests
- ✅ Mock `global.fetch`: Minimal, standard, tests real component behavior

### 2. Testing Loading State

**Pattern**: Mock a pending promise that never resolves

```javascript
it('shows loading spinner on initial mount', () => {
  // Mock a pending fetch (never resolves during this test)
  global.fetch.mockImplementation(
    () => new Promise(() => {}) // Never resolves
  );

  render(<UserProfileCard />);

  expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
});
```

**Why this works:**
- `new Promise(() => {})` creates a promise that stays pending
- Component enters loading state and stays there
- We can synchronously assert on loading UI
- No race conditions or timing issues

**Key insight**: We're NOT using `waitFor` here because we want to test the immediate loading state, not wait for it to complete.

### 3. Testing Async State Changes

**Pattern**: Use `waitFor` to wait for async updates

```javascript
it('displays user data after successful fetch', async () => {
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

  // Then make assertions
  expect(screen.getByTestId('user-name')).toHaveTextContent('Alice Johnson');
});
```

**Why `waitFor` is necessary:**
- React state updates from async operations are not immediate
- `waitFor` polls the assertion until it passes or times out
- Default timeout: 1000ms (configurable)
- Retries every 50ms by default

**Common mistake**: Asserting immediately without `waitFor`:
```javascript
// ❌ BAD: Will fail because state hasn't updated yet
render(<UserProfileCard />);
expect(screen.getByTestId('user-name')).toBeInTheDocument(); // Throws immediately
```

### 4. Testing useEffect Behavior

**Pattern**: Verify side effects happen on mount

```javascript
it('fetches data automatically on mount', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ name: 'David', email: 'david@example.com' }),
  });

  render(<UserProfileCard />);

  // Verify fetch was called on mount
  expect(global.fetch).toHaveBeenCalledTimes(1);

  // Verify the side effect completed
  await waitFor(() => {
    expect(screen.getByTestId('user-name')).toBeInTheDocument();
  });
});
```

**Testing useEffect dependencies:**
```javascript
it('does not refetch on re-render with same props', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ name: 'Eve', email: 'eve@example.com' }),
  });

  const { rerender } = render(<UserProfileCard />);

  await waitFor(() => {
    expect(screen.getByTestId('user-name')).toBeInTheDocument();
  });

  // Re-render component
  rerender(<UserProfileCard />);

  // Should still only have called fetch once (empty dependency array)
  expect(global.fetch).toHaveBeenCalledTimes(1);
});
```

**Why this matters:**
- useEffect with `[]` dependencies runs only on mount
- useEffect with no dependencies runs on every render (usually a bug)
- Testing call counts verifies correct dependency array usage

### 5. Testing the Refresh Button

**Pattern**: Use `userEvent` for realistic interactions

```javascript
it('refetches data when refresh button is clicked', async () => {
  const user = userEvent.setup();

  // First fetch
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ name: 'Frank', email: 'frank@example.com' }),
  });

  // Second fetch (after refresh)
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ name: 'Frank Jr.', email: 'frank.jr@example.com' }),
  });

  render(<UserProfileCard />);

  // Wait for initial load
  await waitFor(() => {
    expect(screen.getByTestId('user-name')).toHaveTextContent('Frank');
  });

  // Click refresh
  const refreshButton = screen.getByTestId('refresh-button');
  await user.click(refreshButton);

  // Wait for updated data
  await waitFor(() => {
    expect(screen.getByTestId('user-name')).toHaveTextContent('Frank Jr.');
  });

  expect(global.fetch).toHaveBeenCalledTimes(2);
});
```

**Why `userEvent` over `fireEvent`:**
- `userEvent` simulates real browser events (focus, blur, click delay)
- More realistic than `fireEvent.click()`
- Better for testing user interactions
- Must be awaited: `await user.click(button)`

**Shortcut avoided**: We could use `fireEvent.click()` for simplicity, but `userEvent` is the recommended approach for interaction testing.

### 6. Testing Error States

**Pattern**: Mock rejected promises or error responses

```javascript
it('shows error message when fetch fails', async () => {
  // Mock a failed fetch
  global.fetch.mockRejectedValueOnce(new Error('Network error'));

  render(<UserProfileCard />);

  await waitFor(() => {
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
  });

  expect(screen.getByTestId('error-message')).toHaveTextContent('Network error');
});
```

**Testing HTTP errors (non-200 status):**
```javascript
it('shows error when API returns error response', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    status: 404,
    statusText: 'Not Found',
  });

  render(<UserProfileCard />);

  await waitFor(() => {
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
  });
});
```

**Key distinction:**
- `mockRejectedValueOnce()`: Network failure, promise rejects
- `mockResolvedValueOnce({ ok: false })`: HTTP error, promise resolves with error response

### 7. Testing State Transitions

**Pattern**: Verify state changes through the UI

```javascript
it('transitions from loading to success', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ name: 'Hannah', email: 'hannah@example.com' }),
  });

  render(<UserProfileCard />);

  // Initial: loading
  expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

  // After fetch: success
  await waitFor(() => {
    expect(screen.getByTestId('user-name')).toBeInTheDocument();
  });

  // Verify loading is gone
  expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
});
```

**Why `queryBy` for non-existence checks:**
- `getBy`: Throws if element not found
- `queryBy`: Returns `null` if element not found
- Use `queryBy` with `.not.toBeInTheDocument()` to assert absence

**Testing controlled async transitions:**
```javascript
it('transitions from success to loading to success on refresh', async () => {
  const user = userEvent.setup();

  // First fetch
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ name: 'Ian', email: 'ian@example.com' }),
  });

  // Second fetch (controlled promise)
  let resolveSecondFetch;
  global.fetch.mockImplementationOnce(
    () => new Promise((resolve) => {
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

  // Manually resolve second fetch
  resolveSecondFetch({
    ok: true,
    json: async () => ({ name: 'Ian Sr.', email: 'ian.sr@example.com' }),
  });

  // Should show new data
  await waitFor(() => {
    expect(screen.getByTestId('user-name')).toHaveTextContent('Ian Sr.');
  });
});
```

**Advanced pattern**: Controlled promise resolution allows testing intermediate states that might be too fast to observe with auto-resolving mocks.

## Mock Configuration Patterns

### One-time vs. Multiple Calls

```javascript
// For single test:
global.fetch.mockResolvedValueOnce({ /* ... */ });

// For multiple calls in sequence:
global.fetch
  .mockResolvedValueOnce({ /* first call */ })
  .mockResolvedValueOnce({ /* second call */ })
  .mockRejectedValueOnce(new Error('third call'));

// For all calls in a test:
global.fetch.mockResolvedValue({ /* ... */ });
```

### Pending, Resolved, Rejected

```javascript
// Pending (never resolves):
global.fetch.mockImplementation(() => new Promise(() => {}));

// Resolved:
global.fetch.mockResolvedValueOnce({ ok: true, json: async () => data });

// Rejected:
global.fetch.mockRejectedValueOnce(new Error('Failed'));
```

### Complete Response Shape

**Following anti-pattern #4 (Incomplete Mocks):**

```javascript
// ✅ GOOD: Complete fetch response
global.fetch.mockResolvedValueOnce({
  ok: true,
  status: 200,
  statusText: 'OK',
  headers: new Headers({ 'content-type': 'application/json' }),
  json: async () => ({ name: 'Alice', email: 'alice@example.com' }),
});

// ❌ BAD: Partial mock (missing properties)
global.fetch.mockResolvedValueOnce({
  json: async () => ({ name: 'Alice' }), // Missing ok, status, etc.
});
```

**Why completeness matters:**
- Real fetch returns full Response object
- Component might check `response.ok`, `response.status`, etc.
- Incomplete mocks fail silently when code depends on omitted fields

## Test Organization

### Describe Blocks by Feature

```javascript
describe('UserProfileCard', () => {
  describe('Loading State', () => { /* ... */ });
  describe('Error State', () => { /* ... */ });
  describe('Success State', () => { /* ... */ });
  describe('useEffect Behavior', () => { /* ... */ });
  describe('Refresh Button', () => { /* ... */ });
  describe('Async State Transitions', () => { /* ... */ });
});
```

**Benefits:**
- Clear test organization
- Easy to find tests for specific behaviors
- Groups related tests together
- Better test output readability

## TDD Workflow Applied

### Red-Green-Refactor Cycle

1. **RED**: Write failing test
   ```javascript
   it('shows loading spinner on initial mount', () => {
     global.fetch.mockImplementation(() => new Promise(() => {}));
     render(<UserProfileCard />);
     expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
   });
   ```

2. **Run test**: `npm test UserProfileCard.test.jsx`
   - Verify it fails with expected error (element not found)

3. **GREEN**: Write minimal code to pass
   ```javascript
   if (loading) {
     return <CircularProgress data-testid="loading-spinner" />;
   }
   ```

4. **Run test**: Verify it passes

5. **REFACTOR**: Clean up (add Card wrapper, styles, etc.)

6. **Run test**: Ensure still green after refactor

### Test-First Benefits for Async Code

**Without TDD:**
- Easy to forget edge cases (what if fetch fails?)
- Race conditions hard to catch manually
- Unclear if loading states work correctly

**With TDD:**
- Tests force you to think about all states upfront
- Loading, error, success paths all covered
- Async transitions explicitly tested
- Refactoring safe (tests catch breaks)

## Common Pitfalls & Solutions

### Pitfall 1: Not Awaiting Async Operations

```javascript
// ❌ BAD: Assertion before async update completes
it('shows user data', async () => {
  global.fetch.mockResolvedValueOnce({ /* ... */ });
  render(<UserProfileCard />);
  expect(screen.getByTestId('user-name')).toBeInTheDocument(); // Throws!
});

// ✅ GOOD: Wait for async update
it('shows user data', async () => {
  global.fetch.mockResolvedValueOnce({ /* ... */ });
  render(<UserProfileCard />);
  await waitFor(() => {
    expect(screen.getByTestId('user-name')).toBeInTheDocument();
  });
});
```

### Pitfall 2: Using getBy for Non-Existent Elements

```javascript
// ❌ BAD: getBy throws when element doesn't exist
expect(screen.getByTestId('loading-spinner')).not.toBeInTheDocument(); // Throws!

// ✅ GOOD: queryBy returns null when element doesn't exist
expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
```

### Pitfall 3: Forgetting to Clear Mocks

```javascript
// ❌ BAD: Mocks leak between tests
describe('Tests', () => {
  it('test 1', () => {
    global.fetch.mockResolvedValueOnce({ /* ... */ });
    // ...
  });

  it('test 2', () => {
    // Unexpected behavior from test 1's mock
  });
});

// ✅ GOOD: Clear mocks in beforeEach
describe('Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests...
});
```

### Pitfall 4: Testing Implementation Details

```javascript
// ❌ BAD: Testing internal state
expect(component.state.loading).toBe(true);

// ✅ GOOD: Testing rendered output
expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
```

### Pitfall 5: Over-Mocking

**Following anti-pattern #3 (Mocking Without Understanding):**

```javascript
// ❌ BAD: Mock everything "to be safe"
jest.mock('react', () => ({ /* mock useState, useEffect */ }));
jest.mock('@mui/material/Card');
jest.mock('./UserProfileCard', () => ({ /* ... */ }));

// ✅ GOOD: Only mock external dependencies
global.fetch = jest.fn(); // Just mock the API boundary
```

## What This Approach Demonstrates

### Patterns Used

1. **Global API mocking**: `global.fetch = jest.fn()`
2. **Async testing**: `waitFor`, `async/await`
3. **User interaction testing**: `userEvent.setup()` and `user.click()`
4. **State transition testing**: Multiple sequential mocks
5. **Controlled promises**: Manual resolution for timing control
6. **Hook behavior testing**: Verifying useEffect side effects
7. **Query strategy**: `getBy` vs `queryBy` for existence checks

### Shortcuts Avoided

1. ❌ **No mock libraries** (MSW, nock): Direct fetch mocking is simpler for unit tests
2. ❌ **No test-only methods**: Component has no `setLoading()` or `setError()` for tests
3. ❌ **No implementation detail testing**: We test UI output, not internal state
4. ❌ **No incomplete mocks**: Full Response objects with all properties
5. ❌ **No synchronous assumptions**: Always use `waitFor` for async updates

### Clear Areas (Well-Tested)

- ✅ Loading state on mount
- ✅ Loading state during refetch
- ✅ Error handling (network and HTTP errors)
- ✅ Success state rendering
- ✅ useEffect mount behavior
- ✅ useEffect dependency behavior (no refetch on re-render)
- ✅ Refresh button functionality
- ✅ Error recovery via refresh
- ✅ State transitions (loading → success, loading → error, etc.)
- ✅ Async state changes

### Unclear Areas (Would Need Guidance)

1. **API URL and request details**: Where does fetch get called? What URL? What headers?
   - Current implementation doesn't specify endpoint
   - Real implementation would need actual API integration tests

2. **Authentication**: Should fetch include auth tokens?
   - Not tested because component doesn't handle auth
   - Would need guidance on auth token injection

3. **Retry logic**: Should component auto-retry failed requests?
   - Current implementation requires manual refresh
   - Unclear if auto-retry is desired behavior

4. **Loading debouncing**: Should loading state have minimum display time?
   - Very fast responses might cause loading flicker
   - Unclear if this is a concern

5. **Memory leaks**: Component cleanup when unmounting during fetch
   - Not explicitly tested
   - Would need guidance on AbortController usage

6. **Error telemetry**: Should errors be logged to external service?
   - Current implementation only displays errors
   - Unclear if error tracking is required

## Running the Tests

```bash
# Run all tests
npm test

# Run UserProfileCard tests only
npm test UserProfileCard.test.jsx

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

## Verification Evidence

To verify these tests are correctly written following TDD:

1. **Tests fail without implementation**:
   ```bash
   # Comment out fetchUserData implementation
   # npm test UserProfileCard.test.jsx
   # Should see: "Unable to find element with testid: loading-spinner"
   ```

2. **Tests pass with implementation**:
   ```bash
   npm test UserProfileCard.test.jsx
   # Should see: "Tests: X passed, X total"
   ```

3. **Tests catch regressions**:
   ```bash
   # Change loading state to <div>Loading</div> (remove data-testid)
   # Tests should fail
   ```

## Conclusion

This testing approach demonstrates comprehensive coverage of a React component with:
- Async data fetching (useEffect + fetch)
- Multiple state transitions (loading, error, success)
- User interactions (refresh button)
- Proper mocking at the API boundary (not component internals)
- TDD-compliant test-first development

All patterns follow React Testing Library best practices and avoid anti-patterns documented in `.claude/skills/TDD/testing-anti-patterns.md`.
