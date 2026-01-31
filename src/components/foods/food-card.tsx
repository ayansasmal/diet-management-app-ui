'use client';

/**
 * FoodCard - Display food item in a card format with macro grid
 *
 * Shows food name, category, serving size, and macro breakdown.
 * Used on the /foods browse page.
 */

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { FoodSummary } from '@/types';

/**
 * Props for FoodCard component
 */
interface FoodCardProps {
  /** Food data to display */
  food: FoodSummary;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Macro item display component
 */
function MacroItem({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className={cn('text-sm font-semibold', color)}>
        {value}
        {unit}
      </div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

/**
 * FoodCard component
 */
export function FoodCard({ food, className }: FoodCardProps) {
  return (
    <Link
      href={`/foods/${food.id}`}
      className={cn(
        'card hover:shadow-elevated transition-shadow duration-200 group block',
        className
      )}
    >
      {/* Header with category icon and name */}
      <div className="flex items-start gap-3">
        {/* Category icon */}
        {food.categoryIcon && (
          <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-xl shrink-0">
            {food.categoryIcon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Food name */}
          <h3 className="font-semibold text-foreground group-hover:text-primary-600 transition-colors truncate">
            {food.name}
          </h3>

          {/* Brand and category */}
          <p className="text-sm text-muted truncate">
            {food.brandName && <span>{food.brandName} · </span>}
            {food.categoryName}
          </p>
        </div>

        {/* Verified badge */}
        {food.isVerified && (
          <div
            className="shrink-0 text-primary-600"
            title="Verified"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Serving size */}
      <div className="mt-3 text-xs text-muted">
        Per {food.defaultServingName}
      </div>

      {/* Macro grid */}
      <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-border">
        <MacroItem
          label="Cal"
          value={food.calories}
          unit=""
          color="text-foreground"
        />
        <MacroItem
          label="Protein"
          value={food.protein}
          unit="g"
          color="text-primary-600 dark:text-primary-400"
        />
        <MacroItem
          label="Carbs"
          value={food.carbs}
          unit="g"
          color="text-warning-600 dark:text-warning-500"
        />
        <MacroItem
          label="Fat"
          value={food.fat}
          unit="g"
          color="text-error-600 dark:text-error-500"
        />
      </div>

      {/* Tags (if any) */}
      {food.tags.length > 0 && (
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {food.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded text-xs bg-card border border-border text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
