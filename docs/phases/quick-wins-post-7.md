# Quick Wins (post-Phase 7)

## Goal

2 feature user-requested sau khi Phase 0-7 functional core đã verified:

1. **Plant species switcher** — User chọn 1 trong 5 loài cây (tulip/sunflower/rose/cherry/clover) cho vườn. FREE, không cần IAP. Lưu DB qua `user_inventory.active_plant`.
2. **Daily reminders** — Local notifications nhắc log mood ở 5 khung giờ: 9am, 12pm, 3pm, 6pm, 9pm. User toggle individual slots.

## Acceptance Criteria

- [ ] Settings screen accessible từ Profile
- [ ] Plant switcher: 5 options, current highlighted, tap để đổi → Garden refresh hiển thị plant mới
- [ ] Notification master toggle + 5 slot toggles (9/12/3/6/9)
- [ ] Permission prompt khi enable lần đầu
- [ ] Notifications fire đúng giờ trên thiết bị

## Sub-task Order

**Feature 1 — Plant switcher:**
1. Migration 0005: add `active_plant` column to user_inventory
2. inventory api + hooks (getInventory, updateActivePlant)
3. Garden screen: read activePlant from inventory thay vì DEFAULT_PLANT
4. PlantSwitcher component

**Feature 2 — Daily reminders:**
5. Install expo-notifications
6. Notification utils (request permission, schedule/cancel by hour, list scheduled)
7. NotificationSettings component với 5 slot toggles
8. AsyncStorage để lưu enabled slots state

**Settings screen + Profile link:**
9. New `app/(main)/settings.tsx` — host PlantSwitcher + NotificationSettings
10. Hide settings từ tab bar (`href: null`)
11. Profile: link "Settings" navigate sang /settings

## Files to Create/Modify

```
src/features/inventory/
├── api.ts
└── hooks.ts

src/features/notifications/
├── scheduler.ts             # expo-notifications wrapper
└── components/
    └── NotificationSettings.tsx

src/features/profile/components/
└── PlantSwitcher.tsx

app/(main)/settings.tsx       # New
app/(main)/_layout.tsx        # Hide settings route
app/(main)/profile.tsx        # Add Settings link
app/(main)/garden/index.tsx   # Read activePlant from inventory
app/(main)/garden/[date].tsx  # Read activePlant from inventory

supabase/migrations/0005_active_plant.sql
```

## Decisions Made

- **Plant lưu DB** (`user_inventory.active_plant`) thay vì AsyncStorage: cross-device sync (user dùng nhiều thiết bị thấy cùng plant), consistency với pattern user_inventory đã có cho weather theme.
- **Migration 0005 idempotent**: dùng `ADD COLUMN IF NOT EXISTS` + `DO $$ ... pg_constraint check` cho constraint — chạy lại OK.
- **Constraint check ở DB**: `active_plant in ('tulip', 'sunflower', 'rose', 'cherry', 'clover')` — defensive, tránh client gửi value lạ.
- **Notifications local-only**: dùng `expo-notifications` scheduleNotificationAsync với DAILY trigger. Hoạt động trong Expo Go (không cần dev client).
- **5 slot toggles thay vì 1 chọn time**: user request rõ "chia ra theo khung giờ 9am/12pm/3pm/6pm/9pm" → 5 toggle độc lập + master toggle. Mặc định khi enable master = bật cả 5.
- **Storage slots ở AsyncStorage** (`reminders.enabled.slots`): KHÔNG cần sync DB vì notifications là per-device. Mỗi device tự manage scheduled notifications.
- **Schedule strategy**: cancelAll → reschedule lại theo state mới mỗi khi toggle. Đơn giản hơn track per-notification-id.
- **Notification handler**: setNotificationHandler ở module load (top-level) — show banner + sound khi app foreground.
- **Settings screen riêng** (per user request): `app/(main)/settings.tsx`, hide khỏi tab bar (`href: null`), navigate qua Profile → "Settings" link card.
- **Phase 8 bị thay**: hệ thống active_plant ở `user_inventory` đã chuẩn cho IAP — Phase 8 sau này chỉ cần bổ sung Store UI bán plant types khác (hiện 5 plant đều free).

## Issues Encountered

### Issue 1: Đổi plant không work + warning Expo Go notifications
- **Symptom (1)**: User tap plant → spinner → không đổi. Console không error rõ.
- **Root cause**: `user_inventory` row chưa tồn tại cho user (signup TRƯỚC khi trigger `handle_new_user` được tạo). `.update()` target không có row → no-op silent → `.single()` fail.
- **Fix (1a)**: Migration 0006 backfill — insert user_inventory cho mọi profile chưa có row.
- **Fix (1b)**: `updateActivePlant` đổi từ `.update()` → `.upsert({onConflict:'user_id'})` defensive cho future signups.
- **Symptom (2)**: WARN "expo-notifications functionality is not fully supported in Expo Go".
- **Root cause**: SDK 53+ remove push notifications từ Expo Go. Local notifications partially work nhưng warn.
- **Fix (2)**: Acknowledge — full notifications cần dev client (Phase 10 build sẽ có). Local schedule vẫn được trong Expo Go.

### Issue 2: UX feedback — plant switcher should ở Garden, notifications nên auto
- **Plant switcher**: Move từ Settings → Garden modal (tap plant pill ở header → bottom sheet với PlantSwitcher).
- **Notifications**: Bỏ master toggle + slot toggles UI. Auto-request permission ở root layout qua `useAutoNotificationSetup()` — pattern giống mọi app khác.
- **Settings screen**: xóa hoàn toàn (không còn nội dung gì sau 2 thay đổi trên).
- **Profile Settings link**: xóa.
- **Notifications customization sau này**: nếu user muốn đổi giờ → manage qua iOS Settings → app, hoặc thêm UI back vào Phase 9.

## Migrations to Apply

User cần chạy 2 file (theo thứ tự):
1. `supabase/migrations/0005_active_plant.sql` — add `active_plant` column
2. `supabase/migrations/0006_backfill_inventory.sql` — backfill missing user_inventory rows

### Verify migrations applied
SQL Editor query:
```sql
select user_id, active_plant from user_inventory;
```
Phải thấy ít nhất 1 row của bạn với active_plant = 'tulip' (default). Nếu rỗng → 0006 chưa apply.

### Issue 3: UX feedback round 2
- **Plant change moved to top-right icon row**: 3 icons (leaf=plant / weather / music) như Figma. Tap leaf icon → modal picker. Pill text dưới chỉ còn label "Tulip garden" không tap.
- **Done button slow**: photo upload đổi từ sequential `for` loop → parallel `Promise.all`. 3 ảnh → ~3x nhanh hơn (chạy đồng thời thay vì xếp hàng). + ImagePicker quality 0.7→0.5 (giảm size ~30-40%, journal photo không cần HD).
- **Plant update**: thêm `console.warn` log raw error nếu upsert fail → user/dev xem được trong Expo Go console để debug.

### Issue 4: RLS violation khi đổi plant + UX icon hard to see
- **Symptom**: console log `code: 42501, message: "new row violates row-level security policy for table user_inventory"`.
- **Root cause**: Migration 0001 chỉ tạo SELECT + UPDATE policies cho `user_inventory`. Postgres UPSERT (INSERT ON CONFLICT DO UPDATE) **bắt buộc cả INSERT + UPDATE policies** — kể cả khi conflict trigger UPDATE path. Thiếu INSERT → RLS reject.
- **Fix**: Migration 0007 add INSERT policy `auth.uid() = user_id`.
- **Lesson learned**: bất cứ table nào client dùng `.upsert()` → cần đủ 3 policies SELECT + INSERT + UPDATE. Migration 0001 thiết kế thiếu — đáng lẽ phải có INSERT từ đầu.

### Issue 5: Icon hard to see + đẹp hơn
- **Symptom**: Icons trắng trên nền sky cùng tone trắng → khó nhìn.
- **Fix**:
  - Đổi `Ionicons "leaf"` → `MaterialCommunityIcons "flower-tulip"` (đẹp hơn, đúng theme garden)
  - Mỗi icon button có background color signature: plant hồng `#EC407A`, weather cam `#FB8C00`, music tím `#7E57C2`
  - Icon trắng trên nền màu → contrast cao, nhìn rõ
  - Thêm shadow.sm để có depth

## Status: ✅ DONE pending user verify

## Started at

2026-05-06
