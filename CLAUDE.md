# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PAIT (Personal Assistant & Information Terminal)** is a secure, family-friendly messaging platform built with Next.js 16. It enables safe communication between family members through multiple channels (SMS and Email) with role-based access control and a terminal/retro aesthetic.

## Development Commands

```bash
# Start development server with Turbopack (faster hot reload)
yarn dev

# Production build (requires 4GB max-old-space-size)
yarn build

# Run production build
yarn start

# Run ESLint
yarn lint
```

**Note:** The project uses Yarn as the package manager (v1.22.22). Always use `yarn` commands, not `npm`.

## Architecture Overview

### App Router Structure

This project uses Next.js App Router (not Pages Router). Key directories:

- **`app/`** - Pages and API routes
  - **`app/api/`** - API route handlers (all use `route.ts`)
  - **`app/(pages)/`** - Page components (`page.tsx`)
  - **`app/layout.tsx`** - Root layout with theme system
- **`components/`** - React components
  - **`components/ui/`** - shadcn/ui base components
- **`lib/`** - Core business logic and utilities
- **`types/`** - TypeScript type definitions

### Database Adapter Pattern

The application uses an adapter pattern for database abstraction, allowing easy switching between PostgreSQL and Firebase:

```typescript
// lib/db.ts exports a unified interface
import { saveMessage, getMessages } from "@/lib/db";

// Switch implementation via DATABASE_TYPE env var:
// - "postgres" → lib/db-postgres.ts
// - "firebase" → lib/db-firebase.ts
```

**Key functions:**
- `saveMessage()` - Store incoming/outgoing messages
- `getMessages()` - Fetch recent messages (last 50)
- `getMessagesByContact()` - Filter by contact

### Authentication System

**Type:** Cookie-based password authentication (not OAuth)

**User Hierarchy:**
- **ADMIN** (Dad, Mom) - Full access including contact management
- **USER** (Paitin) - Limited to messaging with approved contacts
- **GUEST** - No access to protected routes

**Implementation:**
- User registry: `lib/user-management.ts`
- Auth utilities: `lib/auth.ts`
- Middleware: `middleware.ts` (protects `/messaging`, `/contacts`)
- Login endpoint: `POST /api/auth`

**Cookies:**
- `pait_auth` - Password (4-hour lifespan)
- `pait_user` - User info JSON
- Both are HTTP-only, secure in production, SameSite=Lax

### External Services Integration

#### Twilio (SMS)
- **File:** `lib/twilio.ts`
- **Function:** `sendSMS(to: string, body: string)`
- **Format:** Messages are prefixed with sender name: `[SenderName] message`
- **Webhook:** `POST /api/webhook` (application/x-www-form-urlencoded)

#### SendGrid (Email)
- **File:** `lib/email.ts`
- **Function:** `sendEmail(options: EmailOptions)`
- **Template:** HTML email with terminal aesthetic (green on black)
- **Reply-to:** Set to `pai@pait.in` for seamless replies
- **Webhook:** `POST /api/webhook` (multipart/form-data)

#### Multi-Channel Messaging
- **File:** `lib/messaging.ts`
- **Function:** `sendMessageToContact()` - Sends via all available methods (SMS + Email in parallel)
- **Function:** `sendMessageWithFallback()` - Tries SMS first, falls back to email on failure
- Contacts specify available methods in their `methods` array: `["sms", "email"]`

### Contact Management

**Current State:** Contacts are hardcoded in `lib/contacts.ts` (not database-persisted)

**Functions:**
- `getContactByPhone(phone)` - Lookup by phone number
- `getContactByEmail(email)` - Lookup by email address
- `getContactByName(name)` - Lookup by display name
- Each contact has `approved` flag - only approved contacts can receive messages

**TODO:** Add database persistence for contacts (currently in-memory only)

### Theme System

**File:** `lib/themes.ts`

Six predefined themes with terminal/retro aesthetic:
- Matrix Green (default)
- Amber Terminal
- Cyan Blue
- Neon Purple
- Red Alert
- Paper White

**Usage:**
- User-selectable via `ThemeSelector` component in header
- Persisted via `POST /api/user-preferences`
- Applied via CSS custom properties (scoped to body)

## Key API Endpoints

### Authentication
```
POST /api/auth          - Login with password
GET  /api/auth          - Check authentication status
```

### Messaging
```
GET  /api/messages           - Fetch conversation history (last 50)
POST /api/send-message       - Send SMS/Email to approved contact
POST /api/webhook            - Unified webhook for incoming SMS/Email
```

### Contacts
```
GET    /api/contacts         - List approved contacts
POST   /api/contacts         - Add contact (ADMIN only)
PUT    /api/contacts         - Update contact (ADMIN only)
DELETE /api/contacts?id=X    - Delete contact (ADMIN only)
```

### User Preferences
```
GET  /api/user-preferences   - Get saved theme
POST /api/user-preferences   - Save theme preference
```

## Component Patterns

### Server vs Client Components
- **Root layout:** Server component with client providers
- **Pages:** Mostly client components ("use client") for interactivity
- **Theme system:** Client-side context (`ThemeProvider`)
- **Animations:** Framer Motion requires client components

### Suspense Boundaries
Used for async operations and Searchparams access to prevent hydration mismatches:
```tsx
<Suspense fallback={<div>Loading...</div>}>
  <ComponentUsingSearchParams />
</Suspense>
```

### Custom Hooks
- **`useUserRole()`** - Determines if user is admin/user (handles SSR/CSR differences)
- **`useOptIn()`** - Checks SMS opt-in status from localStorage

## Environment Variables

Required for full functionality:

```bash
# Database
DATABASE_TYPE=postgres              # or "firebase"
DATABASE_URL=postgresql://...       # PostgreSQL connection string

# Firebase (if using Firebase adapter)
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_MEASUREMENT_ID=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# SendGrid
SENDGRID_API_KEY=

# User Passwords
ADMIN_PASSWORD=          # Dad's password
MOM_PASSWORD=            # Mom's password
APP_PASSWORD=            # Paitin's password
```

## Database Schema (PostgreSQL)

```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  direction VARCHAR(10) CHECK (direction IN ('incoming', 'outgoing')),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  from_number VARCHAR(20),
  to_number VARCHAR(20),
  contact_name VARCHAR(100)
);
```

**Note:** Firebase uses a `messages` collection with equivalent fields (auto-created on first write)

## Message Flow

### Outgoing Messages
1. User types message in `/messaging` page
2. Form submits to `POST /api/send-message`
3. Validates contact is in approved list
4. Calls `sendMessageToContact()` which sends via all available methods (SMS + Email in parallel)
5. For each successful send, calls `saveMessage()` to persist
6. Response returns to UI with success status
7. UI polls `GET /api/messages` every 5 seconds to update message list

### Incoming Messages
1. SMS/Email arrives at webhook endpoint
2. `POST /api/webhook` detects content type:
   - `multipart/form-data` → Email handler
   - `application/x-www-form-urlencoded` → SMS handler
3. Extracts content and performs contact lookup
4. Saves message to database via adapter
5. UI polling picks up new message on next interval

## Security Considerations

- **Cookies:** HTTP-only, secure in production, SameSite=Lax
- **Session timeout:** 4 hours
- **Webhook validation:** Twilio signature verification (production)
- **Contact approval:** Messages only sent to approved contacts
- **Role-based access:** Admin endpoints check user role
- **Input validation:** All API endpoints validate inputs

## Path Aliases

TypeScript is configured with path aliases:
```typescript
import { sendMessage } from "@/lib/messaging";
import { Button } from "@/components/ui/button";
```

The `@/` prefix maps to the project root.

## Important Implementation Notes

1. **Always use the database adapter pattern** - Never directly import `db-postgres.ts` or `db-firebase.ts`. Import from `lib/db.ts` instead.

2. **Contact validation** - Before sending messages, always verify the contact exists and is approved via `getContactByName()`.

3. **Message formatting** - Outgoing messages are automatically prefixed with sender name: `[SenderName] message content`.

4. **Middleware protection** - Routes `/messaging` and `/contacts` are protected. Add new protected routes to `middleware.ts` matcher config.

5. **Theme persistence** - Themes are saved per-user via API endpoint, not localStorage (except for unauthenticated users).

6. **Email content cleaning** - Incoming emails have quoted replies removed via regex in webhook handler.

7. **Error handling** - Multi-channel sends continue on partial failures. Always check `methodsSuccessful` array in response.

## Future Enhancements

- Database-persisted contacts (currently hardcoded)
- Message search and filtering
- Message pagination (currently returns last 50 only)
- `/admin` dashboard implementation
- `/settings` page implementation
- Read receipts
- Message encryption
