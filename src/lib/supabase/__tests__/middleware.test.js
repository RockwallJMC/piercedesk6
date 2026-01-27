/**
 * Tests for Supabase Middleware - Session refresh and route protection
 */

import { NextRequest, NextResponse } from 'next/server';

describe('updateSession', () => {
  let updateSession;
  let mockRequest;
  let mockSupabase;
  let mockGetUser;
  let originalEnv;

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env };

    // Set required env vars
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    // Reset modules to get fresh import
    jest.resetModules();

    // Mock Next.js server components
    jest.mock('next/server', () => ({
      NextRequest: jest.fn(),
      NextResponse: {
        next: jest.fn(() => ({
          cookies: {
            set: jest.fn(),
            get: jest.fn(),
            getAll: jest.fn(() => []),
          },
        })),
        redirect: jest.fn((url) => ({
          type: 'redirect',
          url,
          cookies: {
            set: jest.fn(),
            get: jest.fn(),
          },
        })),
      },
    }));

    // Mock Supabase SSR
    mockGetUser = jest.fn();
    mockSupabase = {
      auth: {
        getUser: mockGetUser,
      },
    };

    jest.mock('@supabase/ssr', () => ({
      createServerClient: jest.fn(() => mockSupabase),
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

    // Import the function to test
    const middleware = require('../middleware');
    updateSession = middleware.updateSession;
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should refresh session and return response for authenticated user', async () => {
    // Mock authenticated user
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      },
      error: null,
    });

    const response = await updateSession(mockRequest);

    expect(mockGetUser).toHaveBeenCalled();
    expect(response).toBeDefined();
    expect(response.cookies).toBeDefined();
  });

  it('should redirect to login when user is not authenticated on protected route', async () => {
    // Mock unauthenticated user
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    // Set request to protected route
    mockRequest.nextUrl.pathname = '/dashboard';

    const response = await updateSession(mockRequest);

    expect(mockGetUser).toHaveBeenCalled();
    expect(response.type).toBe('redirect');
    expect(response.url.toString()).toContain('/authentication/default/jwt/login');
  });

  it('should allow access to public routes without authentication', async () => {
    // Mock unauthenticated user
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    // Set request to public login route
    mockRequest.nextUrl.pathname = '/authentication/default/jwt/login';

    const response = await updateSession(mockRequest);

    expect(mockGetUser).toHaveBeenCalled();
    expect(response.type).not.toBe('redirect');
  });

  it('should allow access to static assets without authentication', async () => {
    // Mock unauthenticated user
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    // Set request to static asset
    mockRequest.nextUrl.pathname = '/_next/static/chunk.js';

    const response = await updateSession(mockRequest);

    expect(mockGetUser).toHaveBeenCalled();
    expect(response.type).not.toBe('redirect');
  });

  it('should handle auth callback route specially', async () => {
    // Mock unauthenticated user
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    // Set request to auth callback
    mockRequest.nextUrl.pathname = '/auth/callback';

    const response = await updateSession(mockRequest);

    expect(mockGetUser).toHaveBeenCalled();
    // Auth callback should be allowed even without authentication
    expect(response.type).not.toBe('redirect');
  });

  it('should redirect authenticated users away from auth pages', async () => {
    // Mock authenticated user
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      },
      error: null,
    });

    // Set request to login page
    mockRequest.nextUrl.pathname = '/authentication/default/jwt/login';

    const response = await updateSession(mockRequest);

    expect(mockGetUser).toHaveBeenCalled();
    expect(response.type).toBe('redirect');
    expect(response.url.toString()).toContain('/dashboard');
  });

  it('should handle Supabase auth errors gracefully', async () => {
    // Mock auth error
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Auth service unavailable'),
    });

    mockRequest.nextUrl.pathname = '/dashboard';

    const response = await updateSession(mockRequest);

    expect(mockGetUser).toHaveBeenCalled();
    // Should redirect to login on error
    expect(response.type).toBe('redirect');
  });
});
