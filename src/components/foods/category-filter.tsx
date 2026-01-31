'use client';

/**
 * CategoryFilter - Horizontal scrollable category chips
 *
 * Allows filtering foods by category. Shows all categories as chips
 * with the selected one highlighted.
 */

import { cn } from '@/lib/utils';
import type { FoodCategory } from '@/types';

/**
 * Props for CategoryFilter component
 */
interface CategoryFilterProps {
  /** Available categories */
  categories: FoodCategory[];
  /** Currently selected category slug (null for all) */
  selected: string | null;
  /** Callback when category is selected */
  onSelect: (slug: string | null) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CategoryFilter component
 */
export function CategoryFilter({
  categories,
  selected,
  onSelect,
  className,
}: CategoryFilterProps) {
  return (
    <div
      className={cn(
        'flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide',
        className
      )}
    >
      {/* All category chip */}
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors',
          selected === null
            ? 'bg-primary-600 text-white'
            : 'bg-card border border-border text-foreground hover:bg-primary-50 dark:hover:bg-primary-900/30'
        )}
      >
        All
      </button>

      {/* Category chips */}
      {categories.map((category) => (
        <button
          key={category.slug}
          onClick={() => onSelect(category.slug)}
          className={cn(
            'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2',
            selected === category.slug
              ? 'bg-primary-600 text-white'
              : 'bg-card border border-border text-foreground hover:bg-primary-50 dark:hover:bg-primary-900/30'
          )}
        >
          {category.icon && <span>{category.icon}</span>}
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
}
