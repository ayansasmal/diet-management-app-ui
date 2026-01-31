# Claude AI Integration Guide - Frontend UI

This document provides context for working with Claude AI on the Diet Management UI.

## Project Overview

Next.js frontend for personalized diet management with React 19 and Tailwind CSS v4.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI**: React 19 with Tailwind CSS v4
- **State**: Zustand 5 with persist middleware
- **Auth**: Google Identity Services
- **Types**: TypeScript strict mode

## Common Commands

```bash
# Development
npm run dev                    # Start dev server (port 3001)
npm run build                  # Production build
npm run start                  # Start production server

# Quality checks
npm run lint                   # ESLint
npm run typecheck              # TypeScript check
```

## Code Patterns

### API Client Pattern
```typescript
// All API calls go through lib/api/client.ts with automatic JWT injection
import { apiClient } from '@/lib/api/client';

const response = await apiClient('/users/profile');
const data = await response.json();
```

### Zustand Store Pattern
```typescript
// Stores use persist middleware for localStorage sync
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    { name: 'auth-storage' }
  )
);
```

### Component Pattern
```typescript
// Components use TypeScript strict mode with explicit types
interface Props {
  id: string;
  onComplete?: () => void;
}

export function FoodCard({ id, onComplete }: Props) {
  // Component implementation
}
```

### Protected Routes Pattern
```typescript
// Protected pages use AuthGuard wrapper
import { AuthGuard } from '@/components/auth/auth-guard';

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <PageContent />
    </AuthGuard>
  );
}
```

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `src/app/(auth)/` | Auth pages (login) |
| `src/app/(protected)/` | Authenticated pages |
| `src/components/ui/` | Base UI components |
| `src/components/layout/` | Header, Sidebar |
| `src/lib/api/` | API client and endpoints |
| `src/lib/nutrition/` | Rule evaluation engine |
| `src/stores/` | Zustand stores |
| `src/types/` | TypeScript interfaces |

## Tailwind CSS v4

This project uses Tailwind CSS v4 with OKLCH colors defined in `globals.css`:

```css
@theme {
  --color-primary: oklch(0.6 0.15 220);
  --color-secondary: oklch(0.8 0.1 220);
}
```

## Environment Variables

Required:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - OAuth client ID

## Related Repositories

- [Backend API](https://github.com/ayansasmal/diet-management-app-api)
- [Documentation Hub](https://github.com/ayansasmal/low-carb-diet-app)

## Debugging Tips

1. **API type mismatches**: Frontend types must exactly match backend DTOs
2. **Auth failures**: Verify Google Client ID matches backend
3. **Build errors**: Run `npm run typecheck` to find type issues
4. **State not persisting**: Check Zustand persist middleware configuration

---

_Last Updated: January 31, 2026_
