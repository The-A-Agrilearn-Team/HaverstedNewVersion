<<<<<<< HEAD
# AgriLearn — Agricultural Learning Platform

A React Native mobile app for South African farmers, buyers, and retailers. Features agricultural learning modules, a produce marketplace, and multilingual support.

## Tech Stack

- **Mobile App**: React Native + Expo (managed workflow)
- **Backend**: Node.js + Express
- **Database/Auth**: Supabase (PostgreSQL, JWT auth, Row-Level Security)
- **Navigation**: Expo Router (file-based)
- **State**: React Context + TanStack React Query
- **Language**: TypeScript throughout

---

## Prerequisites

Install these on your Windows machine before getting started:

1. **Node.js** (LTS) — https://nodejs.org
2. **pnpm** — open PowerShell and run:
   ```
   npm install -g pnpm
   ```
3. **Expo CLI** — run:
   ```
   npm install -g expo-cli
   ```
4. **Expo Go** app on your phone (iOS or Android) — to preview the app on a real device

---

## Getting Started

### 1. Clone and install dependencies

```powershell
git clone <your-repo-url>
cd agrilearn
pnpm install
```

### 2. Set up environment variables

Inside the `artifacts/agri-learn/` folder, copy the example env file:

```powershell
copy artifacts\agri-learn\.env.example artifacts\agri-learn\.env
```

Then open `artifacts/agri-learn/.env` and fill in your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://quxdfknwgymgghemkmcd.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Get your anon key from: **Supabase Dashboard → Project Settings → API → anon public key**

### 3. Run the mobile app

```powershell
pnpm --filter @workspace/agri-learn run dev
```

This starts the Metro bundler. You will see a QR code in the terminal — scan it with the **Expo Go** app on your phone to open the app.

**Or** press `a` to open in an Android emulator, `i` for iOS simulator (macOS only), or `w` for the web browser.

---

## Running the API Server (optional)

The backend API server is optional — the app can run using Supabase directly.

### 1. Set up environment variables

```powershell
copy artifacts\api-server\.env.example artifacts\api-server\.env
```

Edit `artifacts/api-server/.env`:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/agrilearn
```

### 2. Start the server

```powershell
pnpm --filter @workspace/api-server run dev
```

The server will start on http://localhost:3000

---

## Running the Mockup Sandbox (optional)

The mockup sandbox is a Vite-based UI component explorer used during development.

```powershell
pnpm --filter @workspace/mockup-sandbox run dev
```

Opens at http://localhost:5173

---

## Project Structure

```
agrilearn/
├── artifacts/
│   ├── agri-learn/          # React Native / Expo mobile app
│   │   ├── app/             # Expo Router screens (tabs, auth, modals)
│   │   ├── components/      # Shared UI components
│   │   ├── context/         # Auth context provider
│   │   ├── hooks/           # Data fetching hooks
│   │   ├── lib/             # Supabase client
│   │   ├── constants/       # Colors and design tokens
│   │   └── supabase/        # DB schema and seed data
│   ├── api-server/          # Express REST API (optional)
│   └── mockup-sandbox/      # Vite component playground (dev only)
└── lib/
    ├── db/                  # Drizzle ORM schema and migrations
    ├── api-spec/            # OpenAPI spec (openapi.yaml)
    ├── api-zod/             # Zod schemas generated from API spec
    └── api-client-react/    # Generated React API client
```

## Admin Setup (One-Time)

The app has a dedicated **"Login as Administrator"** button on the login screen that uses fixed system credentials. You must create this account in Supabase once before it will work.

### Step 1 — Create the admin account in Supabase

Go to your **Supabase Dashboard → Authentication → Users → Add user → Create new user** and enter:

| Field    | Value                    |
|----------|--------------------------|
| Email    | `admin@agrilearn.co.za`  |
| Password | `AgriAdmin2025!`         |

Tick **"Auto Confirm User"** so the account is immediately active.

### Step 2 — Set the role to admin

In **Supabase → SQL Editor**, run:

```sql
UPDATE profiles
SET role = 'admin', full_name = 'System Administrator'
WHERE email = 'admin@agrilearn.co.za';
```

If no row is updated (profile wasn't created automatically), insert it manually:

```sql
INSERT INTO profiles (id, email, full_name, role, language_preference)
SELECT id, email, 'System Administrator', 'admin', 'en'
FROM auth.users
WHERE email = 'admin@agrilearn.co.za';
```

### Step 3 — Use it in the app

1. Open the app → tap **Sign In**
2. Scroll down to the red **"Staff / Admin Access"** section
3. Tap **"Login as Administrator"** — no typing required
4. You will land on the home screen; go to **Profile → Administration → Admin Dashboard**

### Admin Credentials (for reference)

```
Email:    admin@agrilearn.co.za
Password: AgriAdmin2025!
```

These are defined in `artifacts/agri-learn/constants/adminConfig.ts` and can be changed there at any time.

---

## User Roles

| Role      | Permissions                                              |
|-----------|----------------------------------------------------------|
| farmer    | List/manage produce, access all learning modules         |
| buyer     | Browse and purchase produce, access learning modules     |
| retailer  | Bulk purchasing, access learning modules                 |
| admin     | Full access + content management + audit logs            |

## Design System

- **Primary**: `#2D6A4F` (forest green)
- **Primary Light**: `#52B788`
- **Accent**: `#F2994A` (warm orange)
- **Font**: Inter (400 / 500 / 600 / 700)

## South African Context

- Currency: South African Rand (R)
- Locations: Durban KZN, Johannesburg GP, Pretoria GP, Free State, Limpopo, Western Cape
- Languages: English, isiZulu, Sesotho, Afrikaans, isiXhosa
- Compliance: POPIA (Protection of Personal Information Act)
=======
# HaverstedNewVersion
>>>>>>> e98841a6dfefdfc770c33967766f4a2984dee7ca
