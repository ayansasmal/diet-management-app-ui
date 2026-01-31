'use client';

/**
 * AuthGuard - Route protection component
 *
 * Wraps protected pages to enforce authentication and profile requirements.
 * Uses Zustand's hydration state to prevent flash of unauthenticated content.
 */

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { PageLoader } from '@/components/ui/spinner';

interface AuthGuardProps {
  /** Protected content */
  children: React.ReactNode;
  /** Require completed profile (default: true) */
  requireProfile?: boolean;
  /** Redirect path for unauthenticated users */
  loginPath?: string;
  /** Redirect path for users without profile */
  profilePath?: string;
}

/**
 * Route protection wrapper
 *
 * Handles three states:
 * 1. Hydrating from localStorage → Show loader
 * 2. Not authenticated → Redirect to login
 * 3. Authenticated but no profile → Redirect to profile edit
 * 4. Authenticated with profile → Render children
 *
 * @example
 * ```tsx
 * // In a protected layout
 * export default function ProtectedLayout({ children }) {
 *   return (
 *     <AuthGuard>
 *       <Sidebar />
 *       <main>{children}</main>
 *     </AuthGuard>
 *   );
 * }
 *
 * // Allow access without profile
 * <AuthGuard requireProfile={false}>
 *   {children}
 * </AuthGuard>
 * ```
 */
export function AuthGuard({
  children,
  requireProfile = true,
  loginPath = '/login',
  profilePath = '/profile/edit',
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  // Get auth state from store
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const hasProfile = useAuthStore((state) => state.user?.hasProfile ?? false);

  useEffect(() => {
    // Wait for store hydration
    if (!isHydrated) return;

    // Check authentication
    if (!isAuthenticated) {
      // Store intended destination for redirect after login
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`${loginPath}?returnUrl=${returnUrl}`);
      return;
    }

    // Check profile requirement
    if (requireProfile && !hasProfile) {
      // Don't redirect if already on profile page
      if (!pathname.startsWith('/profile')) {
        router.replace(profilePath);
        return;
      }
    }

    // All checks passed
    setIsChecking(false);
  }, [isHydrated, isAuthenticated, hasProfile, requireProfile, pathname, router, loginPath, profilePath]);

  // Show loader while checking auth
  if (!isHydrated || isChecking) {
    return <PageLoader />;
  }

  // Render protected content
  return <>{children}</>;
}

/**
 * Higher-order component version of AuthGuard
 *
 * @example
 * ```tsx
 * const ProtectedPage = withAuthGuard(DashboardPage);
 * ```
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AuthGuardProps, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}
