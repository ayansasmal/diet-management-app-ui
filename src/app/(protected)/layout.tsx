'use client';

/**
 * Protected Layout - Wrapper for authenticated pages
 *
 * Includes:
 * - AuthGuard for route protection
 * - Sidebar navigation (desktop + mobile drawer)
 * - Header with user menu
 */

import { useState, useCallback } from 'react';
import { AuthGuard } from '@/components/auth';
import { Header, Sidebar } from '@/components/layout';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleMenuOpen = useCallback(() => setMobileMenuOpen(true), []);
  const handleMenuClose = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <AuthGuard>
      <div className="min-h-screen flex">
        {/* Sidebar - Desktop + Mobile drawer */}
        <Sidebar mobileMenuOpen={mobileMenuOpen} onClose={handleMenuClose} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header onMenuToggle={handleMenuOpen} />

          {/* Page content */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
