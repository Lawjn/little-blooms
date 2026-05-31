# Progress Tracker

> Single source of truth về tiến độ build. Tick `[x]` ngay khi sub-task xong.
> Mỗi phase có file chi tiết ở `docs/phases/phase-N-*.md`.

**Last updated**: 2026-05-30
**Current phase**: Garden pixel-perfect + Watering streak feature [🟡 IN PROGRESS pending user verify]
**Phase 7 status**: ✅ DONE.

**User cần apply migrations theo thứ tự**:
- `supabase/migrations/0005_active_plant.sql` — active_plant column
- `supabase/migrations/0006_backfill_inventory.sql` — backfill inventory rows
- `supabase/migrations/0007_inventory_insert_policy.sql` — INSERT policy cho upsert
- `supabase/migrations/0008_avatar_rls_fix.sql` — fix avatars RLS folder pattern
- `supabase/migrations/0009_mood_pulses.sql` — quick log pulses table
- `supabase/migrations/0010_premium_and_unlocks.sql` — premium flag + owned_plants
- `supabase/migrations/0011_extend_store_type.sql` — extend store_items.type cho 'plant'
- `supabase/migrations/0012_watering.sql` — last_watered_date + water_streak ⚠️ MỚI
**Phase 6 status**: ✅ DONE (charts + aggregations, pending user verify).
**Phase 5 status**: ✅ DONE (calendar + future date guard verified, special icon backlog).
**Phase 3 status**: ✅ DONE (functional). Visual polish (isometric + SVG flowers) defer Phase 9.
**Phase 4 (Weather Themes) status**: defer Phase 9 (gom với visual polish — chung tone visual upgrade).
**Phase 2 status**: ✅ DONE (core save + prefill + photos verified). Sub-task 2.2 (date selector) defer Phase 5 (Calendar).
**Phase 1 status**: Core email/password verified ✅. Forgot password (1.4-1.6, 1.9) + Google OAuth (1.10) **defer Phase 9 polish**.
**Auth strategy**: Phương án A (FREE dev) — email/password + Google OAuth. **Skip Apple Sign-In** đến khi user mua Apple Developer ($99/năm). IAP defer Phase 8.

**Supabase status**: Project `bmezmmtwkubzuugftznh` alive, 5 tables created và RLS active. `.env.local` đã set up.

---

## Phase 0 — Foundation & Setup [✅ DONE]
> Goal: Project chạy được `npx expo start`, có CLAUDE.md, có docs framework. Setup Supabase migrations.

- [x] 0.1 Init Expo project (`create-expo-app` blank-typescript template)
- [x] 0.2 Install core deps (zustand, react-query, supabase-js, expo-router, async-storage, ...)
- [x] 0.3 Configure Expo Router (entry point + folder structure `app/`, `app/(auth)/`, `app/(main)/`)
- [x] 0.4 Setup `src/lib/theme.ts` (design tokens)
- [x] 0.5 Setup `src/lib/supabase.ts` (client với AsyncStorage)
- [x] 0.6 Tạo `CLAUDE.md`, `docs/PROGRESS.md`, `docs/phases/`, `DATA_MODEL.md`, `DESIGN_TOKENS.md`, `DECISIONS.md`
- [x] 0.7 Viết Supabase migration (`supabase/migrations/0001_initial.sql`) — **đã apply thành công 2026-05-05**
- [x] 0.8 Setup `.env.example`, `.gitignore`, `.eslintrc.json`, `.prettierrc.json`
- [x] 0.9 Smoke test: `tsc --noEmit` pass, `expo-doctor` 17/17 pass, Metro bundler start OK
- [x] 0.11 User cung cấp Supabase URL + anon key, `.env.local` setup xong, kết nối verify OK
- [~] 0.10 Setup Nunito font load — **defer sang Phase 1** (giảm setup scope ở Phase 0)

**Acceptance**: ✅ `npm start` chạy, ✅ `tsc --noEmit` pass, ✅ migration applied (5 tables verify HTTP 200).

### User tasks Phase 0: ✅ HOÀN THÀNH
- [x] Tạo Supabase project (`bmezmmtwkubzuugftznh.supabase.co`)
- [x] Cung cấp URL + anon key
- [x] Apply `0001_initial.sql` qua SQL Editor
- [x] Verify 5 tables tạo thành công (`profiles`, `mood_entries`, `user_inventory`, `store_items`, `purchases`)

---

## Phase 1 — Auth Flow [🟡 IN PROGRESS]
> Goal: User sign up + login (email + Google) end-to-end. Apple Sign-In defer.

- [x] 1.14 Load Nunito font ở root layout (qua `@expo-google-fonts/nunito` + `useFonts` hook + SplashScreen preventAutoHide)
- [x] 1.7 Auth Zustand store + Supabase listener (`store.ts`, `api.ts`, `useAuthBootstrap.ts` ở `src/features/auth/`)
- [x] 1.1 Start Screen (splash logo + progress bar 2s + auto-redirect dựa trên auth state)
- [x] 1.2 Sign Up screen UI (form + success screen "Check your email" với feedback rõ khi email confirm bật) — đã wire Supabase
- [x] 1.3 Login screen UI ("Welcome back!" + form + Forgot link + Google social button + Sign Up link) — chưa wire Supabase (sub 1.8) & Google OAuth (sub 1.10)
- [x] 1.8 Supabase email/password integration (signUp, signIn, signOut) — `hooks.ts` với React Query mutations, wire vào Sign Up + Login + Home
- [x] 1.12 Auth guard + redirect logic — `(auth)/_layout` redirect nếu logged in, `(main)/_layout` redirect nếu chưa login, Start Screen redirect dựa auth state
- [~] 1.4 Forgot Password screen UI — **DEFER Phase 9**
- [~] 1.5 Get Code (OTP) screen UI — **DEFER Phase 9**
- [~] 1.6 Reset Password screen UI — **DEFER Phase 9**
- [~] 1.9 Reset password flow (email magic link / OTP) — **DEFER Phase 9**
- [~] 1.10 Google OAuth (`expo-auth-session/providers/google`) — **DEFER** (cần user tạo Google Cloud OAuth client, không block Phase 2-8)
- [~] 1.11 Apple Sign-In — **DEFER** (cần Apple Developer $99, Plan A skip)
- [x] 1.13 Profile row tự tạo khi sign up — **đã có trigger trong migration 0001**

---

## Phase 2 — Daily Mood Entry [✅ DONE core, 2.2 defer Phase 5]
> Goal: Log mood ngày + ảnh + lưu Supabase Storage.

- [x] 2.0 Constants `src/features/mood/data.ts` — MOOD_OPTIONS (5 levels), 6 tag groups (EMOTIONS/HOBBIES/MEALS/SELF_CARE/WEATHER/OTHER_TAGS), TAG_PALETTE pastel colors
- [x] 2.1 Home layout: header (date label + dropdown chevron + sign-out btn), scroll body với 8 SectionCards + Done button
- [~] 2.2 Date picker component — **DEFER Phase 5** (gom với Calendar grid)
- [x] 2.3 `MoodPicker` component (5 emoji circles, single-select, scale up khi selected, border accent)
- [x] 2.4 `TagGrid` reusable component (multi-select chips, pastel rotating colors qua TAG_PALETTE, checkmark icon khi selected)
- [x] 2.5 Section: Emotions (15 tags)
- [x] 2.6 Section: Hobbies (10 tags)
- [x] 2.7 Section: Meals (5 tags)
- [x] 2.8 Section: Self-Care (7 tags)
- [x] 2.9 Section: Weather (5 tags - tạm multi-select, sẽ migrate weather → text[] ở 0002)
- [x] 2.10 Section: Other (8 tags)
- [x] 2.11 Today's note (multiline TextInput minHeight 80)
- [x] 2.12 `PhotoPicker` component (3 slot, expo-image-picker base64=true, preview + remove btn, dashed border khi empty)
- [x] 2.13 Upload Storage: `mood/upload.ts` (uploadMoodPhoto, getMoodPhotoSignedUrls, deleteMoodPhoto), wire vào save flow (upload pending → get path → save photo_urls)
- [x] 2.14 Done button: validate mood + upsert via `useSaveMoodEntry` mutation, label đổi "Done" → "Update" nếu đã có entry
- [x] 2.15 Load existing entry → prefill (`useMoodEntry(today)` + useEffect hydrate state khi data đến)
- [x] 2.16 `mood/api.ts` (getMoodEntry, upsertMoodEntry) + `mood/hooks.ts` (useMoodEntry, useSaveMoodEntry với invalidate)

---

## Phase 3 — Garden View [✅ DONE functional, polish defer Phase 9]
> Goal: Vườn 5×6 hiển thị flowers theo mood của tháng.

- [x] 3.1 Garden screen layout (sky background + scroll body, header với title + theme/music icons)
- [x] 3.2 Sky decorations (sun + 2 clouds, emoji static — animate ở Phase 9)
- [x] 3.3 Foreground (sheep + bird + house, emoji)
- [x] 3.4 Flat 5×6 grid (wooden frame brown + grass green base + cells 50px)
- [x] 3.5 (row, col) ↔ date mapping qua cell index → day = idx + 1
- [x] 3.6 Flower assets (5 emoji variants tạm dùng — swap SVG khi user export Figma): 🌻 🌷 🌹 🍀 🥀
- [x] 3.7 `mapMoodToFlower(level)` pure function (`src/features/garden/mapping.ts`) + `Flower` component
- [x] 3.8 Render plants từ `useMonthMoodEntries` query (Map indexed by entry_date cho lookup nhanh)
- [x] 3.9 Header: date range "MM.DD — MM.DD" + plant count "🌱 N"
- [x] 3.10 Top icons: weather + music — placeholder, Phase 4 wire theme switching
- [x] 3.11 Tap cây → router.push `/garden/[date]` (typed routes object form)
- [x] 3.12 Garden info screen `[date].tsx` (mood + tags read-only + note + photos signed URL)
- [x] 3.13 Bottom Tabs navigator: Home + Stats + Garden + Profile (Store ẩn defer Phase 8). Hide [date] route khỏi tab bar.

---

## Phase 4 — Weather Themes [✅ DONE]
> Implemented sớm cùng pixel-perfect garden polish (path A).

- [x] 4.1 Theme system (active_theme trong inventory, normalizeTheme guard)
- [x] 4.2 Snowy theme (sky lạnh, hills xám, particles trắng, snowman thay sheep)
- [x] 4.3 Cloudy theme (sky xám, mây dày, sun mờ)
- [x] 4.4 Rainy theme (sky xám đậm, particles line nghiêng)
- [x] 4.5 `WeatherPicker` modal "Choose your weather" với 4 options
- [~] 4.6 Locked themes CTA — defer (hiện tại all themes free, sẽ wire khi Phase 8 Store)

---

## Garden pixel-perfect + Watering [🟡 IN PROGRESS]
> Phase phụ — pixel-perfect theo Figma + daily streak watering action.

- [x] G.1 Real Figma SVG assets từ Iconify (sun, clouds, bird, sheep, house, tree, snowman, flowers, watering-can)
- [x] G.2 `IsometricGarden.tsx` — virtual canvas 430×932 scale, rhombus plot path từ Figma, 6×6 isometric grid, bilinear cell→point
- [x] G.3 Weather theme system (`weather.ts` + `WeatherPicker.tsx`) wired vào garden
- [x] G.4 Watering migration `0012_watering.sql` (last_watered_date + water_streak)
- [x] G.5 `waterPlant` API + `useWaterPlant` hook (1 lần/ngày, streak +1 nếu liên tục)
- [x] G.6 `SinglePlantScene.tsx` — single-plant garden view cho Garden info detail (rhombus tile + plant + watering can + pour animation)
- [x] G.7 Rewrite `garden/[date].tsx` dùng SinglePlantScene hero + detail cards bên dưới + Toast feedback
- [x] G.8 Tab bar Garden icon đổi `leaf` → center FAB pink (sprout) nổi giữa tab bar match Figma
- [x] G.9 Reposition tree+house — không còn "lơ lửng"/sát plot, ngồi trên hill front (y=612/632)
- [x] G.10 `WateringCanButton` floating trên màn Garden chính (luôn thấy) — fix "không thấy nút tưới"
- [x] G.11 User đã apply migration 0012 ✅
- [x] G.12 **Đổi chức năng bình tưới**: bỏ giới hạn 1 lần/ngày → mỗi lần tưới hiện 1 câu an ủi/động viên ngẫu nhiên (`wateringQuotes.ts` 30 câu + `WateringQuoteModal`). DB streak/lock bỏ (waterPlant/useWaterPlant thành dead code, giữ lại không hại).
- [x] G.13 Dịch Quick pulse → tiếng Việt (QuickLogModal, DecisionScreen, home, garden/[date])
- [x] G.14 Bình tưới ngoài vườn → navigate vào màn cây hoa hôm nay (không hiện quote ở ngoài). Hôm nay luôn hiện cây dù chưa log (mood mặc định 3).
- [x] G.15 Hiệu ứng tưới: bình tưới **nghiêng + rót nước xuống cây** (canRotate -42deg + giọt nước loop + cây nảy nhẹ) thay vì giọt tự rơi. Quote hiện sau khi rót xong.
- [x] G.16 Fix overlap nhà/bình tưới ở SinglePlantScene (nhà+cây dời lên bottom 132/150, bình tưới góc dưới phải bottom 20)
- [x] G.17 Fix hướng vòi bình tưới: xoay 70°→140° cho vòi chúc xuống cây (trước bị ngược lên trên)
- [x] G.18 Quote modal: đổi "Cảm ơn" → "Claim ✨" (primary) + thêm nút "Tưới tiếp 💧" (secondary, lấy câu mới)
- [ ] G.19 Verify hướng vòi + 2 nút modal (chờ screenshot)
- [ ] G.20 Pixel-perfect fine-tuning theo screenshot từ user (positioning loop)

---

## AI Coach "Bloom" [✅ DONE — verified trên thiết bị thật 2026-05-30]
> Check-in cảm xúc + lời khuyên lifestyle qua Groq (Llama 3.3 70B). Chi tiết: ADR-012.

- [x] AI.1 Edge Function `supabase/functions/ai-coach/index.ts` (Deno + Gemini, system prompt VN + guardrail an toàn, strip leading model turn, CORS)
- [x] AI.2 `src/features/coach/` — types + context (buildMoodContext 7 ngày) + api (functions.invoke) + hooks (useRecentMoodEntries, useSendCoachMessage)
- [x] AI.3 Màn chat `app/(main)/coach.tsx` (bubble UI, typing indicator, input bar, disclaimer)
- [x] AI.4 Entry point: nút chatbubble ở header Home → `/coach`. Route hidden trong tab layout.
- [x] AI.5 `tsconfig.json` exclude `supabase/functions` (Deno type riêng)
- [x] AI.6 User đã deploy Edge Function `ai-coach` (chat UI chạy, gọi tới được AI)
- [x] AI.7 **Đổi Gemini → Groq + Llama 3.3**: key Gemini trả 429 limit:0 (không có free quota). Groq free tier rộng, không cần billing, API chuẩn OpenAI.
- [x] AI.8 User set secret `GROQ_API_KEY` + re-deploy function
- [x] AI.9 ✅ Verify chat end-to-end trên thiết bị thật — **mọi thứ OK**
- [ ] AI.10 (sau khi nộp đồ án) User rotate key (đã lộ trong chat)

---

## Phase 5 — Calendar [✅ DONE pending user verify]
> Bao gồm cả 2.2 (date selector trong Home) — gom navigation date 1 chỗ.

- [x] 5.1 Calendar screen (`app/(main)/home/calendar.tsx`) với weekday headers + month nav + Today quick-jump
- [x] 5.2 `CalendarGrid` component — mood-color dot per cell từ `MOOD_VISUAL.bgColor`, today highlight border, selected highlight fill
- [x] 5.3 Tap day → `router.replace('/home', { date })` để Home prefill ngày đó
- [x] 5.4 Prev/next month buttons (disable next nếu đã là tháng hiện tại — không cho navigate future)
- [x] 5.5 Home accept `?date=` param qua `useLocalSearchParams`, fallback today. Reset form state khi date đổi → re-prefill từ entry mới.
- [x] 5.6 Home header dropdown → router.push `/home/calendar` (đã thay placeholder chevron bằng Pressable wrapped)
- [x] 5.7 **Future date guard**: CalendarGrid disable + dim future days, Home check `isFutureDate` → hide Done button + show notice "Không thể log cảm xúc cho ngày tương lai", validation defensive trong onSave
- [ ] 5.8 **Special day icon** (ADR-009 — backlog) — defer Phase 9 polish hoặc on-demand

---

## Phase 6 — Statistics [🟡 IN PROGRESS]
- [x] 6.1 Insights layout: header bar primary + scroll body, Weekly/Monthly toggle pill (active state white bg)
- [x] 6.2 Date range nav: prev/next chevron + label "Mar 2 - Mar 8" (week) / "May 2026" (month), disable next nếu future
- [x] 6.3 `MoodLineChart`: line curved, y-axis 1-5 với emoji labels, data points colored theo mood, hide point khi null
- [x] 6.4 `MoodPieChart`: donut chart với count center, legend bên phải với percent
- [x] 6.5 `ActivityBarChart`: bars với top labels, x = day, y = tổng số tags chọn
- [x] 6.6 `TopEmotionsList`: ranked với progress bar relative + percent
- [x] 6.7 Client-side aggregations: `aggregate.ts` (buildDailyMoodSeries, buildMoodDistribution, buildActivityBars, buildTopEmotions) + `hooks.ts` (useStatsRange)

---

## Phase 7 — Profile [🟡 IN PROGRESS]
- [x] 7.1 Profile layout: header bar primary + user card (avatar 96px + name + email) + streak + placeholder cards + sign out button
- [x] 7.2 Avatar edit: `AvatarPicker` component → ImagePicker với crop 1:1 → upload `avatars` bucket → update profiles.avatar_url + cache-bust với timestamp
- [x] 7.3 Name edit: tap pencil icon → Modal với TextInput → save mutation update profiles.name
- [x] 7.4 `StreakIndicator`: 7 dots Mon-Sun của tuần hiện tại, lit nếu logged, today có border accent. Count "X/7" header.
- [~] 7.5 Notifications toggle + time — defer Phase 9 (cần expo-notifications setup)
- [~] 7.6 Schedule local notification — defer Phase 9
- [~] 7.7 Data export CSV/JSON — defer (low priority, sau release)
- [~] 7.8 Other section (about/terms/privacy) — defer Phase 10 (cần real legal text)
- [x] 7.9 Sign out (đã có ở placeholder Profile screen, sẽ giữ)

---

## Phase 8 — Store + IAP [⬜ NOT STARTED]
- [ ] 8.1 Expo prebuild (eject sang dev client)
- [ ] 8.2 Install react-native-iap
- [ ] 8.3 Store-Home layout
- [ ] 8.4 Store-Theme grid
- [ ] 8.5 Store-Seeds grid
- [ ] 8.6 Define IAP product IDs
- [ ] 8.7 IAP wrapper functions
- [ ] 8.8 Edge Function `verify-iap`
- [ ] 8.9 Purchase flow UI
- [ ] 8.10 Restore purchases
- [ ] 8.11 Sandbox testing

---

## Phase 9 — Polish & Animations [⬜ NOT STARTED]
- [ ] 9.1 Loading skeletons
- [ ] 9.2 Error boundaries + retry
- [ ] 9.3 Toast notifications
- [ ] 9.4 Empty states
- [ ] 9.5 Lottie animations
- [ ] 9.6 Screen transitions
- [ ] 9.7 Haptic feedback
- [ ] 9.8 Pull-to-refresh
- [ ] 9.9 Accessibility labels

---

## Google Login [❌ BỎ — 2026-05-31]
> User quyết định bỏ Google login (không kịp config cho deadline). Giữ email/password (đã chạy ổn).
> Gỡ sạch: nút Google + divider khỏi login.tsx, import thừa (WebBrowser/Linking) khỏi auth/api.ts.
> `flowType: 'pkce'` trong supabase.ts giữ lại (vô hại, tốt cho email auth). Code Google login OAuth flow
> chưa từng apply hoàn chỉnh vào api.ts/hooks (các edit batch trước đó fail) → không có dead code cần dọn thêm.

---

## Gỡ thanh toán (Premium + Seeds) [✅ DONE 2026-05-31]
> User chưa làm được IAP thật → bỏ mọi thứ dính tiền. Giữ Store + đổi cây miễn phí.

- [x] Xóa `store/premium.tsx` + `store/seeds.tsx`
- [x] `store/index.tsx` viết lại: chỉ còn "Các loài cây" (free) + Themes (coming soon), bỏ seeds balance + premium banner
- [x] `store/plants.tsx`: mở khóa cây miễn phí (cost=0, bỏ seeds gating)
- [x] `profile.tsx`: bỏ Premium badge + Upgrade CTA
- [x] `stats.tsx`: bỏ AI insight demo premium-gated → thay bằng card gợi ý mở AI Coach (free)
- [x] `home/index.tsx`: bỏ seeds reward +5 khi save entry
- [x] `_layout.tsx`: bỏ route ẩn store/seeds + store/premium
- [x] Dead code: addSeeds/fakePurchaseSeeds/setPremium trong inventory giữ lại (vô hại)
- [ ] Rebuild APK với bản đã gỡ thanh toán

---

## Phase 10 — Build, Test, Deploy [🟡 IN PROGRESS — APK build OK]
- [x] 10.1 EAS config (`eas.json`: preview=apk, production=aab, env Supabase nhúng sẵn)
- [x] 10.1b `.npmrc` legacy-peer-deps=true → fix EAS install deps fail (xung đột Supabase+RN)
- [x] 10.1c `eas init` → projectId `c2e0308f-...` (owner lawjn)
- [x] 10.2 App icon + splash (đã có sẵn assets/*.png)
- [x] 10.3 Bundle ID `com.littleblooms.app` + Android keystore (EAS auto-gen)
- [x] 10.5b **EAS Build Android APK (preview) THÀNH CÔNG** 2026-05-30 → artifact .apk
- [ ] 10.4 EAS Build iOS → TestFlight (defer — cần Apple Developer $99)
- [ ] 10.5 Play Store publish — **BLOCKED**: tài khoản Play Console bị restricted (verify danh tính CCCD fail). Đang appeal/đòi hoàn $25. APK gửi thầy trực tiếp thay thế.
- [ ] 10.6 Privacy policy + terms (chỉ cần nếu publish Play Store)
- [ ] 10.7 Store metadata (chỉ cần nếu publish Play Store)
- [ ] 10.8 Final QA toàn app trên thiết bị thật

---

## User Tasks (song song với Claude)

- [x] Tạo Supabase project + cung cấp URL + anon key (DONE 2026-05-05)
- [ ] Apple Developer account ($99/năm) — Phase 1 (Apple Sign-In) hoặc Phase 8
- [ ] Google Cloud OAuth credentials — Phase 1
- [ ] Google Play Console ($25) — Phase 8
- [ ] Tạo IAP products — Phase 8
- [ ] Test trên thiết bị thật + feedback — sau mỗi phase
- [ ] Upgrade Figma plan hoặc export PNG — khi cần
- [ ] Privacy policy + Terms — Phase 10

---

## Status Legend

- ✅ DONE — phase hoàn thành, đã test
- 🟡 IN PROGRESS — đang làm
- ⬜ NOT STARTED
- 🔴 BLOCKED — cần user action / dependency
