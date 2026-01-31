'use client';

/**
 * Glucose Tracking Page - Log and view glucose readings
 */

import { useEffect, useState } from 'react';
import { logGlucose, getGlucoseHistory, deleteGlucose } from '@/lib/api';
import { formatDisplayDate } from '@/lib/utils';
import { Spinner } from '@/components/ui';
import type { GlucoseLog, GlucoseType } from '@/types';

const glucoseTypes: { value: GlucoseType; label: string; description: string }[] = [
  { value: 'fasting', label: 'Fasting', description: 'Before eating (8+ hours)' },
  { value: 'post_meal', label: 'Post-Meal', description: '2 hours after eating' },
  { value: 'random', label: 'Random', description: 'Any other time' },
];

export default function GlucoseTrackingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [glucoseHistory, setGlucoseHistory] = useState<GlucoseLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [glucoseMmol, setGlucoseMmol] = useState<string>('');
  const [type, setType] = useState<GlucoseType>('fasting');
  const [notes, setNotes] = useState('');

  // Fetch glucose history
  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await getGlucoseHistory(30);
        setGlucoseHistory(response.logs);
      } catch (err) {
        console.error('Failed to fetch glucose history:', err);
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
      const glucose = parseFloat(glucoseMmol);
      if (isNaN(glucose) || glucose < 1 || glucose > 40) {
        throw new Error('Please enter a valid glucose level between 1 and 40 mmol/L');
      }

      const newLog = await logGlucose({
        glucoseMmolL: glucose,
        readingType: type,
        notes: notes || undefined,
      });

      // Add to history
      setGlucoseHistory((prev) => [newLog, ...prev]);

      // Reset form
      setGlucoseMmol('');
      setNotes('');
      setSuccess('Glucose reading logged successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log glucose');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this glucose reading?')) return;

    try {
      await deleteGlucose(id);
      setGlucoseHistory((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
    }
  };

  const getGlucoseStatus = (value: number, readingType: GlucoseType) => {
    // Normal ranges (mmol/L)
    if (readingType === 'fasting') {
      if (value < 4.0) return { status: 'low', label: 'Low' };
      if (value <= 5.5) return { status: 'normal', label: 'Normal' };
      if (value <= 6.9) return { status: 'elevated', label: 'Elevated' };
      return { status: 'high', label: 'High' };
    } else {
      // Post-meal or random
      if (value < 4.0) return { status: 'low', label: 'Low' };
      if (value <= 7.8) return { status: 'normal', label: 'Normal' };
      if (value <= 11.0) return { status: 'elevated', label: 'Elevated' };
      return { status: 'high', label: 'High' };
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
      <h1 className="text-2xl font-bold text-foreground">Glucose Tracking</h1>

      {/* Log form */}
      <form onSubmit={handleSubmit} className="card">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Log Glucose Reading
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

        {/* Glucose type */}
        <div className="mb-4">
          <label className="label">Reading Type</label>
          <div className="grid grid-cols-3 gap-3">
            {glucoseTypes.map((t) => (
              <label
                key={t.value}
                className={`text-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  type === t.value
                    ? 'border-primary-600 bg-primary-600/10'
                    : 'border-border hover:border-primary-400 dark:hover:border-primary-600'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={t.value}
                  checked={type === t.value}
                  onChange={(e) => setType(e.target.value as GlucoseType)}
                  className="sr-only"
                />
                <div className={`font-medium text-sm ${
                  type === t.value
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-foreground'
                }`}>{t.label}</div>
                <div className={`text-xs mt-1 ${
                  type === t.value
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-muted'
                }`}>{t.description}</div>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="glucose" className="label">
              Glucose Level (mmol/L)
            </label>
            <input
              type="number"
              id="glucose"
              value={glucoseMmol}
              onChange={(e) => setGlucoseMmol(e.target.value)}
              step="0.1"
              min="1"
              max="40"
              placeholder="e.g., 5.5"
              className="input"
              required
            />
          </div>
          <div>
            <label htmlFor="notes" className="label">
              Notes (optional)
            </label>
            <input
              type="text"
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Before breakfast"
              className="input"
            />
          </div>
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
            'Log Reading'
          )}
        </button>
      </form>

      {/* Reference ranges */}
      <div className="info-card">
        <h3 className="info-card-title">Reference Ranges</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="info-card-label">Fasting</p>
            <p className="info-card-text">Normal: 4.0 - 5.5 mmol/L</p>
          </div>
          <div>
            <p className="info-card-label">Post-Meal (2h)</p>
            <p className="info-card-text">Normal: 4.0 - 7.8 mmol/L</p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Recent Readings
        </h2>

        {glucoseHistory.length === 0 ? (
          <p className="text-muted text-center py-8">
            No glucose readings yet. Start logging to monitor your levels!
          </p>
        ) : (
          <div className="divide-y divide-border">
            {glucoseHistory.map((entry) => {
              const { status, label } = getGlucoseStatus(entry.glucoseMmolL, entry.readingType);

              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {entry.glucoseMmolL} mmol/L
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          status === 'normal'
                            ? 'bg-success-100 text-success-700'
                            : status === 'low'
                              ? 'bg-warning-100 text-warning-700'
                              : status === 'elevated'
                                ? 'bg-warning-100 text-warning-700'
                                : 'bg-error-100 text-error-700'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    <p className="text-sm text-muted">
                      {formatDisplayDate(entry.logDate)} •{' '}
                      <span className="capitalize">{entry.readingType.replace('_', ' ')}</span>
                      {entry.notes && ` • ${entry.notes}`}
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
