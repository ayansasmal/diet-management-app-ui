'use client';

/**
 * Profile Edit Page - Create or update user profile
 *
 * Collects health data needed for BMR/BMI calculations:
 * - Height, weight, age, sex for Mifflin-St Jeor equation
 * - Activity level for TDEE calculation
 * - Target weight for goal tracking
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { getProfile, createProfile, updateProfile } from '@/lib/api';
import { Spinner } from '@/components/ui';
import type { CreateProfileDto, ActivityLevel, Sex, ThemePreference } from '@/types';

/**
 * Activity level multipliers for TDEE calculation
 * Labels and descriptions help users self-identify
 */
const activityLevels: { value: ActivityLevel; label: string; description: string }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
  { value: 'lightly_active', label: 'Lightly Active', description: '1-3 days/week' },
  { value: 'moderately_active', label: 'Moderately Active', description: '3-5 days/week' },
  { value: 'very_active', label: 'Very Active', description: '6-7 days/week' },
  { value: 'extremely_active', label: 'Extremely Active', description: 'Physical job or 2x training' },
];

/**
 * Theme preference options with icons
 * Allows users to set their preferred UI theme
 */
const themeOptions: { value: ThemePreference; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Always use light theme',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Always use dark theme',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    ),
  },
  {
    value: 'system',
    label: 'System',
    description: 'Follow device settings',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

export default function ProfileEditPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state matches backend CreateProfileDto exactly
  const [formData, setFormData] = useState<CreateProfileDto>({
    heightCm: 170,
    weightKg: 70,
    age: 30,
    sex: 'male',
    activityLevel: 'moderately_active',
    targetWeightKg: 65,
    themePreference: 'system',
  });

  // Load existing profile data
  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile();
        // Check if profile has required fields populated
        if (profile.heightCm && profile.age) {
          setIsNewProfile(false);
          setFormData({
            heightCm: profile.heightCm,
            weightKg: profile.weightKg || 70,
            age: profile.age,
            sex: profile.sex || 'male',
            activityLevel: profile.activityLevel || 'moderately_active',
            targetWeightKg: profile.targetWeightKg || profile.weightKg || 65,
            themePreference: profile.themePreference || 'system',
          });
        }
      } catch {
        // New profile - use defaults
        setIsNewProfile(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (isNewProfile) {
        await createProfile(formData);
        updateUser({ hasProfile: true });
      } else {
        await updateProfile(formData);
      }
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {isNewProfile ? 'Complete Your Profile' : 'Edit Profile'}
      </h1>

      {isNewProfile && (
        <p className="text-muted mb-6">
          We need a few details to calculate your personalized health metrics.
        </p>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-error-50 text-error-700 text-sm">
            {error}
          </div>
        )}

        {/* Age */}
        <div>
          <label htmlFor="age" className="label">
            Age (years)
          </label>
          <input
            type="number"
            id="age"
            value={formData.age}
            onChange={(e) =>
              setFormData({ ...formData, age: parseInt(e.target.value) || 18 })
            }
            min={18}
            max={120}
            className="input"
            required
          />
          <p className="text-xs text-muted mt-1">Must be at least 18 years old</p>
        </div>

        {/* Sex (for BMR calculation) */}
        <div>
          <label className="label">Biological Sex</label>
          <p className="text-xs text-muted mb-2">Used for accurate BMR calculation</p>
          <div className="flex gap-4">
            {(['male', 'female'] as const).map((sex) => (
              <label
                key={sex}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="sex"
                  value={sex}
                  checked={formData.sex === sex}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sex: e.target.value as Sex,
                    })
                  }
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-foreground capitalize">{sex}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Height */}
        <div>
          <label htmlFor="height" className="label">
            Height (cm)
          </label>
          <input
            type="number"
            id="height"
            value={formData.heightCm}
            onChange={(e) =>
              setFormData({ ...formData, heightCm: parseInt(e.target.value) || 100 })
            }
            min={100}
            max={250}
            className="input"
            required
          />
        </div>

        {/* Current Weight */}
        <div>
          <label htmlFor="weight" className="label">
            Current Weight (kg)
          </label>
          <input
            type="number"
            id="weight"
            value={formData.weightKg}
            onChange={(e) =>
              setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 30 })
            }
            min={30}
            max={300}
            step={0.1}
            className="input"
            required
          />
        </div>

        {/* Target Weight */}
        <div>
          <label htmlFor="targetWeight" className="label">
            Target Weight (kg)
          </label>
          <input
            type="number"
            id="targetWeight"
            value={formData.targetWeightKg}
            onChange={(e) =>
              setFormData({ ...formData, targetWeightKg: parseFloat(e.target.value) || 30 })
            }
            min={30}
            max={300}
            step={0.1}
            className="input"
            required
          />
          <p className="text-xs text-muted mt-1">Your goal weight for tracking progress</p>
        </div>

        {/* Activity Level */}
        <div>
          <label className="label">Activity Level</label>
          <div className="space-y-2">
            {activityLevels.map((level) => {
              const isSelected = formData.activityLevel === level.value;
              return (
                <label
                  key={level.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-primary-600 bg-primary-600/10'
                      : 'border-border hover:border-primary-400 dark:hover:border-primary-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="activityLevel"
                    value={level.value}
                    checked={isSelected}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        activityLevel: e.target.value as ActivityLevel,
                      })
                    }
                    className="w-4 h-4 text-primary-600 accent-primary-600"
                  />
                  <div>
                    <span className={`font-medium ${
                      isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-foreground'
                    }`}>{level.label}</span>
                    <span className={`text-sm ml-2 ${
                      isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-muted'
                    }`}>{level.description}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Theme Preference */}
        <div>
          <label className="label">Theme Preference</label>
          <p className="text-xs text-muted mb-2">Choose your preferred app appearance</p>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((option) => {
              const isSelected = formData.themePreference === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-primary-600 bg-primary-600/10'
                      : 'border-border hover:border-primary-400 dark:hover:border-primary-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="themePreference"
                    value={option.value}
                    checked={isSelected}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        themePreference: e.target.value as ThemePreference,
                      })
                    }
                    className="sr-only"
                  />
                  <span className={isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-muted'}>
                    {option.icon}
                  </span>
                  <span className={`font-medium text-sm ${
                    isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-foreground'
                  }`}>{option.label}</span>
                  <span className={`text-xs text-center ${
                    isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-muted'
                  }`}>{option.description}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary flex-1"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex-1"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Spinner size="sm" className="border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
