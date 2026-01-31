/**
 * Tracking API - Weight and Glucose logging endpoints
 */

import { get, post, del } from './client';
import type {
  WeightLog,
  WeightHistoryResponse,
  CreateWeightLogDto,
  GlucoseLog,
  GlucoseHistoryResponse,
  CreateGlucoseLogDto,
} from '@/types';

/* ═══════════════════════════════════════════════════════════════════════════
   Weight Tracking
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Get weight history with statistics
 *
 * @param limit - Maximum entries to return (default: 30)
 * @param startDate - Optional start date filter (YYYY-MM-DD)
 * @param endDate - Optional end date filter (YYYY-MM-DD)
 * @returns Weight history with stats (logs, total, startingWeight, currentWeight, totalChange)
 */
export async function getWeightHistory(
  limit = 30,
  startDate?: string,
  endDate?: string
): Promise<WeightHistoryResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  return get<WeightHistoryResponse>(`/tracking/weight?${params.toString()}`);
}

/**
 * Get today's weight entry
 *
 * @returns Today's weight log or null if not logged
 */
export async function getTodayWeight(): Promise<WeightLog | null> {
  try {
    return await get<WeightLog>('/tracking/weight/today');
  } catch {
    // 404 means no weight logged today
    return null;
  }
}

/**
 * Log weight (upserts for current date)
 *
 * If a weight entry already exists for the date, it will be updated.
 *
 * @param data - Weight log data
 * @returns Created/updated weight log
 */
export async function logWeight(data: CreateWeightLogDto): Promise<WeightLog> {
  return post<WeightLog>('/tracking/weight', data);
}

/**
 * Delete a weight entry
 *
 * @param id - Weight log ID
 */
export async function deleteWeight(id: string): Promise<void> {
  await del(`/tracking/weight/${id}`);
}

/* ═══════════════════════════════════════════════════════════════════════════
   Glucose Tracking
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Get glucose history with statistics
 *
 * @param limit - Maximum entries to return (default: 30)
 * @param startDate - Optional start date filter (YYYY-MM-DD)
 * @param endDate - Optional end date filter (YYYY-MM-DD)
 * @returns Glucose history with stats (logs, total, averageFasting, averagePostMeal)
 */
export async function getGlucoseHistory(
  limit = 30,
  startDate?: string,
  endDate?: string
): Promise<GlucoseHistoryResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  return get<GlucoseHistoryResponse>(`/tracking/glucose?${params.toString()}`);
}

/**
 * Get today's glucose entries
 *
 * @returns Array of today's glucose logs
 */
export async function getTodayGlucose(): Promise<GlucoseLog[]> {
  return get<GlucoseLog[]>('/tracking/glucose/today');
}

/**
 * Log glucose reading
 *
 * Unlike weight, multiple glucose entries per day are allowed.
 *
 * @param data - Glucose log data
 * @returns Created glucose log
 */
export async function logGlucose(data: CreateGlucoseLogDto): Promise<GlucoseLog> {
  return post<GlucoseLog>('/tracking/glucose', data);
}

/**
 * Delete a glucose entry
 *
 * @param id - Glucose log ID
 */
export async function deleteGlucose(id: string): Promise<void> {
  await del(`/tracking/glucose/${id}`);
}

/* ═══════════════════════════════════════════════════════════════════════════
   Summary Endpoints
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Get daily tracking summary
 *
 * @returns Summary of today's tracking data
 */
export async function getDailySummary(): Promise<{
  weight: WeightLog | null;
  glucose: GlucoseLog[];
  lastWeightChange?: number;
}> {
  const [weight, glucose] = await Promise.all([
    getTodayWeight(),
    getTodayGlucose(),
  ]);

  return {
    weight,
    glucose,
  };
}
