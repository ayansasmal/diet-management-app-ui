import Link from 'next/link';

/**
 * Landing Page - Public home page
 *
 * Marketing/info page for unauthenticated users.
 * Authenticated users are typically redirected to /dashboard.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-health flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
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
            <span className="font-semibold text-foreground">Diet Management App</span>
          </Link>
          <Link href="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero section */}
      <section className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text content */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Your Digital Companion for{' '}
                <span className="text-primary-600">Personalized Diet Management</span>
              </h1>
              <p className="mt-6 text-lg text-muted">
                Transform your health journey with personalized tracking, intelligent insights,
                and daily engagement. Built on proven low-carb diet research.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/login" className="btn-primary text-center">
                  Get Started Free
                </Link>
                <a href="#features" className="btn-secondary text-center">
                  Learn More
                </a>
              </div>
            </div>

            {/* Illustration */}
            <div className="hidden md:flex justify-center">
              <div className="w-80 h-80 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full gradient-health flex items-center justify-center">
                    <svg
                      className="w-20 h-20 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="bg-card py-16 md:py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-muted max-w-2xl mx-auto">
              Track your progress, understand your metrics, and stay motivated with
              personalized insights based on proven research.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card text-center">
              <div className="w-12 h-12 rounded-xl bg-primary-100 mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Weight Tracking
              </h3>
              <p className="text-muted text-sm">
                Log daily weight with trend analysis and progress visualization.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card text-center">
              <div className="w-12 h-12 rounded-xl bg-warning-100 mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-warning-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Glucose Monitoring
              </h3>
              <p className="text-muted text-sm">
                Track fasting and post-meal glucose with healthy range guidance.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card text-center">
              <div className="w-12 h-12 rounded-xl bg-success-100 mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-success-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Personalized Metrics
              </h3>
              <p className="text-muted text-sm">
                BMR, TDEE, and calorie targets calculated using proven formulas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Ready to Start Your Journey?
          </h2>
          <p className="mt-4 text-muted">
            Join thousands who are transforming their health with personalized diet management.
          </p>
          <Link href="/login" className="btn-primary mt-8 inline-block">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted">
          <p>© {new Date().getFullYear()} Diet Management App. All rights reserved.</p>
          <p className="mt-2">
            Built on proven low-carb diet research.
          </p>
        </div>
      </footer>
    </div>
  );
}
