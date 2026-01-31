'use client';

/**
 * Login Page - Google Sign-In entry point
 */

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { GoogleSignInButton } from '@/components/auth';
import { Spinner } from '@/components/ui';

/**
 * Inner login component that uses useSearchParams
 * Must be wrapped in Suspense boundary
 */
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  // Redirect if already logged in
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      const returnUrl = searchParams.get('returnUrl') || '/dashboard';
      router.replace(decodeURIComponent(returnUrl));
    }
  }, [isHydrated, isAuthenticated, router, searchParams]);

  // Get redirect destination
  const returnUrl = searchParams.get('returnUrl')
    ? decodeURIComponent(searchParams.get('returnUrl')!)
    : '/dashboard';

  return (
    <div className="card max-w-md w-full">
      {/* Logo/Branding */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-health flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Diet Management App</h1>
        <p className="text-muted mt-2">
          Your digital companion for healthier living
        </p>
      </div>

      {/* Sign-in button */}
      <div className="flex justify-center">
        <GoogleSignInButton
          theme="filled_blue"
          size="large"
          text="signin_with"
          shape="rectangular"
          width={280}
          redirectTo={returnUrl}
        />
      </div>

      {/* Info text */}
      <p className="text-xs text-muted text-center mt-6">
        By signing in, you agree to our{' '}
        <a href="/terms" className="text-primary-600 hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-primary-600 hover:underline">
          Privacy Policy
        </a>
      </p>

      {/* Features preview */}
      <div className="mt-8 pt-6 border-t border-border">
        <h2 className="text-sm font-medium text-foreground mb-3">
          Track your health journey:
        </h2>
        <ul className="space-y-2 text-sm text-muted">
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Daily weight and glucose tracking
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Personalized BMR calculations
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Personalized diet level guidance
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Login page with Suspense boundary
 *
 * Suspense is required because useSearchParams causes client-side bailout
 * during static generation in Next.js 15+
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="card max-w-md w-full flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
