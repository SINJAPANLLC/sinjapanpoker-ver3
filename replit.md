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
- Reusable poker-specific components (`Card`, `PokerTable`, `GameActions`)
- Modal-based interactions for table creation, avatar selection, and tournaments

### Backend Architecture

**Server Framework**
- **Express.js** HTTP server for REST API endpoints
- **Socket.io** server for real-time game communication
- Separate `/server` directory contains game logic independent of Next.js

**Real-time Game Engine**
- **Socket.io** manages game rooms with event-driven architecture
- `PokerGame` class encapsulates game state machine:
  - Phases: waiting → preflop → flop → turn → river → showdown
  - Player action validation and turn management
  - Pot calculation with side pot support
  - Dealer/blind rotation logic

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
- **MongoDB** via Mongoose ODM for persistent data storage
- Connection pooling with global caching pattern (`lib/mongodb.ts`)
- Models defined for:
  - `User` - Player accounts, chips, levels, achievements
  - `Club` - Club metadata, members, roles
  - `Game` - Game history, hands, results
  - `PlayerStats` - Win rates, VPIP, PFR, aggression metrics
  - `Pet` - Virtual pet system for gamification

**In-Memory State**
- Active games stored in `Map` structures on the Socket.io server
- Real-time game state not persisted until completion
- LocalStorage fallback for client-side data when API unavailable

**Storage Utilities**
- `lib/storage.ts` - LocalStorage helpers for tables, tournaments, forum posts
- Used as cache layer and offline fallback

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
- **MongoDB** - Primary database (connection via `MONGODB_URI` environment variable) - Connection code implemented in `lib/mongodb.ts`
- **Node.js 18+** - Runtime environment

### Cloud Services (Configured but Optional)
- **AWS S3** - Image storage via `@aws-sdk/client-s3` (logo/avatars currently use external CDN)
- **SendGrid** - Email service via `@sendgrid/mail` (for notifications) - **Note**: User declined Replit integration. Manual API key setup required via `SENDGRID_API_KEY` environment variable if needed.
- **Redis/IORedis** - Caching layer (configured but not currently required)
- **Replit Object Storage** - Available via blueprint:javascript_object_storage for file uploads and storage

### Payment & Real Money
- **Cryptocurrency Payment System** - Fully implemented in `lib/crypto-payment.ts`
  - Supports: BTC, ETH, USDT, USDC, LTC
  - Invoice generation, QR codes, webhook processing
  - Real-time status tracking with blockchain confirmations
  - API endpoints: `/api/payment/crypto/*`
  - Frontend UI: `/app/payment/crypto/page.tsx`
- Real money mode controlled by admin via `useMoneyModeStore`
- Credit card payments (Stripe) planned but not implemented

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