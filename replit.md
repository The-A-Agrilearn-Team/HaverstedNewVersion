AgriLearn — Agricultural Learning Platform
Project Overview
A comprehensive React Native/Expo mobile application for South African farmers, buyers, retailers, and admins. The app provides agricultural learning modules, a produce marketplace, and multilingual support.

Architecture
Frontend: React Native + Expo (managed workflow), served as web via Metro on port 5000
API Server: Express.js backend running on port 3000
Auth/Primary DB: Supabase (PostgreSQL, JWT auth, PostgREST API, Row-Level Security)
Replit DB: PostgreSQL provisioned for the Replit environment (schema mirrors Supabase schema)
Navigation: Expo Router (file-based, tabs + modal stack)
State: React Context (auth) + TanStack React Query (server state)
Language: TypeScript throughout
Monorepo: pnpm workspaces
Project Structure
artifacts/
├── agri-learn/           # Expo React Native mobile app (web via Metro)
│   ├── app/              # File-based routes (Expo Router)
│   ├── lib/supabase.ts   # Supabase client
│   ├── context/          # AuthContext (Supabase auth)
│   └── server/serve.js   # Static production server
├── api-server/           # Express.js API backend
│   └── src/
│       ├── app.ts        # Express setup
│       ├── routes/       # API routes (/api/healthz, etc.)
│       └── index.ts      # Server entry
└── mockup-sandbox/       # Vite UI component explorer
lib/
├── db/                   # Drizzle ORM + PostgreSQL schema
├── api-spec/             # OpenAPI specification
├── api-zod/              # Zod schemas (generated)
└── api-client-react/     # React Query hooks (generated)

Workflows
Start application: pnpm --filter @workspace/agri-learn run dev — Expo web on port 5000
API Server: pnpm --filter @workspace/api-server run dev — Express on port 3000
Environment Variables
EXPO_PUBLIC_SUPABASE_URL: Supabase project URL (set in Replit secrets)
EXPO_PUBLIC_SUPABASE_ANON_KEY: Supabase anon/public key (set in Replit secrets)
DATABASE_URL: Replit PostgreSQL connection string (auto-provisioned)
PORT: API server port (default 3000)
User Roles
farmer: List/manage produce, access all learning modules
buyer: Browse and purchase produce, access learning modules
retailer: Bulk purchasing, access learning modules
admin: Full access + content management + audit logs
Design System
Primary: #2D6A4F (forest green)
Primary Light: #52B788
Accent: #F2994A (warm orange)
Font: Inter (400/500/600/700)
South African Context
Currency: South African Rand (R)
Locations: Durban KZN, Johannesburg GP, Pretoria GP, Free State, Limpopo, Western Cape
Languages targeted: English, isiZulu, Sesotho, Afrikaans, isiXhosa
POPIA compliance built into security model