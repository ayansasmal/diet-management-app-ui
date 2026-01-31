'use client';

/**
 * Meals Page - View and manage meal logs
 *
 * Shows today's meals summary, quick log button, and meal history.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTodaysMeals, getMealHistory } from '@/lib/api';
import { Spinner } from '@/components/ui';
import { MealCard, DailyTotals } from '@/components/meals';
import type { DailySummary, MealSummary } from '@/types';

/**
 * Meals page component.
 */
export default function MealsPage() {
  const [todaySummary, setTodaySummary] = useState<DailySummary | null>(null);
  const [recentMeals, setRecentMeals] = useState<MealSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [today, history] = await Promise.all([
          getTodaysMeals(),
          getMealHistory({ limit: 10 }),
        ]);
        setTodaySummary(today);
        // Filter out today's meals from history (they're shown separately)
        const todayDate = new Date().toISOString().split('T')[0];
        setRecentMeals(history.meals.filter((m) => m.mealDate !== todayDate));
      } catch (err) {
        console.error('Failed to load meals:', err);
        setError(err instanceof Error ? err.message : 'Failed to load meals');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

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
            <button onClick={() => window.location.reload()} className="btn-secondary mt-4">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header with Log Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meals</h1>
          <p className="text-muted mt-1">Track your daily nutrition</p>
        </div>
        <Link href="/meals/log" className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Log Meal
        </Link>
      </div>

      {/* Today's Summary */}
      {todaySummary && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Today</h2>
          <DailyTotals summary={todaySummary} />

          {/* Today's Meals */}
          {todaySummary.meals.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {todaySummary.meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          ) : (
            <div className="card p-6 text-center">
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <p className="text-muted mb-4">No meals logged yet today</p>
              <Link href="/meals/log" className="btn-primary">
                Log Your First Meal
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Recent Meals */}
      {recentMeals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Recent</h2>
          <div className="space-y-2">
            {recentMeals.map((meal) => (
              <div key={meal.id} className="flex items-center gap-4">
                <div className="text-sm text-muted w-24">
                  {new Date(meal.mealDate).toLocaleDateString('en-AU', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </div>
                <div className="flex-1">
                  <MealCard meal={meal} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="info-card">
        <h3 className="info-card-title flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Meal Tracking Tips
        </h3>
        <p className="info-card-text text-sm">
          Log meals as you eat them for the most accurate tracking. You can add a rating and notes
          to help remember how meals made you feel. This data helps identify patterns in your
          eating habits.
        </p>
      </div>
    </div>
  );
}
