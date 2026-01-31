'use client';

/**
 * Plan Details Page - View full nutrition plan details
 *
 * Displays complete plan information including daily targets,
 * meal structure, rules, and tips.
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPlanById } from '@/lib/api';
import { Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { PlanDetails, NumericConstraint, PlanRule, MealSlot } from '@/types';

/**
 * Format numeric constraint as readable string
 */
function formatConstraint(constraint: NumericConstraint | undefined): string {
  if (!constraint) return '—';

  if (constraint.target !== undefined) {
    return `${constraint.target}`;
  }

  if (constraint.min !== undefined && constraint.max !== undefined) {
    return `${constraint.min}–${constraint.max}`;
  }

  if (constraint.min !== undefined) {
    return `≥${constraint.min}`;
  }

  if (constraint.max !== undefined) {
    return `≤${constraint.max}`;
  }

  return '—';
}

/**
 * Get rule severity badge styles
 */
function getRuleSeverityStyles(severity: PlanRule['severity']): string {
  switch (severity) {
    case 'info':
      return 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400';
    case 'warning':
      return 'bg-warning-100 text-warning-600 dark:bg-warning-500/20 dark:text-warning-500';
    case 'error':
      return 'bg-error-100 text-error-700 dark:bg-error-500/20 dark:text-error-500';
  }
}

/**
 * Get meal type icon
 */
function getMealIcon(type: MealSlot['type']): string {
  switch (type) {
    case 'breakfast':
      return '🌅';
    case 'lunch':
      return '☀️';
    case 'dinner':
      return '🌙';
    case 'snack':
      return '🍎';
  }
}

/**
 * Plan details page component
 */
export default function PlanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const planId = params.id as string;

  // Fetch plan details on mount
  useEffect(() => {
    async function fetchPlan() {
      try {
        const data = await getPlanById(planId);
        setPlan(data);
      } catch (err) {
        console.error('Failed to fetch plan:', err);
        setError(err instanceof Error ? err.message : 'Failed to load plan');
      } finally {
        setIsLoading(false);
      }
    }

    if (planId) {
      fetchPlan();
    }
  }, [planId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !plan) {
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
            <p className="text-error-600 font-medium">{error || 'Plan not found'}</p>
            <button onClick={() => router.push('/plans')} className="btn-secondary mt-4">
              Back to Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/plans"
        className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Plans
      </Link>

      {/* Plan header */}
      <div className="card">
        <div className="flex items-start gap-4">
          {/* Plan icon */}
          {plan.icon && (
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
              style={{
                backgroundColor: plan.accentColor ? `${plan.accentColor}20` : 'var(--color-primary-100)',
              }}
            >
              {plan.icon}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground">{plan.name}</h1>
            <p className="text-muted mt-1">{plan.shortDescription}</p>

            {/* Badges */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-medium',
                  plan.difficulty === 'beginner'
                    ? 'bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-500'
                    : plan.difficulty === 'intermediate'
                      ? 'bg-warning-100 text-warning-600 dark:bg-warning-500/20 dark:text-warning-500'
                      : 'bg-error-100 text-error-700 dark:bg-error-500/20 dark:text-error-500'
                )}
              >
                {plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1)}
              </span>
              {plan.isPremium && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400">
                  Premium
                </span>
              )}
              {plan.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full text-xs bg-card border border-border text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Long description */}
        {plan.longDescription && (
          <p className="mt-4 text-foreground leading-relaxed">{plan.longDescription}</p>
        )}

        {/* Source attribution */}
        {plan.sourceAttribution && (
          <p className="mt-4 text-sm text-muted">
            <span className="font-medium">Source:</span> {plan.sourceAttribution}
          </p>
        )}
      </div>

      {/* Daily targets */}
      <div className="card">
        <h2 className="text-lg font-semibold text-foreground mb-4">Daily Targets</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-card border border-border">
            <div className="text-2xl font-bold text-foreground">
              {formatConstraint(plan.dailyTargets.calories)}
            </div>
            <div className="text-sm text-muted mt-1">Calories</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-card border border-border">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {formatConstraint(plan.dailyTargets.protein)}g
            </div>
            <div className="text-sm text-muted mt-1">Protein</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-card border border-border">
            <div className="text-2xl font-bold text-warning-600 dark:text-warning-500">
              {formatConstraint(plan.dailyTargets.carbs)}g
            </div>
            <div className="text-sm text-muted mt-1">
              {plan.useNetCarbs ? 'Net Carbs' : 'Carbs'}
            </div>
          </div>
          <div className="text-center p-4 rounded-lg bg-card border border-border">
            <div className="text-2xl font-bold text-error-600 dark:text-error-500">
              {formatConstraint(plan.dailyTargets.fat)}g
            </div>
            <div className="text-sm text-muted mt-1">Fat</div>
          </div>
        </div>
        {plan.dailyTargets.fiber && (
          <div className="mt-4 text-sm text-muted">
            <span className="font-medium">Fiber target:</span>{' '}
            {formatConstraint(plan.dailyTargets.fiber)}g per day
          </div>
        )}
      </div>

      {/* Meal structure */}
      <div className="card">
        <h2 className="text-lg font-semibold text-foreground mb-4">Meal Structure</h2>
        <div className="space-y-3">
          {plan.mealFlow.slots
            .sort((a, b) => a.order - b.order)
            .map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getMealIcon(slot.type)}</span>
                  <div>
                    <div className="font-medium text-foreground">{slot.name}</div>
                    <div className="text-xs text-muted capitalize">{slot.type}</div>
                  </div>
                </div>
                {slot.required ? (
                  <span className="px-2 py-0.5 rounded text-xs bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400">
                    Required
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-xs bg-card border border-border text-muted">
                    Optional
                  </span>
                )}
              </div>
            ))}
        </div>
        <div className="mt-4 text-sm text-muted">
          {plan.mealFlow.allowSkipping && '• Meals can be skipped '}
          {plan.mealFlow.allowReordering && '• Meals can be reordered'}
        </div>
      </div>

      {/* Rules */}
      {plan.rules.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Plan Rules</h2>
          <div className="space-y-3">
            {plan.rules
              .filter((rule) => rule.enabled)
              .map((rule) => (
                <div
                  key={rule.id}
                  className="p-3 rounded-lg bg-card border border-border"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium shrink-0',
                        getRuleSeverityStyles(rule.severity)
                      )}
                    >
                      {rule.severity.charAt(0).toUpperCase() + rule.severity.slice(1)}
                    </span>
                    <div>
                      <div className="font-medium text-foreground">{rule.name}</div>
                      {rule.description && (
                        <div className="text-sm text-muted mt-1">{rule.description}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {plan.tips && plan.tips.length > 0 && (
        <div className="info-card">
          <h3 className="info-card-title flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Tips for Success
          </h3>
          <ul className="info-card-text text-sm space-y-2 mt-2">
            {plan.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary-600 shrink-0">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
