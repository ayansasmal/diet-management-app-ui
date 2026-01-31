/**
 * Plans API Client
 *
 * Endpoints for browsing and viewing nutrition plans.
 * Admin CRUD operations deferred to MVP-3.
 */

import { get } from './client';
import type { PlanSummary, PlanDetails } from '@/types';

/**
 * List all available nutrition plans
 *
 * @returns Array of plan summaries (system + public plans)
 *
 * @example
 * ```ts
 * const plans = await listPlans();
 * // Returns: PlanSummary[] with id, name, difficulty, tags, etc.
 * ```
 */
export async function listPlans(): Promise<PlanSummary[]> {
  return get<PlanSummary[]>('/plans');
}

/**
 * Get full details of a nutrition plan
 *
 * @param id - Plan ID
 * @returns Complete plan with targets, rules, meal flow
 *
 * @example
 * ```ts
 * const plan = await getPlanById('low_carb_standard');
 * // Returns: PlanDetails with dailyTargets, mealFlow, rules, tips
 * ```
 */
export async function getPlanById(id: string): Promise<PlanDetails> {
  return get<PlanDetails>(`/plans/${id}`);
}
