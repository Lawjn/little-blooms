# Phase 1 — Auth Flow

## Goal

User sign up + login (email + Google) end-to-end với Supabase. Apple Sign-In defer (Plan A free dev).

## Auth Strategy (ADR-008)

**Plan A — FREE dev**:
- Email/password: full flow (signup, login, forgot, OTP, reset)
- Google OAuth: free (Google Cloud Console OAuth client)
- ~~Apple Sign-In~~: DEFER (cần Apple Developer $99/năm)

User sẽ setup Google Cloud OAuth client free song song với mình code.

## Acceptance Criteria

- [ ] User tạo account qua email/password
- [ ] Login → redirect vào (main) tab navigator
- [ ] Logout → redirect về login
- [ ] Forgot password → email OTP → reset password
- [ ] Google Sign-In → tạo profile auto qua trigger
- [ ] Auth state persist qua restart app (AsyncStorage)
- [ ] RLS active: query Supabase trả đúng row của user logged in

## Sub-task Order (logic dependency)

1. **1.14 Nunito font** — foundation, mọi screen cần
2. **1.7 Auth store** — Zustand store + Supabase listener
3. **1.1 Start Screen** — splash, redirect dựa trên auth state
4. **1.2 Sign Up UI** — form
5. **1.3 Login UI** — form
6. **1.8 Email/password Supabase wire** — signUp/signIn/signOut hooks
7. **1.12 Auth guard** — redirect logic ở (auth)/_layout.tsx và (main)/_layout.tsx
8. **1.4-1.6 Forgot/OTP/Reset** UI
9. **1.9 Reset password flow** — Supabase resetPasswordForEmail + OTP verify
10. **1.10 Google OAuth** — sau khi user cung cấp Google Cloud client ID

## Files to Create/Modify

```
src/features/auth/
├── store.ts              # Zustand auth store
├── hooks.ts              # useSignUp, useSignIn, useSignOut, useResetPassword
├── api.ts                # raw Supabase auth calls
└── types.ts              # AuthUser, AuthSession types

src/components/
├── Button.tsx            # Primary green button (Done/Log In/Sign Up)
├── TextInput.tsx         # Styled input với label (email/password)
├── PasswordInput.tsx     # Có icon eye toggle show/hide
└── SocialButton.tsx      # Google/Apple round button

app/_layout.tsx           # Update: load Nunito font + AuthProvider
app/index.tsx             # Start Screen (splash + redirect)
app/(auth)/_layout.tsx    # Stack layout cho auth screens, guard if logged in
app/(auth)/login.tsx
app/(auth)/signup.tsx
app/(auth)/forgot-password.tsx
app/(auth)/verify-code.tsx
app/(auth)/reset-password.tsx
app/(main)/_layout.tsx    # Tab navigator + guard if NOT logged in
app/(main)/home/index.tsx # Placeholder (Phase 2 sẽ build full)
```

## Decisions Made

- **1.14 font**: dùng `@expo-google-fonts/nunito` thay vì download TTF. Lý do: package tự host trên CDN của Expo, ít maintenance, đồng bộ version. Trade-off: thêm 1 dependency nhưng đáng.
- **SplashScreen preventAutoHide**: chặn auto hide trước khi font load xong → tránh flash "no font" khi app khởi động. Hide khi font ready (`fontsLoaded || fontError`).
- **Return null khi font chưa load**: giữ splash screen hiển thị, không render `<Stack>` để tránh font fallback.
- **1.7 auth store**: tách 3 file rõ ràng — `store.ts` (Zustand state pure), `api.ts` (Supabase auth calls), `useAuthBootstrap.ts` (init + listener hook). Không gộp vì test/mock dễ hơn khi tách.
- **Selectors**: export `useUser`, `useSession`, `useIsAuthenticated`, `useIsInitializing` để component subscribe selective field, tránh re-render khi field khác đổi.
- **Bootstrap ở root layout**: gọi `useAuthBootstrap()` 1 lần trong `app/_layout.tsx` — listener tồn tại suốt lifetime app, unsubscribe khi unmount root.
- **1.1 Start Screen**: 2 conditions phải cùng đúng mới redirect: (a) auth bootstrap done (`!isInitializing`) và (b) min splash 2s đã trôi (`minDelayDone`). Tránh flash splash quá nhanh khi auth state load < 100ms.
- **Logo placeholder**: dùng emoji 🌱 trong rounded box màu primary light. Khi user export mascot SVG từ Figma sẽ thay bằng `Image` source.
- **Progress bar**: dùng RN `Animated` (không phải Reanimated) — đơn giản, đủ smooth cho 2s tween. Reanimated đợi Phase 9 polish.
- **Stub layouts/(auth)/_layout, (main)/_layout, login.tsx, home/index.tsx**: cần để typed routes generate đúng + cho redirect target tồn tại. Sẽ build full UI ở các sub-task sau.
- **Typed routes**: Expo Router dùng path literal `/login` và `/home/index` (không phải `/(auth)/login` hay `/(main)/home`). Group `(auth)` không xuất hiện trong URL.
- **1.2 Sign Up form**: dùng `react-hook-form` + `zod` (qua `@hookform/resolvers`) — declarative validation, ít boilerplate. Schema: name min 2, email valid, password min 6.
- **Components Button + TextField**: shared, dùng theme tokens. Button có 3 variants (primary/secondary/ghost), TextField có optional `isPassword` để hiển thị eye toggle (Ionicons từ `@expo/vector-icons`).
- **KeyboardAvoidingView + ScrollView**: cần để form không bị bàn phím che (đặc biệt iOS).
- **1.3 Login**: skip Facebook social (Plan A chỉ Google), skip fingerprint placeholder (defer Phase 9), skip Apple (defer Plan B+). Chỉ giữ 1 nút Google ở social row.
- **Stub `forgot-password.tsx`**: tạo placeholder để Login Link không lỗi typed-routes. UI thật ở sub-task 1.4.
- **1.8 React Query mutations**: dùng `useMutation` cho signUp/signIn/signOut/resetPassword/verifyOtp/updatePassword. Trong `onSuccess` throw lỗi nếu Supabase trả `{error}` để React Query catch và set `isError`.
- **Auto-redirect sau auth action**: KHÔNG cần manual `router.push()` — chỉ cần đợi Supabase auth listener fire `onAuthStateChange` → store update → `(auth)/_layout` re-evaluate → Redirect tự động.
- **1.12 Auth guard**: 3 lớp: (1) Start Screen ban đầu, (2) `(auth)/_layout` block khi đã login, (3) `(main)/_layout` block khi chưa login. Mỗi lớp `if (isInitializing) return null` để tránh flash sai screen.
- **Home placeholder**: thêm Sign Out button + hiển thị user.email + user.id 8 ký tự đầu — đủ để verify auth flow end-to-end.

## Issues Encountered

### Issue 1: Expo Go báo "Internet connection appears to be offline" khi scan QR LAN
- **Symptom**: Sau `npm start`, scan QR bằng Expo Go trên iPhone → "There was a problem running the requested app. Unknown error: The Internet connection appears to be offline. exp://192.168.2.231:8081"
- **Investigation**: Verify server alive (`curl http://192.168.2.231:8081` → HTTP 200 từ laptop). Phone và laptop cùng WiFi. Nhưng iOS Expo Go vẫn report offline.
- **Root cause**: Có thể do (a) router AP isolation, (b) Windows Firewall block external devices, hoặc (c) iPhone WiFi DHCP/DNS issue. LAN mode trên Windows + iPhone hay gặp combo này.
- **Fix**: Dùng tunnel mode. `npm run tunnel` (`expo start --tunnel`, cài `@expo/ngrok` lần đầu ~30s) → URL `exp://*.exp.direct` → scan từ Expo Go OK.
- **Trade-off**: Tunnel chậm hơn LAN ~1-2s mỗi bundle reload. Acceptable cho dev iteration.

### Issue 2: Sau Sign Up, email confirm link redirect về localhost + thiếu feedback
- **Symptom**: User signup OK, nhận email confirm. Click link → mở `http://localhost:3000/...` → "không truy cập được". Đồng thời app im lặng sau khi bấm Sign Up — user không biết next step.
- **Root cause 1 (link)**: Supabase mặc định dùng Site URL = localhost dành cho web app. Mobile app cần deep link `littleblooms://`.
- **Root cause 2 (feedback)**: `signUp` trả `session = null` khi "Confirm email" bật. Code hiện tại không phân biệt case này → user thấy không có gì xảy ra.
- **Fix**:
  - Code: `signup.tsx` thêm state `emailSentTo`. Sau signUp success, nếu `result.data.session` null → chuyển sang `<SignUpSuccess email={...} />` screen với nút "Back to Login" + tip kiểm tra Spam.
  - Code: `api.ts` thêm `emailRedirectTo: 'littleblooms://'` để khi user setup deep link sẽ work.
  - Code: `login.tsx` parse error message → nếu "Email not confirmed" hiện tiếng Việt rõ ràng + hint vào Spam. "Invalid login credentials" → "Sai thông tin".
  - User action: cho dev, Supabase Dashboard → Auth → Providers → Email → tắt "Confirm email" để bypass nhanh. Production sẽ setup deep link đầy đủ ở Phase 10.

### Misc: Typed routes regenerate
- Sau khi `expo start` chạy lần 2, types regenerate `/home/index` → `/home`. Phải sửa `Redirect href` ở 3 chỗ (`app/index.tsx`, `(auth)/_layout`, ...). Future: nếu thêm subroute trong folder `home/` (như `home/calendar`), types có thể đổi lại.

## Verified Milestones

- **2026-05-06**: User test thành công flow email/password trên iPhone (Expo Go + tunnel mode). Sign Up, Sign In, Sign Out đều OK. Profile row tự tạo qua trigger Supabase. Auth state persist qua reload app.

## Status: 🟡 IN PROGRESS (core flow verified, còn forgot password + Google OAuth)

## Started at

2026-05-05
