AgriLearn — Agricultural Learning Platform for South African Farmers
Run & Operate
Frontend (agri-learn): pnpm --filter @workspace/agri-learn run dev — Expo web via Metro on port 5000 (via dev-wrapper proxy)
Backend (api-server): node --enable-source-maps /home/runner/workspace/artifacts/api-server/dist/index.mjs — Express.js on port 3001
Build API: pnpm --filter @workspace/api-server run build (must run before starting backend if src changes)
Required env vars: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY (in userenv.shared), OPENAI_API_KEY (secret)
Stack
Frontend: Expo ~54 + React Native 0.81.5 + Expo Router 6 (file-based routing), served as web via Metro
Backend: Express.js v5, built with esbuild (build.mjs), output to dist/
Auth/DB: Supabase (PostgreSQL + JWT auth + Row-Level Security)
State: React Context (auth) + TanStack React Query (server state)
Monorepo: pnpm workspaces (artifacts/agri-learn, artifacts/api-server, lib/*)
Language: TypeScript throughout
Where things live
artifacts/agri-learn/app/ — Expo Router file-based routes (tabs, auth, module, product, profile)
artifacts/agri-learn/lib/supabase.ts — Supabase client
artifacts/agri-learn/context/AuthContext.tsx — Supabase auth context
artifacts/agri-learn/server/dev-wrapper.js — Dev proxy: opens port 5000 instantly, proxies to Metro on 5001
artifacts/api-server/src/ — Express routes and app setup
artifacts/api-server/src/index.ts — Server entry (binds 0.0.0.0:3001)
artifacts/api-server/dist/ — Built output (run build before starting)
lib/db/ — Drizzle ORM schema
Architecture decisions
dev-wrapper.js: Opens port 5000 immediately with /status health check so the workflow system detects it; proxies all traffic to Metro on port 5001 once ready
API binds 0.0.0.0: Needed for Replit's workflow port detection (loopback-only binding is not detected)
API default port 3001: Changed from 8080 to match the artifact.toml localPort and Replit's supported port list
Metro deduplication (metro.config.js): Forces react, react/jsx-runtime, @react-navigation/* to resolve to the agri-learn copies, preventing "Invalid hook call" from duplicate React instances in pnpm workspace
Supabase Auth kept: Not replaced with Replit Auth — Supabase keys pre-configured in userenv.shared
Product
Agricultural learning modules (crops, livestock, irrigation, soil, pest control, business)
AI-powered service search (POST /api/ai-search) and module learning assistant (POST /api/module-assist)
Produce marketplace (listings, create/browse/purchase)
Offer/Deal flow: buyers tap "Make Offer" in chat → structured offer card → farmer Accept/Decline → creates order automatically
Order tracking: confirmed → ready for pickup → completed, accessible from Profile → My Orders (both buyer and farmer views)
Ratings & reviews: after order completion either party can leave 1-5 star review with optional comment
User roles: farmer, buyer, retailer, admin
South African context: ZAR currency, SA locations, POPIA compliance
User preferences
Keep Supabase Auth (not replacing with Replit Auth)
OpenAI key stored as OPENAI_API_KEY secret
Gotchas
Always run pnpm --filter @workspace/api-server run build after changing src/ before restarting the backend
The artifacts/api-server: API Server artifact workflow may show as "failed" in the system — use the Start Backend workflow instead (configured via configureWorkflow)
app/profile/_layout.tsx must NOT exist — nested layout causes "Screen names must be unique" error in expo-router@6
Orders/Reviews tables need manual migration: run supabase/add_orders_reviews.sql in Supabase Dashboard → SQL Editor before orders/reviews will persist
Offer messages stored in existing messages table as JSON ({type:"offer", quantity, price_per_unit, unit, listing_title, status, buyer_name}); useUpdateOfferStatus patches the content JSON in-place
Pointers
Supabase docs: https://supabase.com/docs
Expo Router docs: https://docs.expo.dev/router/introduction/
Skills: .local/skills/workflows/SKILL.md, .local/skills/environment-secrets/SKILL.md