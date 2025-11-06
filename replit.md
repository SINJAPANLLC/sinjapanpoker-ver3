# SIN JAPAN POKER

## Overview

SIN JAPAN POKER is a comprehensive online poker application, inspired by PPPOKER, offering real-time multiplayer gameplay. It features club management, tournaments, and social functionalities, supporting poker variants like Texas Hold'em, Omaha, and Open Face Chinese (OFC). The platform is built with Next.js 14 and Socket.io, designed for both play money and configurable real money modes, with extensive player statistics tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**November 7, 2025 - Game Menu APIs & Spectator/Away Features Complete**
- **Hand History API** (`/api/hand-history`): JWT-authenticated endpoint retrieves user's game history from `gameHistory` table with pagination (limit/offset)
- **User Stats API** (`/api/user/stats`): Comprehensive statistics endpoint with daily and cumulative stats (hands played, win rate, chips won/lost, biggest pot) from `playerStats` and `gameHistory` tables
- **Feedback API** (`/api/feedback`): User feedback submission system with category validation (bug/feature/improvement/other) stored in new `feedback` table
- **Feedback Table Added**: New database table `feedback` with fields for userId, username, category, message, status (pending/in-review/resolved/closed), response, and timestamps
- **Spectator Mode**: UI toggle for observation-only mode (existing `isSpectator` state) - players can watch without participating
- **Away Auto-Actions**: Server-side implementation for away players - automatically checks (if possible) or folds when it's their turn
  - `awayPlayers` Set tracks away status per game
  - `set-away-status` socket event updates player away status
  - Auto-action executes 1 second after turn start with system chat notification
- **All Game Menu Features Complete**: 14/14 menu items fully functional (UI + backend APIs):
  - ✅ Home Return, Table Info, Hand History, Player List, Statistics, Action Log, Settings, Rules, Share, Feedback, Language Settings, Account Settings, Spectator Mode, Away Status

**November 6, 2025 - Sound Effects, Chat Fix & Dramatic Card Bias Complete**
- **Fixed chat message duplication bug**: Properly cleaned up Socket.io event listeners using named functions and `socket.off()`
- **Implemented action sound effects**: Web Audio API generates short beep sound (800Hz, 0.1s) when players fold/call/raise
- **Implemented 5-second warning sound**: Dual-beep alert (1200Hz, 0.25s) plays when turn timer reaches 5 seconds remaining
- **Dramatic card bias system**: Subtle card distribution biases for more exciting gameplay
  - Practice mode: 30% chance of bias activation
  - Real money mode: 10% chance of bias activation (more conservative)
  - Four bias patterns (each 25% when activated):
    - Strong cards (A, K, Q, J, 10) distributed to create premium starting hands
    - Pairs more likely by positioning same-rank cards near each other
    - Balanced distribution of mid-high cards for closer competitions
    - Increased flush possibilities by grouping same-suit cards
- **Enhanced UX**: Audio feedback confirms user actions and prevents timeouts; subtle biases create more dramatic and engaging games

**November 6, 2025 - Admin Currency & Tournament Management Complete**
- **Currency Granting API** (`/api/admin/grant-currency`): Comprehensive chip and energy management
  - Supports realChips, gameChips, and energy adjustments (addition/subtraction)
  - Admin authentication with `requireAdmin()` middleware
  - Input validation: numerical checks, mandatory reason field, negative balance prevention
  - Returns updated user balance after successful operation
- **Tournament Management API** (`/api/admin/tournaments`): Full CRUD operations for tournaments
  - GET: Retrieves tournament list with statistics (total, registering, in-progress, completed, cancelled)
  - POST: Creates new tournaments with validation (buy-in ≥10, max players 2-1000)
  - PATCH: Updates tournament status (start, cancel, complete) with state transition validation
  - DELETE: Removes tournaments (prevents deletion of in-progress tournaments)
  - All endpoints require admin authentication
- **Tournament Management UI** (`/admin/tournaments`): Complete admin interface
  - Search and filter functionality (by status: all, registering, in-progress, completed, cancelled)
  - Statistics summary dashboard (total tournaments, total players, total prize pool, in-progress count)
  - Tournament list with action buttons (start, complete, cancel, delete)
  - Responsive design with real-time updates via token-protected API calls
- **Tournament API Security Enhancement** (`/api/tournament/[id]`):
  - Register action: `verifyAuth()` authentication, prevents registering other users
  - Start/complete/cancel actions: `requireAdmin()` restricts to admins only
  - Prize distribution and refund logic implemented
  - Chip deduction from realChips for tournament buy-ins with 10% fee

**November 5, 2025 - Admin Dashboard Real Data Integration Complete**
- **Removed all mock data** from admin dashboard pages and integrated real database APIs
- **Payment Transactions System**: Created `payment_transactions` table to track Stripe deposits
  - Modified `verify-session.ts` to save payment records and update user `realChips` automatically
  - Added idempotency check to prevent duplicate transaction processing
  - Integrated deposit + withdrawal data in admin payment dashboard
- **Admin Payment API** (`/api/admin/payments`): Returns unified deposit/withdrawal statistics
  - Total deposits, total withdrawals, net profit, pending amounts
  - Complete transaction history for both deposits and withdrawals
- **Admin Tables API** (`/api/admin/tables`): Full CRUD operations for table management
  - GET: Fetch all tables with statistics
  - DELETE: Remove tables
  - PATCH: Pause/resume tables
- **System Settings API** (`/api/admin/settings`): Database-persisted configuration
  - Created `system_settings` table with auto-initialization
  - GET/PATCH endpoints for real-time settings management
- **Admin Dashboard Pages Updated**:
  - Payment page: Shows real deposit/withdrawal data with accurate statistics
  - Tables page: Integrated with database for live table management
  - Settings page: Real-time database updates for system configuration
  - Users page: Displays correct `realChips` and `gameChips` from API
  - Revenue page: Removed sample transaction generation code

**November 5, 2025 - Profile Features & KYC System Complete**
- Implemented complete user profile API with JWT authentication (`/api/user/[id]`)
- Added KYC verification system with document upload endpoints (`/api/kyc/submit`, `/api/kyc/status`)
- Created achievements/titles system with database integration (`/api/achievements/user`)
- Updated `kycVerifications` table in schema for identity verification tracking
- Enhanced PokerTable component to display player avatars (supports data URIs, URLs, local paths)
- Secured all profile-related APIs with JWT authentication and authorization checks
- Profile data now differentiates public vs private fields based on viewer identity
- All existing pages confirmed functional: Hand History, Transactions, Settings

**November 5, 2025 - Club & Table Persistence**
- Migrated club system from in-memory Map storage to PostgreSQL database
- Updated `clubs` table with comprehensive revenue tracking, member management, and configuration fields
- Created `club_tables` table for poker table management  
- All club API endpoints now use direct database queries via Drizzle ORM
- Clubs and tables now persist across server restarts

## System Architecture

### Frontend Architecture
- **Frameworks**: Next.js 14 (App Router), React 18, TypeScript.
- **Styling**: Tailwind CSS 3.x with a custom poker-themed design system.
- **State Management**: Zustand with persist middleware for global state, including specialized stores for authentication, game state, currency, tournaments, revenue, and admin.
- **UI/UX**: Protected routes, custom loading states, reusable poker components (e.g., `PokerTable`), modal-based interactions, and real-time game UI with Framer Motion animations.

### Backend Architecture
- **Server**: Express.js for REST APIs and Socket.io for real-time game communication.
- **Real-time Game Engine**: Socket.io manages game rooms with a server-authoritative `PokerGame` class handling game state, player actions, pot calculation, and dealer/blind rotation.
- **Game Logic**: Libraries for card deck management, hand evaluation, side pot calculation, and a 5% rake system with configurable caps.
- **Authentication & Security**: JWT authentication with bcryptjs for password hashing, robust admin authentication, comprehensive Zod-based input validation, XSS/CSRF protection, rate limiting (express-rate-limit), and security headers. SQL injection prevention is handled by Drizzle ORM.
- **Chip System**: Supports both practice and regular money modes, with chip balances updated in real-time and an admin system for chip distribution.
- **Avatar System**: User avatars are persisted in the database and cached locally.

### Data Layer
- **Database**: PostgreSQL with Drizzle ORM for all persistent data storage, including user accounts, clubs, games, player statistics, hand history, and forum posts.
- **Database Connection**: Uses Neon Serverless driver for server-side code and standard `pg` driver for Next.js API routes.
- **In-Memory State**: Active game states are stored in `Map` structures on the Socket.io server and persisted to PostgreSQL upon game completion.

### Key Architectural Decisions
- **Dual Money System**: Supports both practice play and real money gambling with admin-controlled chip distribution, ensuring compliance and preventing abuse.
- **Club-Based Revenue Sharing**: Implements rake tracking and revenue distribution to club owners, mirroring real-world poker club economies.
- **Socket.io Game State Management**: Ensures real-time, server-authoritative synchronization of game state across clients for fairness and consistency.
- **Compliance & AML Systems**: Includes features for restricted countries, high-risk country monitoring, and KYC verification for regulatory compliance.
- **Rake & Revenue Tracking**: Provides transparent and auditable revenue collection for financial reporting and club owner payouts.

## External Dependencies

### Core Infrastructure
- **PostgreSQL (Neon)**: Primary database.
- **Node.js 18+**: Runtime environment.

### Cloud Services (Optional/Configured)
- **AWS S3**: For image storage (currently uses external CDN).
- **SendGrid**: Email service (requires manual API key setup).
- **Redis/IORedis**: Caching layer (configured but not actively used).
- **Replit Object Storage**: For file uploads and storage.

### Payment & Real Money
- **Stripe Payment Integration**: Fully implemented for chip purchases (1 chip = 1 yen) via Stripe Checkout, including API endpoints for session creation and verification.
- **Cryptocurrency Payment System**: Supports BTC, ETH, USDT, USDC, LTC with invoice generation, QR codes, and webhook processing.

### UI & Styling
- **Tailwind CSS**: Utility-first styling.
- **Framer Motion**: Animations.
- **Lucide React**: Icon library.
- **Recharts**: Data visualization.

### Development Tools
- **ESLint**: Code linting.
- **TypeScript**: Type checking.
- **Autoprefixer/PostCSS**: CSS processing.

### Deployment
- **Railway.app**: Configuration for cloud deployment.
- **Standalone Next.js build output**: For containerization.