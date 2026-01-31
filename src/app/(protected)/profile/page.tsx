'use client';

/**
 * Profile Page - View user profile and health metrics
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { getProfile, getHealthMetrics } from '@/lib/api';
import { Avatar, Spinner } from '@/components/ui';
import type { UserProfile, HealthMetrics } from '@/types';

/**
 * Activity level labels for display (matches backend enum)
 */
const activityLevelLabels: Record<string, string> = {
  sedentary: 'Sedentary (little to no exercise)',
  lightly_active: 'Lightly Active (1-3 days/week)',
  moderately_active: 'Moderately Active (3-5 days/week)',
  very_active: 'Very Active (6-7 days/week)',
  extremely_active: 'Extremely Active (physical job or 2x training)',
};

/**
 * Theme preference labels for display
 */
const themeLabels: Record<string, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System (follows device)',
};

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileData, metricsData] = await Promise.all([
          getProfile(),
          getHealthMetrics().catch(() => null),
        ]);
        setProfile(profileData);
        setMetrics(metricsData);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Complete Your Profile
        </h1>
        <p className="text-muted mb-6">
          Set up your profile to get personalized health metrics and recommendations.
        </p>
        <Link href="/profile/edit" className="btn-primary">
          Set Up Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <Link href="/profile/edit" className="btn-secondary">
          Edit Profile
        </Link>
      </div>

      {/* User info card */}
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <Avatar
            name={user?.name || 'User'}
            picture={user?.picture}
            size="lg"
          />
          <div>
            <h2 className="text-xl font-semibold text-foreground">{user?.name}</h2>
            <p className="text-muted">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted">Age</p>
            <p className="font-medium text-foreground">
              {profile.age ? `${profile.age} years` : 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">Biological Sex</p>
            <p className="font-medium text-foreground capitalize">
              {profile.sex || 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">Height</p>
            <p className="font-medium text-foreground">
              {profile.heightCm ? `${profile.heightCm} cm` : 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">Current Weight</p>
            <p className="font-medium text-foreground">
              {profile.weightKg ? `${profile.weightKg} kg` : 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">Target Weight</p>
            <p className="font-medium text-foreground">
              {profile.targetWeightKg ? `${profile.targetWeightKg} kg` : 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">Activity Level</p>
            <p className="font-medium text-foreground">
              {profile.activityLevel
                ? activityLevelLabels[profile.activityLevel]
                : 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">Theme Preference</p>
            <p className="font-medium text-foreground">
              {profile.themePreference
                ? themeLabels[profile.themePreference]
                : 'System (follows device)'}
            </p>
          </div>
        </div>
      </div>

      {/* Health metrics */}
      {metrics && (
        <div className="card">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Calculated Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted">BMR</p>
              <p className="text-2xl font-bold text-foreground">{metrics.bmr}</p>
              <p className="text-xs text-muted">kcal/day</p>
            </div>
            <div>
              <p className="text-sm text-muted">TDEE</p>
              <p className="text-2xl font-bold text-foreground">{metrics.tdee}</p>
              <p className="text-xs text-muted">kcal/day</p>
            </div>
            {metrics.bmi && (
              <div>
                <p className="text-sm text-muted">BMI</p>
                <p className="text-2xl font-bold text-foreground">
                  {metrics.bmi.toFixed(1)}
                </p>
                <p className="text-xs text-muted">{metrics.bmiCategory}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted">Target</p>
              <p className="text-2xl font-bold text-foreground">
                {metrics.targetCalories}
              </p>
              <p className="text-xs text-muted">kcal/day</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
