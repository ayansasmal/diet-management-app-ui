'use client';

/**
 * FoodSelector Component
 *
 * Search and select foods from the database to add to a meal.
 * Shows nutrition info and allows quantity adjustment.
 */

import { useState, useEffect, useCallback } from 'react';
import { searchFoods, getFoodById } from '@/lib/api';
import { Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { FoodSummary, FoodDetails, FoodServing, CreateMealFoodItem } from '@/types';

/**
 * Props for FoodSelector component.
 */
interface FoodSelectorProps {
  /** Callback when a food item is selected */
  onSelect: (item: CreateMealFoodItem) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Debounce hook for search input.
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Food selector component for meal logging.
 */
export function FoodSelector({ onSelect, className }: FoodSelectorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodDetails | null>(null);
  const [selectedServing, setSelectedServing] = useState<FoodServing | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  // Search foods
  useEffect(() => {
    async function search() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await searchFoods({ q: debouncedQuery, limit: 10 });
        setResults(response.items);
      } catch (err) {
        console.error('Food search failed:', err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }

    search();
  }, [debouncedQuery]);

  // Load food details when selected
  const handleFoodClick = useCallback(async (food: FoodSummary) => {
    setIsLoadingDetails(true);
    try {
      const details = await getFoodById(food.id);
      setSelectedFood(details);
      // Set default serving
      const defaultServing = details.servings.find((s) => s.isDefault) || details.servings[0];
      setSelectedServing(defaultServing);
      setQuantity(1);
      setQuery('');
      setResults([]);
    } catch (err) {
      console.error('Failed to load food details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  // Add selected food to meal
  const handleAddFood = useCallback(() => {
    if (!selectedFood || !selectedServing) return;

    const item: CreateMealFoodItem = {
      foodId: selectedFood.id,
      servingId: selectedServing.id,
      foodName: selectedFood.name,
      servingName: selectedServing.servingName,
      quantity,
      calories: selectedServing.calories,
      protein: selectedServing.protein,
      carbs: selectedServing.carbs,
      fat: selectedServing.fat,
      fiber: selectedServing.fiber ?? 0,
      isCustomEntry: false,
    };

    onSelect(item);
    setSelectedFood(null);
    setSelectedServing(null);
    setQuantity(1);
  }, [selectedFood, selectedServing, quantity, onSelect]);

  // Calculate nutrition for current quantity
  const calculatedNutrition = selectedServing
    ? {
        calories: Math.round(selectedServing.calories * quantity),
        protein: Math.round(selectedServing.protein * quantity * 10) / 10,
        carbs: Math.round(selectedServing.carbs * quantity * 10) / 10,
        fat: Math.round(selectedServing.fat * quantity * 10) / 10,
      }
    : null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Input */}
      {!selectedFood && (
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search foods..."
            className="input w-full pl-10"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner size="sm" />
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && !selectedFood && (
        <div className="card divide-y divide-border max-h-64 overflow-y-auto">
          {results.map((food) => (
            <button
              key={food.id}
              onClick={() => handleFoodClick(food)}
              className="w-full px-4 py-3 text-left hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">{food.name}</div>
                  <div className="text-sm text-muted">
                    {food.categoryIcon} {food.categoryName} • {food.defaultServingName}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium">{food.calories} kcal</div>
                  <div className="text-muted">P: {food.protein}g</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {query.trim() && !isSearching && results.length === 0 && !selectedFood && (
        <div className="text-center text-muted py-4">
          No foods found for &quot;{query}&quot;
        </div>
      )}

      {/* Loading Details */}
      {isLoadingDetails && (
        <div className="flex items-center justify-center py-8">
          <Spinner size="lg" />
        </div>
      )}

      {/* Selected Food Editor */}
      {selectedFood && selectedServing && (
        <div className="card p-4 space-y-4">
          {/* Food Name */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-foreground">{selectedFood.name}</h4>
              {selectedFood.brandName && (
                <p className="text-sm text-muted">{selectedFood.brandName}</p>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedFood(null);
                setSelectedServing(null);
              }}
              className="text-muted hover:text-foreground"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Serving Selector */}
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Serving Size</label>
            <select
              value={selectedServing.id}
              onChange={(e) => {
                const serving = selectedFood.servings.find((s) => s.id === e.target.value);
                if (serving) setSelectedServing(serving);
              }}
              className="input w-full"
            >
              {selectedFood.servings.map((serving) => (
                <option key={serving.id} value={serving.id}>
                  {serving.servingName} ({serving.calories} kcal)
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(0.25, quantity - 0.25))}
                className="btn-secondary w-10 h-10 flex items-center justify-center"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0.25, parseFloat(e.target.value) || 0.25))}
                step="0.25"
                min="0.25"
                className="input w-20 text-center"
              />
              <button
                onClick={() => setQuantity(quantity + 0.25)}
                className="btn-secondary w-10 h-10 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Calculated Nutrition */}
          {calculatedNutrition && (
            <div className="grid grid-cols-4 gap-2 py-3 border-y border-border text-center">
              <div>
                <div className="text-lg font-semibold">{calculatedNutrition.calories}</div>
                <div className="text-xs text-muted">kcal</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-primary-600">
                  {calculatedNutrition.protein}g
                </div>
                <div className="text-xs text-muted">protein</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-amber-600">
                  {calculatedNutrition.carbs}g
                </div>
                <div className="text-xs text-muted">carbs</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-rose-600">
                  {calculatedNutrition.fat}g
                </div>
                <div className="text-xs text-muted">fat</div>
              </div>
            </div>
          )}

          {/* Add Button */}
          <button onClick={handleAddFood} className="btn-primary w-full">
            Add to Meal
          </button>
        </div>
      )}
    </div>
  );
}
