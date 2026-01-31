'use client';

/**
 * MealCard Component
 *
 * Displays a meal summary with macros and optional rating.
 * Clicking navigates to meal details (future feature).
 */

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { MealSummary } from '@/types';

/**
 * Props for MealCard component.
 */
interface MealCardProps {
  /** Meal data */
  meal: MealSummary;
  /** Optional click handler (overrides navigation) */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Meal type display config.
 */
const MEAL_TYPE_CONFIG = {
  breakfast: { label: 'Breakfast', icon: '🌅', color: 'text-amber-600' },
  lunch: { label: 'Lunch', icon: '☀️', color: 'text-yellow-600' },
  dinner: { label: 'Dinner', icon: '🌙', color: 'text-indigo-600' },
  snack: { label: 'Snack', icon: '🍎', color: 'text-green-600' },
};

/**
 * Render star rating.
 */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={cn(
            'w-3.5 h-3.5',
            star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
          )}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/**
 * Meal summary card component.
 */
export function MealCard({ meal, onClick, className }: MealCardProps) {
  const config = MEAL_TYPE_CONFIG[meal.mealType];

  const content = (
    <div
      className={cn(
        'card p-4 hover:shadow-md transition-shadow cursor-pointer',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <span className={cn('font-medium', config.color)}>{config.label}</span>
        </div>
        {meal.rating && <StarRating rating={meal.rating} />}
      </div>

      {/* Macros Grid */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-lg font-semibold text-foreground">
            {Math.round(meal.totalCalories)}
          </div>
          <div className="text-xs text-muted">kcal</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-primary-600">
            {Math.round(meal.totalProtein)}g
          </div>
          <div className="text-xs text-muted">protein</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-amber-600">
            {Math.round(meal.totalCarbs)}g
          </div>
          <div className="text-xs text-muted">carbs</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-rose-600">
            {Math.round(meal.totalFat)}g
          </div>
          <div className="text-xs text-muted">fat</div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
        <span>{meal.itemCount} item{meal.itemCount !== 1 ? 's' : ''}</span>
        {meal.photoUrl && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Photo
          </span>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }

  return <Link href={`/meals/${meal.id}`}>{content}</Link>;
}
