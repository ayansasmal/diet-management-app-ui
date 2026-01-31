'use client';

/**
 * ThemeSwitcher - Toggle between light, dark, and system themes
 *
 * Syncs theme preference with:
 * 1. Auth store (user.themePreference) - for logged-in users
 * 2. Backend API (PATCH /users/profile) - for cross-device persistence
 * 3. localStorage - for immediate cache and unauthenticated fallback
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore, selectThemePreference } from '@/stores/auth-store';
import { updateProfile } from '@/lib/api';
import type { ThemePreference } from '@/types';

type Theme = ThemePreference;

/**
 * Theme configuration with icons
 */
const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
  {
    value: 'light',
    label: 'Light',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    ),
  },
  {
    value: 'system',
    label: 'System',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

/**
 * Apply theme to document by toggling 'dark' class on <html>
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * ThemeSwitcher component
 *
 * Displays a dropdown to select light, dark, or system theme.
 * Syncs selection to auth store and backend API when logged in.
 */
export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Get auth state
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const userThemePreference = useAuthStore(selectThemePreference);
  const updateUser = useAuthStore((state) => state.updateUser);

  // Initialize theme on mount
  useEffect(() => {
    // Priority: auth store (if logged in) > localStorage > system
    let initialTheme: Theme = 'system';

    if (isAuthenticated && userThemePreference) {
      // Use theme from auth store (which came from profile)
      initialTheme = userThemePreference;
    } else {
      // Fall back to localStorage
      const stored = localStorage.getItem('theme') as Theme | null;
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        initialTheme = stored;
      }
    }

    setTheme(initialTheme);
    applyTheme(initialTheme);
    localStorage.setItem('theme', initialTheme);
    setMounted(true);
  }, [isAuthenticated, userThemePreference]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  /**
   * Handle theme change with optimistic updates
   * 1. Apply immediately to UI
   * 2. Save to localStorage (cache)
   * 3. If logged in, sync to backend and auth store
   */
  const handleThemeChange = useCallback(async (newTheme: Theme) => {
    // 1. Apply immediately (optimistic update)
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    setIsOpen(false);

    // 2. If logged in, sync to backend
    if (isAuthenticated && user?.hasProfile) {
      setIsSyncing(true);
      try {
        await updateProfile({ themePreference: newTheme });
        // Update auth store to keep it in sync
        updateUser({ themePreference: newTheme });
      } catch (error) {
        // Silently fail - theme is already applied locally
        console.error('Failed to sync theme preference:', error);
      } finally {
        setIsSyncing(false);
      }
    }
  }, [isAuthenticated, user?.hasProfile, updateUser]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-card border border-border" />
    );
  }

  const currentTheme = themes.find((t) => t.value === theme);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg bg-card border border-border hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors ${
          isSyncing ? 'opacity-70' : ''
        }`}
        aria-label={`Current theme: ${currentTheme?.label}. Click to change.`}
        disabled={isSyncing}
      >
        {currentTheme?.icon}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-36 rounded-lg bg-card border border-border shadow-elevated z-20 py-1">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => handleThemeChange(t.value)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  theme === t.value
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-foreground hover:bg-primary-50 dark:hover:bg-primary-900/30'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
