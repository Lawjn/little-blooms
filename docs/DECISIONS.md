# Architecture Decision Records

> Mỗi khi chọn lib mới hoặc đổi pattern, log vào đây với format ADR.

---

## ADR-001: React Native + Expo (managed workflow)

**Date**: 2026-05-05
**Status**: Accepted
**Context**: Cần build mobile app cross-platform iOS + Android với 1 codebase.
**Decision**: Dùng React Native + Expo SDK 54 (managed workflow) → eject sang dev client ở Phase 8 cho IAP.
**Consequences**:
- ✅ Build nhanh, Expo Go preview dễ
- ✅ EAS Build cho production
- ❌ Một số native module cần dev client (IAP)

---

## ADR-002: Supabase làm backend

**Date**: 2026-05-05
**Status**: Accepted
**Context**: User muốn build backend cùng app. Cần auth (email + Google + Apple), DB, storage, server-side validation cho IAP.
**Decision**: Supabase (Postgres + Auth + Storage + Edge Functions + RLS).
**Consequences**:
- ✅ All-in-one, free tier rộng (500MB DB, 1GB Storage, 50K MAU)
- ✅ Postgres = relational, query mạnh, RLS security
- ✅ Edge Functions cho IAP receipt validation
- ❌ Vendor lock-in nhẹ

---

## ADR-003: Expo Router thay vì React Navigation

**Date**: 2026-05-05
**Status**: Accepted
**Context**: Cần navigation cho ~34 screens.
**Decision**: Expo Router (file-based, typed routes experiment).
**Consequences**:
- ✅ Folder = route, dễ scale
- ✅ Typed routes (compile-time check)
- ✅ Deep links built-in
- ❌ Hơi mới, ít tutorial hơn React Navigation

---

## ADR-004: Zustand cho client state, TanStack Query cho server state

**Date**: 2026-05-05
**Status**: Accepted
**Context**: Cần state management gọn nhẹ.
**Decision**: Zustand cho UI/auth state. TanStack Query cho fetch/cache Supabase data.
**Consequences**:
- ✅ Zustand minimal boilerplate
- ✅ React Query auto retry, cache, optimistic updates
- ✅ Tách rõ client vs server state

---

## ADR-005: Path alias `@/*` → `src/*`

**Date**: 2026-05-05
**Status**: Accepted
**Context**: Tránh `../../../lib/theme` import hell.
**Decision**: tsconfig `paths`: `@/*` → `src/*`. Imports như `import { colors } from '@/lib/theme'`.
**Consequences**:
- ✅ Import sạch
- ⚠ Cần verify Metro hỗ trợ (Expo SDK 54 OK out-of-box với babel preset)

---

## ADR-006: npm cache trên ổ E (không phải C)

**Date**: 2026-05-05
**Status**: Accepted
**Context**: Ổ C của user gần đầy (97% full).
**Decision**: `npm config set cache E:/npm-cache --location=user`.
**Consequences**:
- ✅ Giải phóng C: drive
- ⚠ Nếu chuyển máy hoặc reinstall Node, cần config lại

---

## ADR-007: Mood scale 5 levels (Very Bad → Very Good)

**Date**: 2026-05-05
**Status**: Accepted
**Context**: Figma Statistics-Weekly hiện 5 lines: Very Bad, Bad, Neutral, Good, Very Good.
**Decision**: Lưu `mood_level: smallint 1-5` trong DB. Render emoji 5 mức ở Home.
**Consequences**:
- ✅ Đơn giản, đủ granular
- ✅ Map sang 5 flower variants

---

## ADR-010: Roll Call Feature (backlog từ Locket)

**Date**: 2026-05-07
**Status**: Proposed (chưa implement)
**Context**: User đề xuất thêm "Roll Call" giống Locket app — random notification 1-2 lần/ngày, user tap → quick capture photo → đính vào today's entry.

**Implementation plan**:

1. **Random schedule**: thay vì 5 fixed slots (9/12/3/6/9), thêm 1-2 random notifications mỗi ngày (vd random từ 10am-10pm). Dùng `Notifications.scheduleNotificationAsync` với trigger time-based hoặc daily với random offset.
2. **Notification content**: "📸 Roll Call! Chụp ảnh ngay để lưu khoảnh khắc."
3. **Quick capture flow**:
   - Tap notification → app deep link `littleblooms://rollcall`
   - Mở camera trực tiếp (`expo-camera` hoặc `ImagePicker.launchCameraAsync`)
   - Capture → upload Storage với label `rollcall=true` (cần thêm column?)
   - Append vào `mood_entries.photo_urls` của today entry (tạo entry nếu chưa có)
4. **Stat**: tracker "X roll calls answered this week" ở Profile/Stats.
5. **Optional**: hiển thị badge "🎯 Roll Call" trong Gallery cho ảnh chụp qua flow này (cần column `is_roll_call` ở table riêng hoặc metadata).

**Why defer**:
- Random scheduling logic phức tạp (cần re-schedule mỗi ngày, tránh duplicate, handle timezone).
- Quick camera flow cần test kỹ permissions camera + microphone.
- "Roll Call answered" stat cần schema thay đổi (cột mới hoặc table riêng).
- Tổng ~1 ngày work.

**Implementation timing**: làm sau khi user verify gallery + speed fix OK, hoặc gom vào Phase 9.

---

## ADR-009: Special Day Icon (feature backlog)

**Date**: 2026-05-06
**Status**: Proposed (chưa implement, defer Phase 9 polish hoặc thành sub-task riêng)
**Context**: User đề xuất cho phép user note thêm 1 emoji icon đặc biệt cho 1 ngày bất kỳ → ngày đó "đặc biệt" hơn (sinh nhật 🎂, du lịch ✈️, deadline 💼, ...). Hiển thị icon đó ở Garden cell + Calendar dot + Garden info.
**Decision**: Note vào backlog. Implement gồm:

1. **DB schema**: thêm `special_icon text NULL` vào `mood_entries`. Migration mới.
2. **Home form**: thêm field "Special icon" (optional) — emoji picker hoặc text input chấp nhận 1 ký tự emoji.
3. **Display**:
   - Garden cell: nếu có icon, render badge nhỏ ở góc cell (không thay flower emoji chính).
   - Calendar: cell đó có icon nhỏ thay/cạnh chấm mood dot.
   - Garden info screen: hiển thị icon to + label "Special day" ở hero box.

**Consequences**:
- ✅ Tăng personality, user nhớ ngày kỷ niệm dễ hơn.
- ✅ Schema change nhỏ (1 cột nullable).
- ❌ UI thêm phức tạp (emoji picker trên RN không có built-in — có thể dùng text input + clip 1 ký tự, hoặc 1 list emoji preset).
- ⚠ Visual conflict với flower nếu cell quá nhỏ — cần test layout trước.

**Implementation timing**: gom vào Phase 9 polish cùng các visual upgrades, hoặc thêm thành Phase 5.7 nếu user muốn ngay.

---

## ADR-008: Auth Strategy — Plan A (FREE dev)

**Date**: 2026-05-05
**Status**: Accepted
**Context**: Apple Developer = $99/năm, Google Play = $25 one-time. User chưa muốn chi tiền giai đoạn dev.
**Decision**: Plan A:
- Email/password: full flow
- Google OAuth: FREE (Google Cloud Console OAuth client)
- Apple Sign-In: **DEFER** đến khi user mua Apple Developer
- IAP: defer đến Phase 8 hoặc gần release

**Consequences**:
- ✅ 0đ chi phí giai đoạn dev
- ✅ Đầy đủ flow auth quan trọng (Email + Google OAuth phổ biến nhất)
- ⚠ App Store policy: nếu app có social sign-in khác, BẮT BUỘC có Apple Sign-In → khi release iOS phải thêm
- ⚠ Build sang Phase 1.10 cần user tạo Google Cloud OAuth client trước (free, hướng dẫn step-by-step)

---

## Template

```markdown
## ADR-NNN: <Title>

**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Deprecated | Superseded by ADR-XXX
**Context**: <Vấn đề/yêu cầu>
**Decision**: <Quyết định>
**Consequences**:
- ✅ <Lợi>
- ❌ <Hại>
- ⚠ <Lưu ý>
```
