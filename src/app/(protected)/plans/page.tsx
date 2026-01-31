'use client';

/**
 * Plans Browse Page - View available nutrition plans
 *
 * Displays all system and public nutrition plans with filtering by difficulty.
 * Clicking a plan navigates to its details page.
 */

import { useEffect, useState } from 'react';
import { listPlans } from '@/lib/api';
import { Spinner } from '@/components/ui';
import { PlanCard } from '@/components/plans';
import { cn } from '@/lib/utils';
import type { PlanSummary, PlanDifficulty } from '@/types';

/**
 * Difficulty filter options
 */
const DIFFICULTY_OPTIONS: { value: PlanDifficulty | 'all'; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

/**
 * Plans browse page component
 */
export default function PlansPage() {
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<PlanDifficulty | 'all'>('all');

  // Fetch plans on mount
  useEffect(() => {
    async function fetchPlans() {
      try {
        const data = await listPlans();
        setPlans(data);
      } catch (err) {
        console.error('Failed to fetch plans:', err);
        setError(err instanceof Error ? err.message : 'Failed to load plans');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlans();
  }, []);

  // Filter plans by difficulty
  const filteredPlans =
    difficultyFilter === 'all'
      ? plans
      : plans.filter((plan) => plan.difficulty === difficultyFilter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-error-100 dark:bg-error-500/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-error-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-error-600 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary mt-4"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nutrition Plans</h1>
        <p className="text-muted mt-1">
          Browse evidence-based nutrition plans designed for different goals and lifestyles.
        </p>
      </div>

      {/* Difficulty filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {DIFFICULTY_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setDifficultyFilter(option.value)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors',
              difficultyFilter === option.value
                ? 'bg-primary-600 text-white'
                : 'bg-card border border-border text-foreground hover:bg-primary-50 dark:hover:bg-primary-900/30'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Plans grid */}
      {filteredPlans.length === 0 ? (
        <div className="card">
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-muted">No plans found for this difficulty level.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}

      {/* Info card */}
      <div className="info-card">
        <h3 className="info-card-title flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          About Nutrition Plans
        </h3>
        <p className="info-card-text text-sm">
          These plans are based on scientific research and dietary guidelines. They incorporate
          evidence-based approaches to low-carb and balanced nutrition. Always consult with a
          healthcare professional before starting any new diet plan.
        </p>
      </div>
    </div>
  );
}
