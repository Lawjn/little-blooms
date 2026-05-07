# Phase 7 — Profile

## Goal

Profile tab cho user: avatar + tên + email + streak indicator + sign out. Notification, data export, other section defer Phase 9-10.

## Acceptance Criteria

- [ ] Profile screen hiện avatar circle (placeholder nếu chưa có) + tên + email
- [ ] Tap avatar → image picker → upload `avatars` bucket → preview update
- [ ] Tap edit pencil cạnh tên → modal đổi tên → save vào profiles.name
- [ ] Streak indicator: 7 dots Mon-Sun, dot lit nếu user log entry ngày đó (week hiện tại)
- [ ] Sign out button → confirm dialog → logout

## Sub-task Order

**Batch 1 — Foundation:**
1. Profile API + hooks (getProfile, updateProfile, uploadAvatar)
2. Streak compute logic (client-side từ last 7 days entries)

**Batch 2 — UI:**
3. **7.1** Profile screen layout
4. **7.2** Avatar edit
5. **7.3** Name edit modal
6. **7.4** Streak indicator component

## Files to Create/Modify

```
src/features/profile/
├── api.ts                         # getProfile, updateProfile, uploadAvatar
├── hooks.ts                       # useProfile, useUpdateProfile, useUploadAvatar
└── components/
    ├── AvatarPicker.tsx
    └── StreakIndicator.tsx

app/(main)/profile.tsx             # Replace placeholder với full UI
```

## Decisions Made

- **Avatar URL cache-bust**: append `?t=${Date.now()}` vào public URL sau upload. RN Image cache aggressive, không có cache-bust thì avatar mới upload không hiển thị (vẫn cache cũ). Trade-off: làm dirty URL trong DB, nhưng đơn giản và work.
- **AvatarPicker với aspect 1:1**: ImagePicker có `allowsEditing: true` + `aspect: [1,1]` → user crop về vuông trước khi upload → consistent với avatar circle UI.
- **7.4 Streak compute client-side**: từ `useStatsRange` của tuần hiện tại (Mon-Sun), KHÔNG dùng `profiles.streak_count` (cần trigger DB). Approach client đủ cho UX, perf OK với 7 entries.
- **Streak weekly thay vì consecutive days**: hiện tại đếm logged days trong tuần (X/7), không phải consecutive streak (3 ngày liên tiếp). Đơn giản hơn UX. Consecutive streak có thể thêm sau (Phase 9).
- **7.5-7.8 defer Phase 9-10**: Notifications cần expo-notifications + permission flow + cron schedule (~1 ngày work). Data export cần gen CSV/JSON + share. Other section cần legal text. Tất cả low priority cho dev MVP — placeholder card hiện status để user thấy kế hoạch.
- **Sign out với confirm dialog**: native Alert với 2 buttons (Cancel + Sign out destructive style). UX an toàn — tránh tap nhầm.

## Issues Encountered

### Issue 1: Avatar upload "RLS policy violation"
- **Symptom**: Upload avatar fail với "new row violates row-level security policy for table objects".
- **Root cause**: Migration 0003 RLS check `auth.uid()::text = storage.filename(name)` — nhưng `storage.filename` trả về full filename CÓ extension (`{userId}.jpg`), không phải UUID raw. Match always FALSE.
- **Fix**: 
  - Migration 0008 đổi check sang folder pattern `(storage.foldername(name))[1] = auth.uid()::text` (consistent với mood-photos).
  - API uploadAvatar đổi path từ `{userId}.jpg` → `{userId}/avatar.{ext}`.
- **Lesson learned**: `storage.filename` vs `storage.foldername` API khác nhau — folder pattern an toàn hơn vì luôn có UUID ở segment [1]. File pattern phải tách extension thủ công.

## Status: ✅ DONE pending user verify

## Started at

2026-05-06
