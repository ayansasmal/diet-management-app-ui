'use client';

/**
 * DailyTotals Component
 *
 * Displays daily macro totals with optional targets comparison.
 */

import { cn } from '@/lib/utils';
import type { DailySummary } from '@/types';

/**
 * Props for DailyTotals component.
 */
interface DailyTotalsProps {
  /** Daily summary data */
  summary: DailySummary;
  /** Optional targets for comparison */
  targets?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  /** Additional CSS classes */
  className?: string;
}

/**
 * Calculate progress percentage capped at 100%.
 */
function getProgress(current: number, target: number): number {
  if (!target || target <= 0) return 0;
  return Math.min((current / target) * 100, 100);
}

/**
 * Get color based on progress percentage.
 */
function getProgressColor(progress: number, isLimitBased = false): string {
  if (isLimitBased) {
    // For carbs: lower is better
    if (progress >= 100) return 'bg-error-500';
    if (progress >= 80) return 'bg-warning-500';
    return 'bg-success-500';
  }
  // For protein/calories: higher is better (up to target)
  if (progress >= 90) return 'bg-success-500';
  if (progress >= 50) return 'bg-primary-500';
  return 'bg-gray-400';
}

/**
 * Daily macro totals display with progress bars.
 */
export function DailyTotals({ summary, targets, className }: DailyTotalsProps) {
  const macros = [
    {
      label: 'Calories',
      value: summary.totalCalories,
      unit: 'kcal',
      target: targets?.calories,
      color: 'bg-primary-500',
      textColor: 'text-foreground',
    },
    {
      label: 'Protein',
      value: summary.totalProtein,
      unit: 'g',
      target: targets?.protein,
      color: 'bg-primary-600',
      textColor: 'text-primary-600',
    },
    {
      label: 'Carbs',
      value: summary.totalCarbs,
      unit: 'g',
      target: targets?.carbs,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      isLimit: true,
    },
    {
      label: 'Fat',
      value: summary.totalFat,
      unit: 'g',
      target: targets?.fat,
      color: 'bg-rose-500',
      textColor: 'text-rose-600',
    },
  ];

  return (
    <div className={cn('card p-4', className)}>
      <h3 className="font-semibold text-foreground mb-4">Daily Totals</h3>
      <div className="space-y-4">
        {macros.map((macro) => {
          const progress = macro.target ? getProgress(macro.value, macro.target) : 0;
          const progressColor = macro.target
            ? getProgressColor(progress, macro.isLimit)
            : macro.color;

          return (
            <div key={macro.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted">{macro.label}</span>
                <span className={cn('text-sm font-medium', macro.textColor)}>
                  {Math.round(macro.value)}
                  {macro.unit}
                  {macro.target && (
                    <span className="text-muted font-normal">
                      {' / '}
                      {macro.target}
                      {macro.unit}
                    </span>
                  )}
                </span>
              </div>
              {macro.target && (
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-300', progressColor)}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
