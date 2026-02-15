'use client';

/**
 * PlanCard - Display nutrition plan in a card format
 *
 * Shows plan name, description, difficulty badge, and tags.
 * Used on the /plans browse page.
 */

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { PlanSummary, PlanDifficulty } from '@/types';

/**
 * Props for PlanCard component
 */
interface PlanCardProps {
  /** Plan data to display */
  plan: PlanSummary;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get difficulty badge color classes
 */
function getDifficultyStyles(difficulty: PlanDifficulty): string {
  switch (difficulty) {
    case 'beginner':
      return 'bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-500';
    case 'intermediate':
      return 'bg-warning-100 text-warning-600 dark:bg-warning-500/20 dark:text-warning-500';
    case 'advanced':
      return 'bg-error-100 text-error-700 dark:bg-error-500/20 dark:text-error-500';
  }
}

/**
 * Format difficulty label with proper capitalization
 */
function formatDifficulty(difficulty: PlanDifficulty): string {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

/**
 * PlanCard component
 */
export function PlanCard({ plan, className }: PlanCardProps) {
  return (
    <Link
      href={`/plans/${plan.id}`}
      className={cn(
        'card hover:shadow-elevated transition-shadow duration-200 group block',
        className
      )}
    >
      {/* Header with icon and name */}
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Plan icon */}
        {plan.icon && (
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl shrink-0"
            style={{
              backgroundColor: plan.accentColor
                ? `${plan.accentColor}20`
                : 'var(--color-primary-100)',
            }}
          >
            {plan.icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Plan name */}
          <h3 className="font-semibold text-foreground group-hover:text-primary-600 transition-colors truncate">
            {plan.name}
          </h3>

          {/* Short description */}
          <p className="text-sm text-muted mt-1 line-clamp-2">
            {plan.shortDescription}
          </p>
        </div>
      </div>

      {/* Footer with badges */}
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        {/* Difficulty badge */}
        <span
          className={cn(
            'px-2.5 py-0.5 rounded-full text-xs font-medium',
            getDifficultyStyles(plan.difficulty)
          )}
        >
          {formatDifficulty(plan.difficulty)}
        </span>

        {/* Premium badge */}
        {plan.isPremium && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400">
            Premium
          </span>
        )}

        {/* Tags (show first 2) */}
        {plan.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-0.5 rounded-full text-xs bg-card border border-border text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
