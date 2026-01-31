'use client';

/**
 * Avatar Component - User profile picture with initials fallback
 *
 * Displays user's profile picture if available, otherwise shows
 * initials derived from their name on a colored background.
 */

import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Avatar size variants
 */
type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Size configuration for avatar variants
 */
const sizeConfig: Record<AvatarSize, { container: string; text: string; pixels: number }> = {
  sm: { container: 'w-8 h-8', text: 'text-xs', pixels: 32 },
  md: { container: 'w-10 h-10', text: 'text-sm', pixels: 40 },
  lg: { container: 'w-16 h-16', text: 'text-xl', pixels: 64 },
  xl: { container: 'w-24 h-24', text: 'text-3xl', pixels: 96 },
};

/**
 * Background colors for initials avatar (based on name hash)
 */
const bgColors = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
  'bg-rose-100 text-rose-700',
];

/**
 * Get initials from a name
 *
 * @param name - Full name string
 * @returns Up to 2 initials (e.g., "John Doe" → "JD")
 */
function getInitials(name: string): string {
  if (!name) return '?';

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    // Single name - return first two characters or just first
    return parts[0].substring(0, 2).toUpperCase();
  }

  // Multiple names - return first letter of first and last name
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);

  return (first + last).toUpperCase();
}

/**
 * Get consistent color based on name
 *
 * @param name - Name to hash
 * @returns CSS class string for background and text color
 */
function getColorFromName(name: string): string {
  if (!name) return bgColors[0];

  // Simple hash function to get consistent color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % bgColors.length;
  return bgColors[index];
}

interface AvatarProps {
  /** User's display name */
  name: string;
  /** URL to profile picture (optional) */
  picture?: string | null;
  /** Size variant */
  size?: AvatarSize;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Avatar component with image or initials fallback
 *
 * @example
 * ```tsx
 * // With image
 * <Avatar name="John Doe" picture="https://..." size="md" />
 *
 * // Without image (shows "JD" initials)
 * <Avatar name="John Doe" size="lg" />
 * ```
 */
export function Avatar({ name, picture, size = 'md', className }: AvatarProps) {
  const config = sizeConfig[size];
  const initials = getInitials(name);
  const colorClass = getColorFromName(name);

  const containerClass = cn(
    'rounded-full flex items-center justify-center overflow-hidden',
    config.container,
    className
  );

  if (picture) {
    return (
      <div className={containerClass}>
        <Image
          src={picture}
          alt={name}
          width={config.pixels}
          height={config.pixels}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={cn(containerClass, colorClass)}>
      <span className={cn('font-semibold', config.text)}>{initials}</span>
    </div>
  );
}
