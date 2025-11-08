# SIN JAPAN POKER

## Overview

SIN JAPAN POKER is a real-time multiplayer online poker application, similar to PPPOKER. It supports poker variants like Texas Hold'em, Omaha, and Open Face Chinese (OFC), featuring club management, tournaments, and social functionalities. Built with Next.js 14 and Socket.io, it offers both play money and configurable real money modes, alongside extensive player statistics tracking. The project aims to provide a comprehensive and engaging poker platform with a focus on fair play and robust club-based economies.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**November 8, 2025 - Practice Mode Chip Bug Fix**
- **CRITICAL BUG FIX**: Fixed practice mode incorrectly using realChips instead of gameChips
- **Problem**: Practice tables (tableId='practice-game') were deducting/adding realChips, causing unexpected balance changes
- **Solution**: Added practice mode detection in `/api/game/join` and `/api/game/rebuy` using `tableId.startsWith('practice-game')`
- **API Updates**:
  - Join/Rebuy endpoints now branch logic based on practice mode vs real money mode
  - Practice mode operates on `gameChips` (practice currency)
  - Real money mode operates on `realChips` (actual currency)
  - Responses include `isPracticeMode` flag and correct `newBalance`
- **Client Updates**: Updated buy-in/rebuy handlers to update correct wallet (gameChips vs realChips) based on API response
- **Architect Review**: Passed security audit - confirmed practice/real mode separation works correctly without regressions

**November 8, 2025 - Cash Game Buy-In Range Feature Complete**
- **Database Schema Updates**: Added `minBuyIn` and `maxBuyIn` columns to `clubTables` table for configurable buy-in ranges
- **Table Creation UI Redesign**: Updated from fixed buy-in to min/max range input in `TableCreationModal.tsx`
- **Buy-In Modal Component** (`BuyInModal.tsx`): Interactive UI for selecting initial buy-in amount within table limits when joining a game
- **Rebuy Modal Component** (`RebuyModal.tsx`): In-game chip top-up interface with range validation for mid-game chip additions
- **Join Game API** (`/api/game/join`): Server-side endpoint that deducts chips, validates buy-in range, and authorizes table entry
- **Rebuy API** (`/api/game/rebuy`): Secure chip addition endpoint using server-authoritative game state from `global.pokerGames` to prevent client-side manipulation
- **Socket.io Handler Fixes**:
  - Fixed `add-chips` handler to find players by `userId` instead of `socket.id`
  - Added server-side buy-in range validation in Socket.io handlers
  - Implemented error events (`rebuy-error`) for failed chip additions
- **Security Hardening**: Eliminated client-supplied chip count trust; server now derives current stack from in-memory game state to prevent max buy-in bypass
- **Global State Exposure**: Socket.io `games` and `players` maps exposed via `global.pokerGames` and `global.pokerPlayers` for cross-layer validation
- **Architect Review**: Passed final security audit - confirmed no client data tampering vectors remain

## System Architecture

### Frontend Architecture
- **Frameworks**: Next.js 14 (App Router), React 18, TypeScript.
- **Styling**: Tailwind CSS 3.x with a custom poker-themed design system.
- **State Management**: Zustand with persist middleware for global and specialized states (authentication, game, currency, tournaments, revenue, admin).
- **UI/UX**: Protected routes, custom loading states, reusable poker components, modal interactions, and real-time game UI with Framer Motion animations. Background themes dynamically adjust based on table type (Standard, VIP, Premium).

### Backend Architecture
- **Server**: Express.js for REST APIs and Socket.io for real-time game communication.
- **Real-time Game Engine**: Socket.io manages game rooms using a server-authoritative `PokerGame` class for state management, player actions, pot calculation, and dealer/blind rotation. Includes libraries for card deck management, hand evaluation, side pot calculation, and a 5% rake system.
- **Authentication & Security**: JWT authentication with bcryptjs, robust admin authentication, Zod-based input validation, XSS/CSRF protection, rate limiting, and security headers. Drizzle ORM handles SQL injection prevention.
- **Chip System**: Supports both practice and real money modes with real-time balance updates and admin chip distribution. Features secure buy-in and rebuy mechanisms with server-side validation to prevent client-side manipulation.
- **Avatar System**: User avatars are persisted in the database.
- **Game Features**: Includes hand history, user statistics, feedback submission, spectator mode, and server-side auto-actions for away players.
- **Admin Features**: Comprehensive admin interfaces for currency granting, tournament management (CRUD), and system settings.

### Data Layer
- **Database**: PostgreSQL with Drizzle ORM for all persistent data, including user accounts, clubs, games, player statistics, hand history, forum posts, payment transactions, KYC verifications, and system settings.
- **Database Connection**: Uses Neon Serverless driver for server-side and standard `pg` driver for Next.js API routes.
- **In-Memory State**: Active game states are stored in `Map` structures on the Socket.io server and persisted to PostgreSQL upon game completion.

### Key Architectural Decisions
- **Dual Money System**: Supports both practice play and real money with admin-controlled chip distribution.
- **Club-Based Revenue Sharing**: Tracks rake and distributes revenue to club owners.
- **Socket.io Game State Management**: Ensures real-time, server-authoritative synchronization for fairness.
- **Compliance & AML Systems**: Features for restricted countries, high-risk country monitoring, and KYC verification.
- **Rake & Revenue Tracking**: Provides transparent and auditable revenue collection.
- **Fair Gameplay**: Uses a pure Fisher-Yates shuffle algorithm for completely random card distribution, ensuring fairness for production deployment.

## External Dependencies

### Core Infrastructure
- **PostgreSQL (Neon)**: Primary database.
- **Node.js 18+**: Runtime environment.

### Cloud Services
- **AWS S3**: For image storage (optional, currently uses external CDN).
- **SendGrid**: Email service.
- **Redis/IORedis**: Caching layer (configured).
- **Replit Object Storage**: For file uploads and storage.

### Payment & Real Money
- **Stripe Payment Integration**: For chip purchases via Stripe Checkout (1 chip = 1 yen).
- **Cryptocurrency Payment System**: Supports BTC, ETH, USDT, USDC, LTC with invoice generation and webhook processing.

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