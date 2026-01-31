'use client';

/**
 * Log Meal Page
 *
 * Create a new meal log with food items, rating, and notes.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMeal } from '@/lib/api';
import { Spinner } from '@/components/ui';
import { FoodSelector } from '@/components/meals';
import { cn } from '@/lib/utils';
import type { CreateMealFoodItem, MealType } from '@/types';

/**
 * Meal type options.
 */
const MEAL_TYPES: { value: MealType; label: string; icon: string }[] = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snack', label: 'Snack', icon: '🍎' },
];

/**
 * Star rating input component.
 */
function RatingInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (rating: number | null) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(value === star ? null : star)}
          className="p-1 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
        >
          <svg
            className={cn(
              'w-8 h-8 transition-colors',
              value !== null && star <= value
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-300 hover:text-amber-300'
            )}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="ml-2 text-sm text-muted hover:text-foreground"
        >
          Clear
        </button>
      )}
    </div>
  );
}

/**
 * Log meal page component.
 */
export default function LogMealPage() {
  const router = useRouter();
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [foodItems, setFoodItems] = useState<CreateMealFoodItem[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const totals = foodItems.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories * item.quantity,
      protein: acc.protein + item.protein * item.quantity,
      carbs: acc.carbs + item.carbs * item.quantity,
      fat: acc.fat + item.fat * item.quantity,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Add food item
  const handleAddFood = (item: CreateMealFoodItem) => {
    setFoodItems([...foodItems, item]);
  };

  // Remove food item
  const handleRemoveFood = (index: number) => {
    setFoodItems(foodItems.filter((_, i) => i !== index));
  };

  // Submit meal
  const handleSubmit = async () => {
    if (foodItems.length === 0) {
      setError('Please add at least one food item');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createMeal({
        mealType,
        foodItems,
        rating: rating ?? undefined,
        notes: notes.trim() || undefined,
      });
      router.push('/meals');
    } catch (err) {
      console.error('Failed to create meal:', err);
      setError(err instanceof Error ? err.message : 'Failed to save meal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Log Meal</h1>
          <p className="text-muted">Add foods and track your nutrition</p>
        </div>
      </div>

      {/* Meal Type Selector */}
      <div className="card p-4">
        <label className="block text-sm font-medium text-muted mb-3">Meal Type</label>
        <div className="grid grid-cols-4 gap-2">
          {MEAL_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setMealType(type.value)}
              className={cn(
                'p-3 rounded-lg border-2 transition-colors text-center',
                mealType === type.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                  : 'border-border hover:border-primary-300'
              )}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <div className="text-sm font-medium">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Food Selector */}
      <div className="card p-4">
        <label className="block text-sm font-medium text-muted mb-3">Add Foods</label>
        <FoodSelector onSelect={handleAddFood} />
      </div>

      {/* Added Foods List */}
      {foodItems.length > 0 && (
        <div className="card p-4">
          <h3 className="font-medium text-foreground mb-3">
            Foods Added ({foodItems.length})
          </h3>
          <div className="divide-y divide-border">
            {foodItems.map((item, index) => (
              <div key={index} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">{item.foodName}</div>
                  <div className="text-sm text-muted">
                    {item.quantity} × {item.servingName} • {Math.round(item.calories * item.quantity)} kcal
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFood(index)}
                  className="p-2 text-muted hover:text-error-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-xl font-bold text-foreground">{Math.round(totals.calories)}</div>
                <div className="text-xs text-muted">kcal</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary-600">{Math.round(totals.protein)}g</div>
                <div className="text-xs text-muted">protein</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-600">{Math.round(totals.carbs)}g</div>
                <div className="text-xs text-muted">carbs</div>
              </div>
              <div>
                <div className="text-xl font-bold text-rose-600">{Math.round(totals.fat)}g</div>
                <div className="text-xs text-muted">fat</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating and Notes */}
      <div className="card p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            How was this meal? (optional)
          </label>
          <RatingInput value={rating} onChange={setRating} />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did you feel after this meal? Any thoughts to remember..."
            rows={3}
            className="input w-full resize-none"
            maxLength={500}
          />
          <div className="text-xs text-muted text-right mt-1">{notes.length}/500</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
          <p className="text-error-700 dark:text-error-400">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || foodItems.length === 0}
        className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Spinner size="sm" />
            Saving...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Save Meal
          </>
        )}
      </button>
    </div>
  );
}
