/**
 * Foods API Client
 *
 * Endpoints for browsing food database, categories, and nutrition data.
 * Admin CRUD operations deferred to MVP-3.
 */

import { get } from './client';
import type {
  FoodCategory,
  FoodListResponse,
  FoodDetails,
  FoodSearchParams,
} from '@/types';

/**
 * Get all food categories
 *
 * @returns Array of categories with icons, colors, and unit info
 *
 * @example
 * ```ts
 * const categories = await getCategories();
 * // Returns: FoodCategory[] with name, icon, slug, etc.
 * ```
 */
export async function getCategories(): Promise<FoodCategory[]> {
  return get<FoodCategory[]>('/foods/categories');
}

/**
 * Search foods with optional filters
 *
 * @param params - Search parameters (query, category, page, limit)
 * @returns Paginated food list with summary nutrition data
 *
 * @example
 * ```ts
 * // Search by name
 * const results = await searchFoods({ q: 'chicken' });
 *
 * // Filter by category
 * const proteins = await searchFoods({ category: 'protein' });
 *
 * // Paginated results
 * const page2 = await searchFoods({ page: 2, limit: 20 });
 * ```
 */
export async function searchFoods(
  params: FoodSearchParams = {}
): Promise<FoodListResponse> {
  const urlParams = new URLSearchParams();

  if (params.q) urlParams.append('q', params.q);
  if (params.category) urlParams.append('category', params.category);
  if (params.tag) urlParams.append('tag', params.tag);
  if (params.verifiedOnly) urlParams.append('verifiedOnly', 'true');
  if (params.page) urlParams.append('page', String(params.page));
  if (params.limit) urlParams.append('limit', String(params.limit));

  const query = urlParams.toString();
  return get<FoodListResponse>(`/foods${query ? `?${query}` : ''}`);
}

/**
 * Get full details of a food item
 *
 * @param id - Food ID
 * @returns Complete food with all servings and nutrition data
 *
 * @example
 * ```ts
 * const food = await getFoodById('food-chicken-breast');
 * // Returns: FoodDetails with servings[], category, nutrition per serving
 * ```
 */
export async function getFoodById(id: string): Promise<FoodDetails> {
  return get<FoodDetails>(`/foods/${id}`);
}
