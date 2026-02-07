'use client';

/**
 * OAuth Callback Page - Handles Google redirect after authorization
 *
 * Processes the OAuth 2.0 authorization code from Google:
 * 1. Extracts code from URL params
 * 2. Sends code to backend for token exchange
 * 3. Stores JWT in auth store
 * 4. Redirects to dashboard or profile setup
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Spinner } from '@/components/ui/spinner';
import { post } from '@/lib/api/client';
import type { AuthResponse } from '@/types';

/**
 * Inner callback component that uses useSearchParams
 * Must be wrapped in Suspense boundary
 */
function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError(`Authorization failed: ${errorParam}`);
          return;
        }

        if (!code) {
          setError('No authorization code received');
          return;
        }

        // Exchange code for token on backend (uses proxy on HTTPS to avoid mixed content)
        const authResponse = await post<AuthResponse>(
          '/auth/google/callback',
          { code },
          { skipAuth: true }
        );

        if (!authResponse || !authResponse.accessToken || !authResponse.user) {
          console.error('Invalid auth response structure:', authResponse);
          throw new Error('Invalid authentication response from backend');
        }

        // Store auth token and user info with expiration
        // Default to 24h (86400 seconds) if expiresIn not provided
        setAuth({
          accessToken: authResponse.accessToken,
          expiresIn: authResponse.expiresIn ?? 86400,
          user: authResponse.user,
        });

        // Redirect based on profile status
        if (authResponse.user.hasProfile) {
          router.replace('/dashboard');
        } else {
          router.replace('/profile/edit');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        console.error('Auth callback error:', err);
        console.error('Error details:', err instanceof Error ? err.stack : err);
      }
    };

    handleCallback();
  }, [searchParams, setAuth, router]);

  if (error) {
    return (
      <div className="card max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Authentication Error</h1>
        <p className="text-error-600 mb-6">{error}</p>
        <a
          href="/login"
          className="btn btn-primary"
        >
          Back to Login
        </a>
      </div>
    );
  }

  return (
    <div className="card max-w-md w-full text-center">
      <h1 className="text-2xl font-bold text-foreground mb-4">Signing you in...</h1>
      <Spinner size="lg" />
    </div>
  );
}

/**
 * Auth callback page with Suspense boundary
 *
 * Suspense is required because useSearchParams causes client-side bailout
 * during static generation in Next.js 15+
 */
export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Suspense
        fallback={
          <div className="card max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Loading...</h1>
            <Spinner size="lg" />
          </div>
        }
      >
        <CallbackContent />
      </Suspense>
    </div>
  );
}
