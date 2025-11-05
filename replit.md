# SIN JAPAN POKER

## Overview

SIN JAPAN POKER is a comprehensive online poker application, inspired by PPPOKER, offering real-time multiplayer gameplay. It features club management, tournaments, and social functionalities, supporting poker variants like Texas Hold'em, Omaha, and Open Face Chinese (OFC). The platform is built with Next.js 14 and Socket.io, designed for both play money and configurable real money modes, with extensive player statistics tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

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