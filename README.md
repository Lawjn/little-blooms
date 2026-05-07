# Little Blooms

Mobile app nhật ký theo dõi cảm xúc + gamification "vườn hoa".
Mỗi ngày log mood → 1 cây hoa tương ứng mọc trong vườn 5×6 (~30 ngày/tháng).

## Quick Start

```bash
# 1. Install deps
npm install --legacy-peer-deps

# 2. Setup env
cp .env.example .env.local
# → điền EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY

# 3. Apply Supabase migrations
# Dashboard → SQL Editor → paste supabase/migrations/0001_initial.sql → Run

# 4. Start dev server
npm run tunnel    # khuyến nghị (LAN bị "Internet offline" trên iPhone Expo Go)
# hoặc: npm start (LAN mode, nếu router OK)
```

## Stack

- React Native + Expo SDK 54
- TypeScript (strict)
- Expo Router (file-based)
- Zustand + TanStack Query
- Supabase (Postgres + Auth + Storage + RLS)

## Documentation

- [`CLAUDE.md`](./CLAUDE.md) — project context (đọc đầu tiên nếu là Claude/AI agent)
- [`docs/PROGRESS.md`](./docs/PROGRESS.md) — phase tracker (current status)
- [`docs/DATA_MODEL.md`](./docs/DATA_MODEL.md) — Supabase schema
- [`docs/DESIGN_TOKENS.md`](./docs/DESIGN_TOKENS.md) — colors, typography, spacing
- [`docs/DECISIONS.md`](./docs/DECISIONS.md) — Architecture Decision Records
- [`docs/phases/`](./docs/phases/) — journal mỗi phase

## Scripts

```bash
npm start            # Expo dev server
npm run ios          # iOS simulator
npm run android      # Android emulator
npm run web          # Browser preview
npm run type-check   # tsc --noEmit
npm run lint         # ESLint
npm run format       # Prettier
```

## Status

**Phase 0**: ✅ DONE
**Next**: Phase 1 — Auth Flow

Xem `docs/PROGRESS.md` cho chi tiết.
