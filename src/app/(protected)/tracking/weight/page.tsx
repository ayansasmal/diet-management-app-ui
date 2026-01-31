'use client';

/**
 * Weight Tracking Page - Log and view weight history
 */

import { useEffect, useState } from 'react';
import { logWeight, getWeightHistory, deleteWeight } from '@/lib/api';
import { formatDisplayDate, formatDateForApi } from '@/lib/utils';
import { Spinner } from '@/components/ui';
import type { WeightLog } from '@/types';

export default function WeightTrackingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [weightHistory, setWeightHistory] = useState<WeightLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [weightKg, setWeightKg] = useState<string>('');

  // Fetch weight history
  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await getWeightHistory(30);
        setWeightHistory(response.logs);

        // Pre-fill with today's weight if exists
        const todayStr = formatDateForApi();
        const todayWeight = response.logs.find((w) => w.logDate === todayStr);
        if (todayWeight) {
          setWeightKg(todayWeight.weightKg.toString());
        }
      } catch (err) {
        console.error('Failed to fetch weight history:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const weight = parseFloat(weightKg);
      if (isNaN(weight) || weight < 30 || weight > 300) {
        throw new Error('Please enter a valid weight between 30 and 300 kg');
      }

      const newLog = await logWeight({ weightKg: weight });

      // Update history - replace today's entry or add new
      const todayStr = formatDateForApi();
      setWeightHistory((prev) => {
        const filtered = prev.filter((w) => w.logDate !== todayStr);
        return [newLog, ...filtered];
      });

      setSuccess('Weight logged successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log weight');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this weight entry?')) return;

    try {
      await deleteWeight(id);
      setWeightHistory((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
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
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Weight Tracking</h1>

      {/* Log form */}
      <form onSubmit={handleSubmit} className="card">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Log Today&apos;s Weight
        </h2>

        {error && (
          <div className="p-3 rounded-lg bg-error-50 text-error-700 text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-success-50 text-success-700 text-sm mb-4">
            {success}
          </div>
        )}

        <div>
          <label htmlFor="weight" className="label">
            Weight (kg)
          </label>
          <input
            type="number"
            id="weight"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            step="0.1"
            min="20"
            max="300"
            placeholder="e.g., 75.5"
            className="input"
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full mt-4"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Spinner size="sm" className="border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            'Log Weight'
          )}
        </button>
      </form>

      {/* History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Recent History
        </h2>

        {weightHistory.length === 0 ? (
          <p className="text-muted text-center py-8">
            No weight entries yet. Start logging to see your progress!
          </p>
        ) : (
          <div className="divide-y divide-border">
            {weightHistory.map((entry, index) => {
              const prevEntry = weightHistory[index + 1];
              const change = prevEntry
                ? entry.weightKg - prevEntry.weightKg
                : null;

              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {entry.weightKg} kg
                      {change !== null && (
                        <span
                          className={`ml-2 text-sm ${
                            change < 0
                              ? 'text-success-600'
                              : change > 0
                                ? 'text-error-600'
                                : 'text-muted'
                          }`}
                        >
                          {change > 0 ? '+' : ''}
                          {change.toFixed(1)} kg
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted">
                      {formatDisplayDate(entry.logDate)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-muted hover:text-error-600 p-2"
                    aria-label="Delete entry"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
