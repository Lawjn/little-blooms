# Phase 0 — Foundation & Setup

## Goal

Project chạy được `npx expo start`, có CLAUDE.md + docs framework + Supabase migrations sẵn sàng apply.

## Acceptance Criteria

- [x] `npx expo start` chạy không lỗi
- [x] Folder structure tạo đầy đủ (`app/`, `src/`, `docs/`, `supabase/`)
- [x] CLAUDE.md + PROGRESS.md + DATA_MODEL.md + DESIGN_TOKENS.md + DECISIONS.md tồn tại
- [ ] Supabase migrations file viết xong, sẵn sàng apply
- [ ] App bundle thành công + render "Hello Little Blooms"

## Sub-tasks

### 0.1 Init Expo project ✅
- Dùng template `blank-typescript`, Expo SDK 54, RN 0.81, React 19
- Init vào subfolder `_tmpinit` rồi move ra (vì `.claude/` đã tồn tại block init thẳng)

### 0.2 Install core dependencies ✅
- expo-router 6, expo-font, expo-splash-screen, expo-linking, expo-constants
- react-native-safe-area-context, react-native-screens
- @supabase/supabase-js, @react-native-async-storage/async-storage, react-native-url-polyfill, expo-secure-store
- zustand, @tanstack/react-query, react-hook-form, zod, date-fns
- Dev: eslint, prettier, eslint-config-expo, eslint-config-prettier, @types/node
- **Note**: phải dùng `--legacy-peer-deps` cho supabase + RN do peer conflict

### 0.3 Configure Expo Router ✅
- Đổi `package.json` main → `expo-router/entry`
- Xóa `App.tsx`, `index.ts` (không dùng nữa)
- Tạo `app/_layout.tsx` với QueryClient + SafeAreaProvider + Stack
- Tạo `app/index.tsx` placeholder
- Plugins trong `app.json`: `expo-router`, `expo-font`, `expo-secure-store`
- Bật `experiments.typedRoutes: true`

### 0.4 Setup theme.ts ✅
- File `src/lib/theme.ts` với colors, spacing, radii, typography, shadows
- Dùng `as const` để TS infer literal types

### 0.5 Setup supabase.ts ✅
- File `src/lib/supabase.ts` với AsyncStorage persistence
- Read env từ `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Warn nếu missing

### 0.6 Tạo docs framework ✅
- `CLAUDE.md`, `docs/PROGRESS.md`, `docs/DATA_MODEL.md`, `docs/DESIGN_TOKENS.md`, `docs/DECISIONS.md`
- `docs/phases/phase-0-setup.md` (file này)

### 0.7 Supabase migrations
- Sẽ viết `supabase/migrations/0001_initial.sql` chứa: profiles, mood_entries, user_inventory, store_items, purchases + RLS

### 0.8 Config files ✅
- `.gitignore` (mở rộng từ Expo default, thêm `.env.local`, `.vscode/`, `.idea/`, `Thumbs.db`)
- `.env.example` (template cho user copy)
- `.eslintrc.json` (extends expo + prettier)
- `.prettierrc.json` (single quote, semi, trailing comma all)
- `tsconfig.json` paths alias `@/*` → `src/*`

### 0.9 Smoke test
- Chạy `npm start` → bundle thành công → render Index screen
- Chạy `npm run type-check` → không lỗi TS

### 0.10 Nunito font
- **Decision**: defer sang Phase 1 — load font cần extra setup (expo-font + Google Font fetch). Dùng default font cho Phase 0 smoke test trước.

## Files Created/Modified

```
E:\LittleBloom\
├── package.json (rewrite)
├── app.json (rewrite)
├── tsconfig.json (paths alias)
├── .gitignore (extended)
├── .env.example (new)
├── .eslintrc.json (new)
├── .prettierrc.json (new)
├── CLAUDE.md (new)
├── app/_layout.tsx (new)
├── app/index.tsx (new)
├── src/lib/theme.ts (new)
├── src/lib/supabase.ts (new)
├── docs/PROGRESS.md (new)
├── docs/DATA_MODEL.md (new)
├── docs/DESIGN_TOKENS.md (new)
├── docs/DECISIONS.md (new)
└── docs/phases/phase-0-setup.md (this file)
```

## Decisions Made

- ADR-001 đến ADR-007 ghi trong `docs/DECISIONS.md`
- Defer font loading sang Phase 1 (giảm setup complexity ở Phase 0 smoke test)
- npm cache di chuyển từ C: sang E: vì C: 97% full

## Issues Encountered

1. **`.claude/` folder block create-expo-app trực tiếp** → workaround init vào `_tmpinit/` rồi move ra
2. **C: drive 97% full** → move npm cache sang E:, recover 4GB
3. **ERESOLVE peer conflict** giữa @supabase/supabase-js và react-native deps → dùng `--legacy-peer-deps`

## Status: ✅ DONE (FULL)

Tất cả code-side + user-side đều xong. Sẵn sàng vào Phase 1.

### Smoke test results
- ✅ `tsc --noEmit` pass (no TS errors)
- ✅ `npx expo-doctor` 17/17 checks pass
- ✅ `npx expo start --port 8089` Metro bundler start OK
- ✅ Supabase connectivity verify: 5 tables HTTP 200, RLS active, anon key JWT decode khớp project ref

### Supabase project info
- Project ref: `bmezmmtwkubzuugftznh`
- API URL: `https://bmezmmtwkubzuugftznh.supabase.co`
- `.env.local` đã set, gitignored an toàn
- Migration `0001_initial.sql` applied 2026-05-05

### Issue fixed at end of Phase 0
- User dán secret vào `.env.example` (sẽ commit lên git!) thay vì `.env.local`
- User dán URL trang dashboard (`https://supabase.com/dashboard/...`) thay vì API URL (`https://<ref>.supabase.co`)
- Đã chuyển secret sang `.env.local`, restore `.env.example` về template, sửa URL về format đúng
- Verify URL bằng cách decode JWT (`ref` claim phải khớp subdomain) → khớp

## Completed at

2026-05-05
