'use client';

/**
 * Protected Layout - Wrapper for authenticated pages
 *
 * Includes:
 * - AuthGuard for route protection
 * - Sidebar navigation (desktop)
 * - Header with user menu
 */

import { AuthGuard } from '@/components/auth';
import { Header, Sidebar } from '@/components/layout';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex">
        {/* Sidebar - Desktop only */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header />

          {/* Page content */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
