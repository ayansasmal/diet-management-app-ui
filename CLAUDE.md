# Frontend — Claude Guide

Next.js frontend for diet management with React 19 and Tailwind CSS v4.

## Commands

```bash
npm run dev        # Dev server (port 3001)
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript check
```

## Code Patterns

### API Client: Auto-injects JWT

```typescript
import { apiClient } from '@/lib/api/client';
const response = await apiClient('/users/profile');
```

### Zustand Store: Persist to localStorage

```typescript
export const useAuthStore = create<AuthState>()(
  persist((set) => ({ user: null, setUser: (user) => set({ user }) }), { name: 'auth-storage' })
);
```

### Protected Routes: AuthGuard wrapper

```typescript
export default function Page() {
  return <AuthGuard><Content /></AuthGuard>;
}
```

## Structure

| Directory | Purpose |
|-----------|---------|
| `src/app/(auth)/` | Login pages |
| `src/app/(protected)/` | Authenticated pages |
| `src/components/ui/` | Base UI components |
| `src/components/layout/` | Header, Sidebar |
| `src/lib/api/` | API client |
| `src/lib/nutrition/` | Rule evaluation engine |
| `src/stores/` | Zustand stores |
| `src/types/` | TypeScript interfaces |

## Environment

- `NEXT_PUBLIC_API_URL` — Backend URL (http://localhost:3000/api)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — OAuth client ID
- Tailwind v4 with OKLCH colors in `globals.css`
