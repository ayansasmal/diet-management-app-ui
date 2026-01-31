# Diet Management UI

Next.js frontend for the Diet Management App - a digital companion for personalized diet management.

## Features

- **Authentication**: Google Sign-In with JWT session management
- **Dashboard**: Today's stats, health metrics, and quick actions
- **Tracking**: Weight and glucose logging with history views
- **Nutrition Plans**: Browse and view plan details with rules
- **Food Database**: Search foods with category filtering
- **Meal Logging**: Log meals with food selection and ratings
- **Profile Management**: Edit profile with health metrics calculation

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI**: React 19 with Tailwind CSS v4
- **State**: Zustand 5 with persist middleware
- **Auth**: Google Identity Services
- **Types**: TypeScript strict mode

## Quick Start

### Prerequisites

- Node.js 20+
- Backend API running on port 3000

### Setup

1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/ayansasmal/diet-management-app-ui.git
   cd diet-management-app-ui
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your settings
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**: http://localhost:3001

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (e.g., http://localhost:3000/api) | Yes |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID | Yes |

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3001) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type check |

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login)
│   ├── (protected)/              # Authenticated pages
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── tracking/
│   │   ├── meals/
│   │   ├── plans/
│   │   └── foods/
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Tailwind theme
├── components/
│   ├── ui/                       # Base components
│   ├── auth/                     # Auth components
│   ├── layout/                   # Header, Sidebar
│   ├── plans/                    # Plan components
│   ├── foods/                    # Food components
│   └── meals/                    # Meal components
├── lib/
│   ├── api/                      # API client
│   ├── nutrition/                # Rule engine
│   └── utils/                    # Utilities
├── stores/                       # Zustand stores
└── types/                        # TypeScript types
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Google Sign-In |
| `/dashboard` | Today's overview and quick actions |
| `/profile` | View/edit profile and health metrics |
| `/tracking/weight` | Weight logging and history |
| `/tracking/glucose` | Glucose logging and history |
| `/meals` | Meal logging and daily summaries |
| `/meals/log` | Log a new meal |
| `/plans` | Browse nutrition plans |
| `/plans/[id]` | Plan details |
| `/foods` | Search food database |
| `/foods/[id]` | Food nutrition facts |

## Related Repository

- [Backend API](https://github.com/ayansasmal/diet-management-app-api) - NestJS backend with all project documentation

## License

Private - All rights reserved
