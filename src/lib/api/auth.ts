/**
 * Auth API - Authentication endpoints
 *
 * Handles Google OAuth flow with the backend.
 */

import { post } from './client';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthResponse } from '@/types';

/**
 * Authenticate with Google credential
 *
 * Sends the Google ID token to the backend for verification and
 * receives a JWT access token in return.
 *
 * @param credential - Google ID token from GIS callback
 * @returns Auth response with access token and user data
 *
 * @example
 * ```ts
 * // In GoogleSignInButton callback
 * const handleCredentialResponse = async (response: CredentialResponse) => {
 *   try {
 *     const authData = await googleAuth(response.credential);
 *     // Auth store is automatically updated
 *     router.push('/dashboard');
 *   } catch (error) {
 *     console.error('Login failed:', error);
 *   }
 * };
 * ```
 */
export async function googleAuth(credential: string): Promise<AuthResponse> {
  const response = await post<AuthResponse>(
    '/auth/google',
    { credential },
    { skipAuth: true }
  );

  // Update auth store with new tokens
  useAuthStore.getState().setAuth({
    accessToken: response.accessToken,
    expiresIn: response.expiresIn,
    user: response.user,
  });

  return response;
}

/**
 * Get current authenticated user
 *
 * Fetches the current user's data from the backend.
 * Requires valid JWT token.
 *
 * @returns Current user data
 *
 * @example
 * ```ts
 * const user = await getCurrentUser();
 * if (!user.hasProfile) {
 *   router.push('/profile/edit');
 * }
 * ```
 */
export async function getCurrentUser(): Promise<AuthResponse['user']> {
  const response = await post<AuthResponse['user']>('/auth/me');
  return response;
}

/**
 * Logout - Clear auth state
 *
 * Clears the local auth store. Since we use JWT (stateless),
 * no backend call is needed.
 *
 * @example
 * ```ts
 * const handleLogout = () => {
 *   logout();
 *   router.push('/login');
 * };
 * ```
 */
export function logout(): void {
  useAuthStore.getState().clearAuth();

  // Optionally revoke Google session
  if (typeof window !== 'undefined' && window.google?.accounts?.id) {
    window.google.accounts.id.disableAutoSelect();
  }
}

/**
 * Check if user is authenticated
 *
 * @returns True if user has valid token
 */
export function isAuthenticated(): boolean {
  return useAuthStore.getState().isAuthenticated();
}
