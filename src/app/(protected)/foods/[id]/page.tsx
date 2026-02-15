'use client';

/**
 * Food Details Page - View complete food nutrition information
 *
 * Displays full food details with serving selector and nutrition facts.
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getFoodById } from '@/lib/api';
import { Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { FoodDetails, FoodServing } from '@/types';

/**
 * Nutrition row component
 */
function NutritionRow({
  label,
  value,
  unit,
  indent = false,
  bold = false,
}: {
  label: string;
  value: number | undefined;
  unit: string;
  indent?: boolean;
  bold?: boolean;
}) {
  if (value === undefined || value === null) return null;

  return (
    <div
      className={cn(
        'flex justify-between py-2 border-b border-border',
        indent && 'pl-4',
        bold && 'font-semibold'
      )}
    >
      <span className={cn('text-foreground', !bold && 'text-muted')}>{label}</span>
      <span className="text-foreground">
        {value}
        {unit}
      </span>
    </div>
  );
}

/**
 * Food details page component
 */
export default function FoodDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [food, setFood] = useState<FoodDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServing, setSelectedServing] = useState<FoodServing | null>(null);

  const foodId = params.id as string;

  // Fetch food details on mount
  useEffect(() => {
    async function fetchFood() {
      try {
        const data = await getFoodById(foodId);
        setFood(data);

        // Set default serving
        const defaultServing = data.servings.find((s) => s.isDefault) || data.servings[0];
        setSelectedServing(defaultServing);
      } catch (err) {
        console.error('Failed to fetch food:', err);
        setError(err instanceof Error ? err.message : 'Failed to load food');
      } finally {
        setIsLoading(false);
      }
    }

    if (foodId) {
      fetchFood();
    }
  }, [foodId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !food) {
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
            <p className="text-error-600 font-medium">{error || 'Food not found'}</p>
            <button onClick={() => router.push('/foods')} className="btn-secondary mt-4">
              Back to Foods
            </button>
          </div>
        </div>
      </div>
    );
  }

  const serving = selectedServing || food.servings[0];

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      {/* Back link */}
      <Link
        href="/foods"
        className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Foods
      </Link>

      {/* Food header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Category icon or food image */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-2xl sm:text-3xl shrink-0">
            {food.category?.icon || '🍽️'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{food.name}</h1>
                {food.brandName && <p className="text-muted">{food.brandName}</p>}
              </div>

              {/* Verified badge */}
              {food.isVerified && (
                <div className="shrink-0 text-primary-600" title="Verified">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Category */}
            {food.category && (
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400">
                  {food.category.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {food.description && (
          <p className="mt-4 text-muted">{food.description}</p>
        )}

        {/* Tags */}
        {food.tags.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {food.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full text-xs bg-card border border-border text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Serving selector */}
      {food.servings.length > 1 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-foreground mb-3">Serving Size</h2>
          <div className="flex gap-2 flex-wrap">
            {food.servings.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedServing(s)}
                className={cn(
                  'px-3 py-2 sm:px-4 min-h-[44px] rounded-lg text-sm font-medium transition-colors',
                  serving.id === s.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-card border border-border text-foreground hover:bg-primary-50 dark:hover:bg-primary-900/30'
                )}
              >
                {s.servingName}
                <span className="ml-1 opacity-75">
                  ({s.servingSize}
                  {s.servingUnit})
                </span>
              </button>
            ))}
          </div>
          {serving.isUnitServing && (
            <p className="mt-2 text-sm text-primary-600 dark:text-primary-400">
              ✓ This serving equals 1 standard unit
            </p>
          )}
        </div>
      )}

      {/* Nutrition facts */}
      <div className="card">
        <h2 className="text-lg font-semibold text-foreground mb-1">Nutrition Facts</h2>
        <p className="text-sm text-muted mb-4">
          Per {serving.servingName} ({serving.servingSize}
          {serving.servingUnit})
        </p>

        <div className="border-t-4 border-foreground pt-2">
          <NutritionRow label="Calories" value={serving.calories} unit="" bold />
          <NutritionRow label="Total Fat" value={serving.fat} unit="g" bold />
          <NutritionRow label="Saturated Fat" value={serving.saturatedFat} unit="g" indent />
          <NutritionRow label="Cholesterol" value={serving.cholesterol} unit="mg" bold />
          <NutritionRow label="Sodium" value={serving.sodium} unit="mg" bold />
          <NutritionRow label="Total Carbohydrates" value={serving.carbs} unit="g" bold />
          <NutritionRow label="Dietary Fiber" value={serving.fiber} unit="g" indent />
          <NutritionRow label="Sugars" value={serving.sugar} unit="g" indent />
          <NutritionRow label="Protein" value={serving.protein} unit="g" bold />
          <NutritionRow label="Potassium" value={serving.potassium} unit="mg" />
        </div>
      </div>

      {/* Glycemic data */}
      {(serving.glycemicIndex !== undefined || serving.glycemicLoad !== undefined) && (
        <div className="card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Glycemic Data</h2>
          <div className="grid grid-cols-2 gap-4">
            {serving.glycemicIndex !== undefined && (
              <div className="text-center p-4 rounded-lg bg-card border border-border">
                <div className="text-2xl font-bold text-foreground">{serving.glycemicIndex}</div>
                <div className="text-sm text-muted mt-1">Glycemic Index</div>
                <div
                  className={cn(
                    'text-xs mt-1',
                    serving.glycemicIndex <= 55
                      ? 'text-success-600'
                      : serving.glycemicIndex <= 69
                        ? 'text-warning-600'
                        : 'text-error-600'
                  )}
                >
                  {serving.glycemicIndex <= 55
                    ? 'Low'
                    : serving.glycemicIndex <= 69
                      ? 'Medium'
                      : 'High'}
                </div>
              </div>
            )}
            {serving.glycemicLoad !== undefined && (
              <div className="text-center p-4 rounded-lg bg-card border border-border">
                <div className="text-2xl font-bold text-foreground">{serving.glycemicLoad}</div>
                <div className="text-sm text-muted mt-1">Glycemic Load</div>
                <div
                  className={cn(
                    'text-xs mt-1',
                    serving.glycemicLoad <= 10
                      ? 'text-success-600'
                      : serving.glycemicLoad <= 19
                        ? 'text-warning-600'
                        : 'text-error-600'
                  )}
                >
                  {serving.glycemicLoad <= 10
                    ? 'Low'
                    : serving.glycemicLoad <= 19
                      ? 'Medium'
                      : 'High'}
                </div>
              </div>
            )}
          </div>
          <p className="mt-4 text-sm text-muted">
            Glycemic Index (GI) measures how quickly a food raises blood sugar. Glycemic Load (GL)
            accounts for serving size. Lower values are better for blood sugar management.
          </p>
        </div>
      )}

      {/* Barcode info */}
      {food.barcode && (
        <div className="text-sm text-muted text-center">
          Barcode: {food.barcode}
        </div>
      )}
    </div>
  );
}
