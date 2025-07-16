# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo finance tracker with separate frontend and backend packages managed via npm workspaces. The architecture uses:

- **Frontend**: React 19.1.0 + TypeScript + Vite + Tailwind CSS 4.1.11 (port 5173)
- **Backend**: Node.js + Express + TypeScript + SQLite3 (port 3001)
- **Database**: SQLite file at `backend/data/finance.db`

## Common Commands

### Development
```bash
npm run dev                # Start both frontend and backend concurrently
npm run dev:frontend      # Start frontend only (Vite dev server)
npm run dev:backend       # Start backend only (tsx watch mode)
```

### Build
```bash
npm run build            # Build frontend for production
cd backend && npm run build    # Build backend TypeScript to /dist
```

### Package Management
```bash
npm run install:all     # Install dependencies for root, frontend, and backend
```

## Database Architecture

The SQLite database uses a singleton pattern with a custom promisified wrapper. Key tables:
- `categories` - Income/expense categories with colors and icons
- `transactions` - Financial transactions with foreign key to categories
- `savings_goals` - User-defined savings targets
- `goal_contributions` - Contributions toward savings goals

Database initialization automatically seeds 13 default categories (4 income, 9 expense types) and creates proper indexes for performance.

**Important**: The database connection is managed through `src/database/init.ts` with `getDatabase()` function. All database operations use promisified SQLite methods (`run`, `get`, `all`).

## API Architecture

The backend provides RESTful endpoints with comprehensive validation:

- `/api/transactions` - Full CRUD with filtering by date, category, type + pagination
- `/api/categories` - Category management with transaction summaries and statistics
- `/api/goals` - Savings goals with contribution tracking
- `/api/health` - System health monitoring

All endpoints include proper error handling, input validation, and enriched responses (e.g., transactions include full category objects).

## Frontend Architecture

The frontend uses a tab-based navigation system with four main sections:
- Dashboard (overview cards + recent transactions + savings goals)
- Transactions (transaction management)
- Goals (savings goals management)
- Insights (charts and analytics)

**Current State**: The UI is implemented with static mock data and needs API integration. The design system uses custom Tailwind CSS classes defined in `src/index.css` with primary, success, and danger color palettes.

## Key Integration Points

### Frontend → Backend Connection
The frontend is currently displaying mock data and needs to be connected to the backend API. Use these patterns:
- Fetch data with proper error handling
- Use the existing TypeScript interfaces from `backend/src/models/types.ts`
- Implement loading states and error boundaries

### Database Operations
- Use `getDatabase()` from `src/database/init.ts` for all database operations
- All database methods are promisified and use async/await
- Include proper error handling for database operations

## Development Workflow

1. **Backend Development**: Use `npm run dev:backend` - tsx watch mode provides hot reloading
2. **Frontend Development**: Use `npm run dev:frontend` - Vite HMR for fast development
3. **Full Stack Development**: Use `npm run dev` - runs both concurrently

## Security and Validation

The backend includes:
- Rate limiting (100 requests per 15 minutes)
- CORS configuration (localhost:5173 for development)
- Helmet security middleware
- Input validation for all endpoints
- Proper HTTP status codes and error responses

## TypeScript Configuration

Both frontend and backend use strict TypeScript configuration. The backend includes comprehensive type definitions in `src/models/types.ts` for all API requests and responses.

## Custom Design System

The frontend uses a custom Tailwind CSS design system with:
- Custom color palettes (primary, success, danger)
- Reusable component classes (`.card`, `.btn-primary`, `.input`, etc.)
- Inter font family integration
- Responsive grid layouts