/**
 * Users API - Profile management endpoints
 */

import { get, post, patch } from './client';
import { useAuthStore } from '@/stores/auth-store';
import type { UserProfile, CreateProfileDto, HealthMetrics } from '@/types';

/**
 * Get current user's profile
 *
 * @returns User profile data
 */
export async function getProfile(): Promise<UserProfile> {
  return get<UserProfile>('/users/profile');
}

/**
 * Create user profile (initial onboarding)
 *
 * @param data - Profile creation data
 * @returns Created profile
 */
export async function createProfile(data: CreateProfileDto): Promise<UserProfile> {
  const profile = await post<UserProfile>('/users/profile', data);

  // Update auth store to reflect profile completion
  useAuthStore.getState().updateUser({ hasProfile: true });

  return profile;
}

/**
 * Update user profile
 *
 * @param data - Partial profile data to update
 * @returns Updated profile
 */
export async function updateProfile(data: Partial<CreateProfileDto>): Promise<UserProfile> {
  return patch<UserProfile>('/users/profile', data);
}

/**
 * Get calculated health metrics (BMR, TDEE, BMI)
 *
 * Requires a weight entry for BMI calculation.
 *
 * @returns Calculated health metrics
 */
export async function getHealthMetrics(): Promise<HealthMetrics> {
  return get<HealthMetrics>('/calculator/metrics');
}

/**
 * Calculate BMR without saving (preview)
 *
 * @param data - Profile data for calculation
 * @returns BMR calculation result
 */
export async function calculateBmr(data: {
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  activityLevel: string;
}): Promise<{ bmr: number; tdee: number }> {
  return post<{ bmr: number; tdee: number }>('/calculator/bmr', data);
}
