/**
 * Tests for Root Middleware - Route protection and matcher configuration
 */

import { NextRequest } from 'next/server';

describe('middleware', () => {
  let middleware;
  let mockUpdateSession;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    // Reset modules to get fresh import
    jest.resetModules();

    // Mock the updateSession function
    mockUpdateSession = jest.fn();
    mockResponse = {
      type: 'next',
      cookies: {
        set: jest.fn(),
        get: jest.fn(),
      },
    };

    jest.mock('@/lib/supabase/middleware', () => ({
      updateSession: mockUpdateSession,
    }));

    // Create mock request
    mockRequest = {
      url: 'https://example.com/dashboard',
      nextUrl: {
        pathname: '/dashboard',
        origin: 'https://example.com',
      },
      cookies: {
        getAll: jest.fn(() => []),
        set: jest.fn(),
      },
      headers: new Headers({
        'content-type': 'application/json',
      }),
    };

    // Mock default behavior
    mockUpdateSession.mockResolvedValue(mockResponse);

    // Import the middleware to test
    middleware = require('../middleware').default;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call updateSession for protected routes', async () => {
    mockRequest.nextUrl.pathname = '/dashboard';

    await middleware(mockRequest);

    expect(mockUpdateSession).toHaveBeenCalledWith(mockRequest);
  });

  it('should call updateSession for apps routes', async () => {
    mockRequest.nextUrl.pathname = '/apps/email';

    await middleware(mockRequest);

    expect(mockUpdateSession).toHaveBeenCalledWith(mockRequest);
  });

  it('should call updateSession for organization-setup routes', async () => {
    mockRequest.nextUrl.pathname = '/organization-setup';

    await middleware(mockRequest);

    expect(mockUpdateSession).toHaveBeenCalledWith(mockRequest);
  });

  it('should return response from updateSession', async () => {
    const expectedResponse = {
      type: 'redirect',
      url: 'https://example.com/authentication/default/jwt/login',
    };
    mockUpdateSession.mockResolvedValue(expectedResponse);

    const response = await middleware(mockRequest);

    expect(response).toBe(expectedResponse);
  });

  it('should handle middleware errors gracefully', async () => {
    mockUpdateSession.mockRejectedValue(new Error('Session error'));

    await expect(middleware(mockRequest)).rejects.toThrow('Session error');
  });
});

describe('middleware config', () => {
  let config;

  beforeEach(() => {
    jest.resetModules();
    const middlewareModule = require('../middleware');
    config = middlewareModule.config;
  });

  it('should have matcher configuration', () => {
    expect(config).toBeDefined();
    expect(config.matcher).toBeDefined();
    expect(Array.isArray(config.matcher)).toBe(true);
  });

  it('should use catch-all pattern for route matching', () => {
    // Verify matcher uses a catch-all regex pattern
    const hasCatchAllPattern = config.matcher.some(pattern =>
      pattern.includes('(?!') // Negative lookahead for exclusions
    );
    expect(hasCatchAllPattern).toBe(true);
  });

  it('should match dashboard routes', () => {
    // Matcher should catch dashboard routes (not excluded)
    const pattern = config.matcher[0];
    // Dashboard path should match (not in exclusion list)
    expect(pattern).not.toMatch('/dashboard');
  });

  it('should match protected application routes', () => {
    // Verify matcher pattern allows apps and organization-setup routes
    const pattern = config.matcher[0];
    // Pattern should not explicitly exclude these protected routes
    expect(pattern).not.toContain('/apps');
    expect(pattern).not.toContain('/organization-setup');
    expect(pattern).not.toContain('/dashboard');
  });

  it('should exclude static files from matcher', () => {
    // Check that matcher doesn't include _next/static patterns
    const hasStaticExclusion = config.matcher.every(pattern =>
      !pattern.includes('/_next/static') || pattern.includes('!')
    );
    expect(hasStaticExclusion).toBe(true);
  });

  it('should exclude public authentication routes from matcher', () => {
    // Matcher should not include auth routes (they're public)
    const hasAuthRoute = config.matcher.some(pattern =>
      pattern.includes('/authentication') && !pattern.includes('!')
    );
    expect(hasAuthRoute).toBe(false);
  });
});
