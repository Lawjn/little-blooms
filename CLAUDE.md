# Little Blooms — Project Context for Claude

> **Đọc file này đầu tiên mỗi session.** Sau đó đọc `docs/PROGRESS.md` để biết phase hiện tại.

## 🚨 CRITICAL RULE: Update progress files NGAY sau mỗi sub-task

**Tuyệt đối KHÔNG batch — token có thể hết bất cứ lúc nào giữa chừng.**

Sau MỖI sub-task hoàn thành (không phải sau cả phase), phải làm theo thứ tự:

1. **Tick `[x]`** trong `docs/PROGRESS.md` cho sub-task vừa xong
2. **Update** `docs/phases/phase-N-*.md` nếu có decision/issue mới
3. **Cập nhật** field `**Last updated**` và `**Current phase**` ở đầu PROGRESS.md
4. (Optional) Commit nếu sub-task có ý nghĩa độc lập

Làm việc kế tiếp CHỈ khi 3 bước trên xong. Lý do: nếu session bị cắt giữa chừng, future Claude đọc PROGRESS.md là biết chính xác đã làm tới đâu, không bị mất công.

**Anti-pattern**: làm 5 sub-task xong mới tick một lượt → token hết ở task 4 → mất context của 4 task đó.

## 1. Project Overview

**Little Blooms** — mobile app nhật ký theo dõi cảm xúc kết hợp gamification "vườn hoa". Mỗi ngày user log mood + activities + photos → 1 cây hoa tương ứng "mọc" trong vườn 5×6 (~30 ngày trong tháng).

**Target user**: ai muốn track tâm trạng theo ngày + cảm giác tự thưởng khi nhìn vườn hoa lớn dần.

**Key features**:
- Daily mood entry (5 levels mood + emotions/hobbies/meals/self-care/weather/other tags + note + 3 photos)
- Garden view (isometric 5×6 grid, mood → flower mapping)
- Weather themes (Default, Snowy, Cloudy, Rainy)
- Statistics (Weekly/Monthly: line, pie, bar charts)
- Calendar browse history
- Profile + streak + notifications
- Store + IAP (mua Seeds & Themes qua Apple/Google)

**Design source**: [Figma Little Blooms UX/UI](https://www.figma.com/design/DOGpUXq5sQdj7ZNQ17GVxH/Little-Blooms-UX-UI) (file key `DOGpUXq5sQdj7ZNQ17GVxH`, 34 screens).

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native + Expo SDK 54 (managed → dev client từ Phase 8) |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router (file-based, typed routes) |
| State client | Zustand |
| State server | TanStack Query (React Query) |
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions + RLS) |
| Auth | Email/password + Google OAuth + Apple Sign-In |
| IAP | `react-native-iap` (Phase 8+, cần dev client) |
| Forms | react-hook-form + zod |
| Date | date-fns |
| Charts | react-native-gifted-charts (cài ở Phase 6) |
| Animations | react-native-reanimated v3 + react-native-skia (cài ở Phase 3+) |

## 3. Project Structure

```
E:\LittleBloom\
├── CLAUDE.md                    ⭐ File này
├── README.md                    Setup cho dev mới
├── app/                         Expo Router routes
│   ├── _layout.tsx              Root layout (providers)
│   ├── index.tsx                Start Screen
│   ├── (auth)/                  Auth group: login, signup, ...
│   └── (main)/                  Main app group với bottom tabs
├── src/
│   ├── components/              Reusable UI
│   ├── features/{auth,mood,garden,stats,store,profile}/
│   ├── lib/{supabase,iap,theme}.ts
│   ├── stores/                  Zustand stores
│   ├── hooks/
│   └── types/
├── assets/{fonts,flowers,images}/
├── supabase/
│   ├── migrations/              SQL files (numbered: 0001_*.sql)
│   ├── seed.sql                 Test data
│   └── functions/verify-iap/    Edge Function
├── docs/
│   ├── PROGRESS.md              ⭐ Phase status — đọc sau CLAUDE.md
│   ├── phases/phase-N-*.md      Journal mỗi phase
│   ├── DATA_MODEL.md
│   ├── DESIGN_TOKENS.md
│   └── DECISIONS.md             Architecture Decision Records
├── app.json                     Expo config
├── eas.json                     EAS Build (Phase 10)
├── tsconfig.json                Path alias: @/* → src/*
└── package.json
```

## 4. Code Conventions

- **Imports order**: external libs → `@/lib` → `@/features` → `@/components` → relative
- **Path alias**: `@/lib/theme` resolves to `src/lib/theme.ts`
- **Components**: functional, named export với props interface ngay trên component
- **File naming**:
  - PascalCase cho components: `MoodPicker.tsx`, `EmotionGrid.tsx`
  - kebab-case cho route files: `forgot-password.tsx`, `verify-code.tsx`
- **Style**: dùng `StyleSheet.create` với theme tokens — KHÔNG hardcode màu/spacing
- **Strict TypeScript**: không `any`, dùng `unknown` + type guard nếu cần
- **Async**: dùng React Query cho server state, Zustand cho client state. Không gọi supabase trực tiếp trong component — wrap qua hook trong `features/<X>/hooks.ts`

## 5. Key Files Reference

| File | Purpose |
|---|---|
| `src/lib/theme.ts` | Design tokens (colors, spacing, typography, radii, shadows) — single source of truth |
| `src/lib/supabase.ts` | Supabase client với AsyncStorage persistence |
| `app/_layout.tsx` | Root providers: QueryClient, SafeAreaProvider, StatusBar |
| `app/index.tsx` | Start Screen (sẽ thay bằng splash + auth redirect ở Phase 1) |
| `docs/IMAGE_SYSTEM.md` | Tham khảo upload/download ảnh — architecture, optimizations, external refs |

## 6. Run Commands

```bash
npm start                  # Expo dev server
npm run ios                # iOS simulator (cần Mac)
npm run android            # Android emulator
npm run web                # Browser preview (limited features)
npm run type-check         # tsc --noEmit
npm run lint               # ESLint
npm run format             # Prettier
```

## 7. Environment Variables

Không commit secrets. Dev:

1. `cp .env.example .env.local`
2. Điền giá trị từ [Supabase Dashboard → Settings → API](https://supabase.com/dashboard)
3. Restart `expo start` để load env

Vars dùng `EXPO_PUBLIC_` prefix để inject vào client (anon key OK ở client vì có RLS).

## 8. Workflow Per Session

1. Đọc `CLAUDE.md` (file này) → biết stack, structure, conventions
2. Đọc `docs/PROGRESS.md` → biết đang ở phase nào, sub-task nào
3. Đọc `docs/phases/phase-N-*.md` của phase hiện tại → xem decisions/issues đã ghi
4. Thực hiện sub-task tiếp theo
5. **Tick `[x]` trong PROGRESS.md ngay khi xong sub-task** (không batch)
6. Update `docs/phases/phase-N-*.md` nếu có decision mới hoặc issue
7. Commit theo format: `phase-N: <sub-task description>` (e.g. `phase-2: implement EmotionGrid`)
8. Cuối phase → mark phase ✅ DONE trong PROGRESS.md + viết summary cuối phase doc

## 9. Things NOT To Do

- ❌ **KHÔNG batch update progress files** — tick PROGRESS.md ngay sau mỗi sub-task (xem CRITICAL RULE đầu file)
- ❌ KHÔNG hardcode màu/spacing — luôn dùng `@/lib/theme`
- ❌ KHÔNG tắt RLS trên bất kỳ table nào — security boundary
- ❌ KHÔNG commit `.env.local` (đã trong `.gitignore`)
- ❌ KHÔNG sửa `app.json` plugins/bundle identifier mà không update `docs/DECISIONS.md`
- ❌ KHÔNG skip phase journal — sub-task xong là phải tick + ghi lại quyết định
- ❌ KHÔNG cài lib mới mà không log vào `docs/DECISIONS.md` (lý do chọn)
- ❌ KHÔNG dùng `any` trong TypeScript — strict mode bật

## 10. Outstanding User Tasks

Tại thời điểm bắt đầu, user CẦN làm các việc sau (không Claude làm thay được):

- [ ] Tạo Supabase project, cung cấp URL + anon key (Phase 0)
- [ ] Apple Developer account ($99/năm) cho Apple Sign-In + IAP
- [ ] Google Cloud OAuth credentials cho Google Sign-In (Phase 1)
- [ ] Google Play Console ($25) cho IAP Android (Phase 8)
- [ ] Tạo IAP products trong App Store Connect + Play Console (Phase 8)
- [ ] Test trên thiết bị thật + feedback sau mỗi phase
- [ ] Upgrade Figma plan hoặc export PNG cho Claude khi cần

Track chi tiết trong `docs/PROGRESS.md` mục "User Tasks".
