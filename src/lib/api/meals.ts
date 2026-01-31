/**
 * Meals API Client
 *
 * API functions for meal logging operations.
 *
 * @module lib/api/meals
 */

import { get, post, patch, del } from './client';
import type {
  MealLog,
  DailySummary,
  MealHistoryResponse,
  CreateMealDto,
  QuickLogMealDto,
  UpdateMealMetadataDto,
  MealQueryParams,
  CreateMealFoodItem,
} from '@/types';

/**
 * Create a new meal log with food items.
 *
 * @param data - Meal creation data
 * @returns Created meal with food items
 */
export async function createMeal(data: CreateMealDto): Promise<MealLog> {
  return post<MealLog>('/meals', data);
}

/**
 * Quick log a meal with a single food from the database.
 *
 * @param data - Quick log data (foodId, servingId, quantity)
 * @returns Created meal
 */
export async function quickLogMeal(data: QuickLogMealDto): Promise<MealLog> {
  return post<MealLog>('/meals/quick', data);
}

/**
 * Get meal history with optional filtering and pagination.
 *
 * @param params - Query parameters
 * @returns Paginated meal list
 */
export async function getMealHistory(params: MealQueryParams = {}): Promise<MealHistoryResponse> {
  const urlParams = new URLSearchParams();
  if (params.date) urlParams.append('date', params.date);
  if (params.startDate) urlParams.append('startDate', params.startDate);
  if (params.endDate) urlParams.append('endDate', params.endDate);
  if (params.mealType) urlParams.append('mealType', params.mealType);
  if (params.page) urlParams.append('page', String(params.page));
  if (params.limit) urlParams.append('limit', String(params.limit));
  const query = urlParams.toString();
  return get<MealHistoryResponse>(`/meals${query ? `?${query}` : ''}`);
}

/**
 * Get today's meals with daily totals.
 *
 * @returns Today's daily summary
 */
export async function getTodaysMeals(): Promise<DailySummary> {
  return get<DailySummary>('/meals/today');
}

/**
 * Get meal daily summary for a specific date.
 *
 * @param date - Date in YYYY-MM-DD format (defaults to today)
 * @returns Daily meal summary with totals
 */
export async function getMealDailySummary(date?: string): Promise<DailySummary> {
  const query = date ? `?date=${date}` : '';
  return get<DailySummary>(`/meals/summary${query}`);
}

/**
 * Get a meal by ID.
 *
 * @param id - Meal ID
 * @returns Meal details with food items
 */
export async function getMealById(id: string): Promise<MealLog> {
  return get<MealLog>(`/meals/${id}`);
}

/**
 * Update a meal log.
 *
 * @param id - Meal ID
 * @param data - Update data (can include new food items)
 * @returns Updated meal
 */
export async function updateMeal(id: string, data: Partial<CreateMealDto>): Promise<MealLog> {
  return patch<MealLog>(`/meals/${id}`, data);
}

/**
 * Update only meal metadata (rating, notes, photo).
 * Does not affect food items.
 *
 * @param id - Meal ID
 * @param data - Metadata update data
 * @returns Updated meal
 */
export async function updateMealMetadata(id: string, data: UpdateMealMetadataDto): Promise<MealLog> {
  return patch<MealLog>(`/meals/${id}/metadata`, data);
}

/**
 * Add a food item to an existing meal.
 *
 * @param mealId - Meal ID
 * @param item - Food item data
 * @returns Updated meal
 */
export async function addFoodItemToMeal(mealId: string, item: CreateMealFoodItem): Promise<MealLog> {
  return post<MealLog>(`/meals/${mealId}/items`, item);
}

/**
 * Remove a food item from a meal.
 *
 * @param mealId - Meal ID
 * @param itemId - Food item ID
 * @returns Updated meal
 */
export async function removeFoodItemFromMeal(mealId: string, itemId: string): Promise<MealLog> {
  return del<MealLog>(`/meals/${mealId}/items/${itemId}`);
}

/**
 * Delete a meal log.
 *
 * @param id - Meal ID
 */
export async function deleteMeal(id: string): Promise<void> {
  return del<void>(`/meals/${id}`);
}
