# SIN JAPAN POKER

## Overview

SIN JAPAN POKER is a comprehensive online poker application inspired by PPPOKER, featuring real-time multiplayer gameplay, club management, tournaments, and social features. Built with Next.js 14 and Socket.io, the platform supports multiple poker variants including Texas Hold'em, Omaha, and Open Face Chinese (OFC).

The application serves as a full-featured poker platform with both play money and real money modes (configurable), club systems for private games, tournament management, and extensive player statistics tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Core Technologies**
- **Next.js 14** with App Router for server-side rendering and routing
- **TypeScript** for type safety across the application
- **React 18** with hooks-based component architecture
- **Tailwind CSS 3.x** for styling with custom poker-themed design system

**State Management Strategy**
- **Zustand** with persist middleware for global state management
- Multiple specialized stores for different domains:
  - `useAuthStore` - Authentication and user session
  - `useAppStore` - General application state and user data
  - `useCurrencyStore` - In-game currency and transactions
  - `useGameStore` - Active game state and Socket.io connection
  - `useTournamentStore` - Tournament data and registration
  - `useRevenueStore` - Revenue tracking and rake calculations
  - `useMoneyModeStore` - Play money vs real money mode toggling
  - `useAdminStore` - Admin authentication and permissions

The state is persisted to localStorage/sessionStorage for offline resilience and session recovery.

**UI Component Patterns**
- Protected routes via `ProtectedRoute` and `AdminProtectedRoute` components for authentication gates
- Custom loading states with `LoadingSpinner` and `PageTransition` components
- Reusable poker-specific components (`PokerTable`, `ActionButtons`, `GameChat`)
- Modal-based interactions for table creation, avatar selection, and tournaments
- Real-time game UI at `/game/active` with Socket.io integration (2025-10-22)

### Backend Architecture

**Server Framework**
- **Express.js** HTTP server for REST API endpoints
- **Socket.io** server for real-time game communication
- Separate `/server` directory contains game logic independent of Next.js

**Real-time Game Engine**
- **Socket.io** manages game rooms with event-driven architecture (Port 3001)
- `PokerGame` class encapsulates game state machine:
  - Phases: waiting → preflop → flop → turn → river → showdown
  - Player action validation and turn management
  - Pot calculation with side pot support
  - Dealer/blind rotation logic
  - **Automatic PostgreSQL persistence** on game end via `server/game-db.js`:
    - Saves game results to `games` table
    - Saves each player's hand to `hand_history` table
    - Updates `player_stats` with win/loss statistics
    - Updates `users` chips balance
- **Client-side real-time UI** at `/game/active` (2025-10-22):
  - `usePokerGame` hook for Socket.io connection and state management
  - `PokerTable` component with circular player positioning and card display
  - `ActionButtons` for fold, check, call, raise, all-in actions
  - `GameChat` for in-game messaging
  - Framer Motion animations for cards and player actions (500ms duration)

**Game Logic Libraries**
- `lib/poker-engine.ts` - Card deck management, hand evaluation (royal flush to high card)
- `lib/poker-side-pot.ts` - Side pot calculation for all-in scenarios
- `lib/rake-system.ts` - 5% rake calculation with configurable caps
- `lib/table-revenue.ts` - Per-table revenue tracking
- `server/poker-helpers.js` - Hand ranking algorithms and winner determination

**Authentication & Security**
- JWT-based authentication with `jsonwebtoken`
- Password hashing via `bcryptjs`
- Token storage in sessionStorage for API requests
- Session validation on protected routes

### Data Layer

**Database Strategy**
- **PostgreSQL** with Drizzle ORM for persistent data storage (fully migrated from MongoDB on 2025-10-22)
- Database connection via `server/db.ts` and `server/game-db.js` using environment variable `DATABASE_URL`
- Real-time game data automatically saved to PostgreSQL on game completion
- MongoDB/Mongoose completely removed (2025-10-22)
- Schema defined in `shared/schema.ts` with UUID-based primary keys
- Tables include:
  - `users` - Player accounts, chips (auto-updated on game end), levels, achievements, clubs, friends
  - `clubs` - Club metadata, members, roles, privacy settings
  - `games` - Game state, players, community cards, pot, blinds, winner (auto-saved on game end)
  - `player_stats` - Win rates, total games, chips won/lost, biggest pot (auto-updated on game end)
  - `pets` - Virtual pet system for gamification
  - `tournaments` - Tournament metadata, players, prize pools
  - `hand_history` - Individual hand results per player (userId, gameId, chipsChange, result, date, auto-saved for each player on game end)
- All game data relationships properly linked via userId and gameId foreign keys

**In-Memory State**
- Active games stored in `Map` structures on the Socket.io server
- Real-time game state not persisted until completion
- LocalStorage fallback for client-side data when API unavailable

**Storage Utilities**
- `lib/storage.ts` - LocalStorage helpers for tables, tournaments, forum posts
- Used as cache layer and offline fallback

**Statistics & Analytics**
- `/api/stats/user` - Retrieves player statistics with period filtering (day/week/month/all)
- Real-time chart data generation from hand_history table
- Cumulative earnings tracking for career page graphs
- `/api/stats/seed-test-data` - Development endpoint for populating test data

### Key Architectural Decisions

**1. Dual Money System**
- **Problem**: Need to support both practice play and real money gambling
- **Solution**: Two-tier currency system managed by `useCurrencyStore`:
  - `gameChips` - Free practice chips (default 10,000 for new users)
  - `realChips` - Purchased chips (1 chip = 1 yen conversion)
  - `useMoneyModeStore` controls which mode is active
- **Rationale**: Allows compliance with gambling regulations by default (play money), while supporting real money when admin enables it

**2. Club-Based Revenue Sharing**
- **Problem**: Need to track rake and distribute revenue to club owners
- **Solution**: `lib/club-system.ts` implements:
  - Per-club rake percentage (0-50%)
  - Revenue tracking at club, table, and hand levels
  - Separate statistics for daily/weekly/monthly periods
- **Rationale**: Mimics PPPOKER's club economy where club owners earn from games hosted

**3. Socket.io Game State Management**
- **Problem**: Real-time synchronization of poker game state across multiple clients
- **Solution**: Server-authoritative state in `server/index.js`:
  - All game logic executes on server
  - Clients send action requests, receive state updates
  - Game state stored in `Map<gameId, PokerGame>`
- **Rationale**: Prevents cheating, ensures consistency, enables spectator mode

**4. Compliance & AML Systems**
- **Problem**: Need to comply with anti-money laundering regulations
- **Solution**: `lib/compliance.ts` defines:
  - Restricted countries list (US, UK, CN, etc.)
  - High-risk country monitoring
  - KYC verification workflow
- **Rationale**: Legal requirement for real-money gambling operations

**5. Rake & Revenue Tracking**
- **Problem**: Need transparent, auditable revenue collection
- **Solution**: Multi-layered tracking:
  - `lib/rake-system.ts` - 5% rake with stake-based caps
  - `useRevenueStore` - Transaction log with timestamps
  - `lib/table-revenue.ts` - Per-table analytics
- **Rationale**: Supports financial reporting, fraud detection, and club owner payouts

## External Dependencies

### Core Infrastructure
- **PostgreSQL (Neon)** - Primary database (connection via `DATABASE_URL` environment variable)
- **Node.js 18+** - Runtime environment

### Cloud Services (Configured but Optional)
- **AWS S3** - Image storage via `@aws-sdk/client-s3` (logo/avatars currently use external CDN)
- **SendGrid** - Email service via `@sendgrid/mail` (for notifications) - **Note**: User declined Replit integration. Manual API key setup required via `SENDGRID_API_KEY` environment variable if needed.
- **Redis/IORedis** - Caching layer (configured but not currently required)
- **Replit Object Storage** - Available via blueprint:javascript_object_storage for file uploads and storage

### Payment & Real Money
- **Stripe Payment Integration** - Fully implemented for chip purchases (2025-10-22)
  - Stripe Checkout for credit card payments (1 chip = 1 yen)
  - API endpoints:
    - `/api/stripe/create-checkout-session` - Creates Stripe Checkout session
    - `/api/stripe/verify-session` - Verifies payment completion
    - `/api/stripe/create-payment-link` - Admin payment link generation
  - Payment flow pages:
    - `/app/payment/success` - Post-payment success handling with chip addition
    - `/app/payment/cancel` - Payment cancellation page
  - Shop page integration: `/app/shop/page.tsx` with purchase button handlers
  - Admin payment management: `/admin/payment` with payment link creation modal
- **Cryptocurrency Payment System** - Fully implemented in `lib/crypto-payment.ts`
  - Supports: BTC, ETH, USDT, USDC, LTC
  - Invoice generation, QR codes, webhook processing
  - Real-time status tracking with blockchain confirmations
  - API endpoints: `/api/payment/crypto/*`
  - Frontend UI: `/app/payment/crypto/page.tsx`
- Real money mode controlled by admin via `useMoneyModeStore`
- Chip purchase packages: 1,000 to 100,000 chips (1:1 yen conversion)

### Authentication
- JWT token-based (self-hosted, no third-party auth service)
- Planned: Firebase Auth integration (noted in TECH_STACK.md)

### UI & Styling
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations (card dealing, chip toss)
- **Lucide React** - Icon library
- **Recharts** - Data visualization for statistics

### Development Tools
- **ESLint** - Code linting with Next.js config
- **TypeScript** - Type checking
- **Autoprefixer/PostCSS** - CSS processing

### Deployment
- Railway.app configuration (`railway.json`) for cloud deployment
- Standalone Next.js build output for containerization
- Socket.io requires sticky sessions or Redis adapter for horizontal scaling