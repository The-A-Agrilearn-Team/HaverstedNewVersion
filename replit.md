# AgriLearn — Agricultural Learning Platform

## Project Overview
A comprehensive React Native/Expo mobile application for South African farmers, buyers, retailers, and admins. The app provides agricultural learning modules, a produce marketplace, and multilingual support.

## Architecture
- **Frontend**: React Native + Expo (managed workflow)
- **Backend/Auth/DB**: Supabase (PostgreSQL, JWT auth, PostgREST API, Row-Level Security)
- **Navigation**: Expo Router (file-based, tabs + modal stack)
- **State**: React Context (auth) + TanStack React Query (server state)
- **Language**: TypeScript throughout

## Key Files
```
artifacts/agri-learn/
├── app/
│   ├── _layout.tsx           # Root layout, providers
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Tab bar (native glass + classic fallback)
│   │   ├── index.tsx         # Home screen
│   │   ├── learn.tsx         # Learning modules list
│   │   ├── market.tsx        # Marketplace listings
│   │   └── profile.tsx       # User profile + auth gate
│   ├── (auth)/
│   │   ├── _layout.tsx       # Auth modal stack
│   │   ├── login.tsx         # Sign in screen
│   │   └── register.tsx      # Registration with role selector
│   ├── module/[id].tsx       # Module detail + content reader
│   └── product/[id].tsx      # Product detail + contact seller
├── lib/supabase.ts           # Supabase client + type definitions
├── context/AuthContext.tsx   # Auth provider (sign in/up/out, profile)
└── constants/colors.ts       # Design system (green #2D6A4F palette)
```

## User Roles
- **farmer**: List/manage produce, access all learning modules
- **buyer**: Browse and purchase produce, access learning modules
- **retailer**: Bulk purchasing, access learning modules
- **admin**: Full access + content management + audit logs

## Environment Variables
- `EXPO_PUBLIC_SUPABASE_URL`: Set — `https://quxdfknwgymgghemkmcd.supabase.co`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: **PENDING** — needs Supabase dashboard → Project Settings → API → anon public key

## Design System
- Primary: `#2D6A4F` (forest green)
- Primary Light: `#52B788`
- Accent: `#F2994A` (warm orange)
- Font: Inter (400/500/600/700)

## Canvas Design Documentation
The workspace canvas contains full academic assessment documentation:
1. **Database ERD** — 3NF normalized schema with all tables, fields, constraints, cardinalities
2. **System Architecture** — Component layers, Supabase services, technology justification
3. **Security Architecture** — Auth, RBAC/RLS, encryption, SQL injection prevention, POPIA compliance
4. **API Specification** — All REST endpoints (PostgREST), request/response formats, HTTP status codes
5. **Activity Diagram** — Module learning flow (auth → browse → select → read → complete)
6. **Domain Class Diagram** — Classes, attributes, methods, enumerations, relationships
7. **UI/UX Design** — All 7 screens, design system, responsive design decisions
8. **Data Dictionary** — Field definitions, types, constraints, business rules

## Data
Currently using mock data (in-screen arrays). Will switch to live Supabase queries once `EXPO_PUBLIC_SUPABASE_ANON_KEY` is provided.

## South African Context
- Currency: South African Rand (R)
- Locations: Durban KZN, Johannesburg GP, Pretoria GP, Free State, Limpopo, Western Cape
- Languages targeted: English, isiZulu, Sesotho, Afrikaans, isiXhosa
- POPIA compliance built into security model
