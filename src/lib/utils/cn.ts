/**
 * Class name utility - combines clsx and tailwind-merge
 *
 * This pattern prevents Tailwind class conflicts by intelligently merging
 * conflicting classes (e.g., `px-4 px-2` becomes `px-2`).
 *
 * @example
 * ```tsx
 * // Merge classes without conflicts
 * cn('px-4 py-2', 'px-2') // => 'py-2 px-2'
 *
 * // Conditional classes
 * cn('base-class', isActive && 'active-class')
 *
 * // With variants
 * cn(
 *   'btn',
 *   variant === 'primary' && 'btn-primary',
 *   variant === 'secondary' && 'btn-secondary'
 * )
 * ```
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind merge for conflict resolution
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
