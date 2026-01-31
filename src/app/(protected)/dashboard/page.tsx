'use client';

/**
 * Dashboard Page - Main authenticated home page
 *
 * Shows:
 * - Today's tracking summary
 * - Quick actions for logging
 * - Health metrics overview
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { getDailySummary, getHealthMetrics } from '@/lib/api';
import { formatDisplayDate } from '@/lib/utils';
import { Spinner } from '@/components/ui';
import type { WeightLog, GlucoseLog, HealthMetrics } from '@/types';

/**
 * Dashboard overview page
 */
export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [todayWeight, setTodayWeight] = useState<WeightLog | null>(null);
  const [todayGlucose, setTodayGlucose] = useState<GlucoseLog[]>([]);
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    async function fetchData() {
      try {
        const [summary, healthMetrics] = await Promise.all([
          getDailySummary(),
          getHealthMetrics().catch(() => null),
        ]);

        setTodayWeight(summary.weight);
        setTodayGlucose(summary.glucose);
        setMetrics(healthMetrics);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const today = formatDisplayDate(new Date().toISOString(), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.name.split(' ')[0]}!
        </h1>
        <p className="text-muted mt-1">{today}</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/tracking/weight"
          className="card hover:shadow-elevated transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              <svg
                className="w-6 h-6 text-primary-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Log Weight</h3>
              <p className="text-sm text-muted">
                {todayWeight
                  ? `Today: ${todayWeight.weightKg} kg`
                  : 'Not logged yet'}
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/tracking/glucose"
          className="card hover:shadow-elevated transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning-100 flex items-center justify-center group-hover:bg-warning-50 transition-colors">
              <svg
                className="w-6 h-6 text-warning-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Log Glucose</h3>
              <p className="text-sm text-muted">
                {todayGlucose.length > 0
                  ? `${todayGlucose.length} reading${todayGlucose.length > 1 ? 's' : ''} today`
                  : 'No readings today'}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Health metrics */}
      {metrics && (
        <div className="card">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Your Health Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="metric-card">
              <p className="metric-value">{metrics.bmr}</p>
              <p className="metric-label">BMR (kcal)</p>
            </div>
            <div className="metric-card">
              <p className="metric-value">{metrics.tdee}</p>
              <p className="metric-label">TDEE (kcal)</p>
            </div>
            {metrics.bmi && (
              <div className="metric-card">
                <p className="metric-value">{metrics.bmi.toFixed(1)}</p>
                <p className="metric-label">BMI</p>
              </div>
            )}
            <div className="metric-card">
              <p className="metric-value">{metrics.targetCalories}</p>
              <p className="metric-label">Target (kcal)</p>
            </div>
          </div>
        </div>
      )}

      {/* Today's tracking */}
      <div className="card">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Today&apos;s Tracking
        </h2>

        {/* Weight */}
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-foreground">Weight</p>
              <p className="text-sm text-muted">
                {todayWeight ? `${todayWeight.weightKg} kg` : 'Not logged'}
              </p>
            </div>
          </div>
          {todayWeight ? (
            <span className="text-success-600 text-sm">✓ Logged</span>
          ) : (
            <Link
              href="/tracking/weight"
              className="text-primary-600 text-sm hover:underline"
            >
              Log now
            </Link>
          )}
        </div>

        {/* Glucose */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-warning-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-foreground">Glucose</p>
              <p className="text-sm text-muted">
                {todayGlucose.length > 0
                  ? `${todayGlucose.length} reading${todayGlucose.length > 1 ? 's' : ''}`
                  : 'No readings'}
              </p>
            </div>
          </div>
          <Link
            href="/tracking/glucose"
            className="text-primary-600 text-sm hover:underline"
          >
            {todayGlucose.length > 0 ? 'View all' : 'Log now'}
          </Link>
        </div>
      </div>
    </div>
  );
}
