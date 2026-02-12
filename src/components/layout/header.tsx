'use client';

/**
 * Header - Top navigation bar for authenticated pages
 */

import { useAuthStore } from '@/stores/auth-store';
import { logout } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Avatar, ThemeSwitcher } from '@/components/ui';

interface HeaderProps {
  onMenuToggle?: () => void;
}

/**
 * App header with user menu
 */
export function Header({ onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-border bg-card px-4 lg:px-6 flex items-center justify-between">
      {/* Mobile menu button */}
      <button
        className="lg:hidden p-2 -ml-2 text-muted hover:text-foreground"
        aria-label="Open menu"
        onClick={onMenuToggle}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Logo - Mobile only */}
      <div className="lg:hidden font-semibold text-foreground">
        Diet App
      </div>

      {/* Spacer */}
      <div className="hidden lg:block" />

      {/* User menu */}
      <div className="flex items-center gap-3">
        {/* Theme switcher */}
        <ThemeSwitcher />

        {user && (
          <>
            {/* User info */}
            <div className="hidden sm:flex items-center gap-3">
              <Avatar name={user.name} picture={user.picture} size="sm" />
              <span className="text-sm font-medium text-foreground">
                {user.name}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="btn-ghost text-sm"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
