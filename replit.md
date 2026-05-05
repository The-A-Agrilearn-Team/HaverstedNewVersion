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
Metro Bundler — React Deduplication
The pnpm workspace contains two Expo stacks: expo@54 + react@19.1.0 + react-native@0.81.5 (agri-learn) and expo@55 + react@19.2.0 + react-native@0.83.4 (root/mockup-sandbox). Metro was bundling both copies of react and @react-navigation/native, causing "Invalid hook call" (null dispatcher) and "Couldn't find LinkingContext" crashes at runtime.

Fix (metro.config.js): resolver.resolveRequest forces all imports of react, react/jsx-runtime, react/jsx-dev-runtime, @react-navigation/native, and @react-navigation/core to resolve to the single agri-learn (react@19.1.0) copies in .pnpm/.

Profile Sub-screens Routing
All profile sub-screens (edit, saved-modules, my-progress, my-listings, messages, offline-content) are registered explicitly in app/_layout.tsx as Stack.Screen entries. No app/profile/_layout.tsx should exist — adding a nested layout caused "Screen names must be unique" with expo-router@6.

Bookmark / Saved Modules
hooks/useProgress.ts exports: useBookmarks (IDs only), useToggleBookmark (upserts/deletes from bookmarks table, invalidates bookmarks, savedModules, profileStats), useSavedModules (joins bookmarks → learning_modules), useProfileStats.
app/module/[id].tsx: bookmark icon calls handleBookmark → useToggleBookmark.mutate({ moduleId, isBookmarked }).
app/profile/saved-modules.tsx: reads useSavedModules(), displays module cards with remove-bookmark action.
AI Features (Replit OpenAI Integration)
Both AI features use Replit AI Integrations (OpenAI-compatible, no API key needed on Replit — billed to Replit credits). On local Windows/Mac, set AI_INTEGRATIONS_OPENAI_API_KEY and AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1 in artifacts/api-server/.env.

1. AI Service Search (Service Window)
Endpoint: POST /api/ai-search — replaced DuckDuckGo/keyword logic with real GPT (gpt-5-mini)
Flow: GPT reads all available services + farmer's query → returns JSON { summary, match_ids, external } with natural language summary and matched service IDs. Falls back to keyword search if server unreachable.
Metro proxy: metro.config.js forwards /api/* from port 5000 → port 3000 (Replit only, guarded by IS_REPLIT check)
Client: lib/aiSearch.ts → aiSearchServices() + askModuleAssistant()
UI: windows.tsx — AI bar with chat bubble icon, external suggestion cards
2. AI Learning Assistant (Module Pages)
Endpoint: POST /api/module-assist — GPT answers questions grounded in the module's own content
Flow: System prompt includes full module content; farmer asks a question; GPT replies in plain language (3–6 sentences)
UI: module/[id].tsx — chat bubble icon in nav bar toggles an inline chat panel. Shows suggestion chips on first open. Chat history persists for session. A "Have a question?" banner appears at bottom of content when panel is closed.
Environment Variables
EXPO_PUBLIC_SUPABASE_URL: Supabase project URL (set in Replit secrets)
EXPO_PUBLIC_SUPABASE_ANON_KEY: Supabase anon/public key (set in Replit secrets)
DATABASE_URL: Replit PostgreSQL connection string (auto-provisioned)
PORT: API server port (default 3000)
AI_INTEGRATIONS_OPENAI_API_KEY: Auto-injected on Replit. For local dev: your OpenAI API key.
AI_INTEGRATIONS_OPENAI_BASE_URL: Auto-injected on Replit. For local dev: https://api.openai.com/v1
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