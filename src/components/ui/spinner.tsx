/**
 * Spinner - Loading indicator component
 */

import { cn } from '@/lib/utils';

interface SpinnerProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Animated loading spinner
 *
 * @example
 * ```tsx
 * // Default medium size
 * <Spinner />
 *
 * // Large centered spinner
 * <div className="flex justify-center">
 *   <Spinner size="lg" />
 * </div>
 * ```
 */
export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div
      className={cn(
        'border-primary-200 border-t-primary-600 rounded-full animate-spin',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Full page loading state with centered spinner
 */
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
