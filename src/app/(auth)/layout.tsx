/**
 * Auth Layout - Wrapper for authentication pages
 *
 * Provides centered layout for login/signup pages with branding.
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-primary-100">
      {children}
    </div>
  );
}
