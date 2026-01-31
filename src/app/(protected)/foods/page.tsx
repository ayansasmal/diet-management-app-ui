'use client';

/**
 * Foods Browse Page - Search and browse food database
 *
 * Displays searchable food list with category filtering.
 * Clicking a food navigates to its details page.
 */

import { useEffect, useState, useCallback } from 'react';
import { getCategories, searchFoods } from '@/lib/api';
import { Spinner } from '@/components/ui';
import { FoodCard, CategoryFilter } from '@/components/foods';
import type { FoodCategory, FoodSummary } from '@/types';

/**
 * Debounce hook for search input
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Foods browse page component
 */
export default function FoodsPage() {
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [foods, setFoods] = useState<FoodSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    }

    fetchCategories();
  }, []);

  // Fetch foods when filters change
  const fetchFoods = useCallback(async (resetPage = false) => {
    setIsSearching(true);
    const currentPage = resetPage ? 1 : page;

    try {
      const response = await searchFoods({
        q: debouncedSearch || undefined,
        category: selectedCategory || undefined,
        page: currentPage,
        limit: 12,
      });

      if (resetPage) {
        setFoods(response.items);
        setPage(1);
      } else {
        setFoods(response.items);
      }
      setHasMore(response.hasMore);
      setTotal(response.total);
    } catch (err) {
      console.error('Failed to fetch foods:', err);
      setError(err instanceof Error ? err.message : 'Failed to load foods');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [debouncedSearch, selectedCategory, page]);

  // Initial load and filter changes
  useEffect(() => {
    fetchFoods(true);
  }, [debouncedSearch, selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  // Page changes (load more)
  useEffect(() => {
    if (page > 1) {
      fetchFoods(false);
    }
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle category selection
  const handleCategorySelect = (slug: string | null) => {
    setSelectedCategory(slug);
    setPage(1);
  };

  // Handle load more
  const handleLoadMore = () => {
    setPage((p) => p + 1);
  };

  if (isLoading && foods.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-error-100 dark:bg-error-500/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-error-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-error-600 font-medium">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-secondary mt-4">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Food Database</h1>
        <p className="text-muted mt-1">
          Search our database of foods with detailed nutrition information.
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search foods..."
          className="input pl-12"
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={handleCategorySelect}
        />
      )}

      {/* Results count */}
      <div className="text-sm text-muted">
        {total} {total === 1 ? 'food' : 'foods'} found
        {selectedCategory && ` in ${categories.find((c) => c.slug === selectedCategory)?.name}`}
        {debouncedSearch && ` for "${debouncedSearch}"`}
      </div>

      {/* Foods grid */}
      {foods.length === 0 ? (
        <div className="card">
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <p className="text-muted">No foods found. Try adjusting your search or filters.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {foods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>

          {/* Load more button */}
          {hasMore && (
            <div className="text-center">
              <button
                onClick={handleLoadMore}
                disabled={isSearching}
                className="btn-secondary"
              >
                {isSearching ? (
                  <>
                    <Spinner size="sm" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
