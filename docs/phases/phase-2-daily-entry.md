# Phase 2 — Daily Mood Entry

## Goal

User log mood + tags + note + photos cho 1 ngày → lưu Supabase. Reload mở lại entry → prefill. Đây là core feature của app.

## Acceptance Criteria

- [ ] Mở Home thấy header date "Today, ..."
- [ ] Pick mood (5 emoji) — single select
- [ ] Multi-select tags ở 6 sections (Emotions/Hobbies/Meals/Self-Care/Weather/Other)
- [ ] Type note text
- [ ] Pick & upload tối đa 3 photos
- [ ] Tap Done → entry lưu vào Supabase
- [ ] Reload app → mở lại Home → form prefill với data đã lưu
- [ ] Database `mood_entries` row có user_id = auth.uid và đúng entry_date

## Sub-task Order (logic dependency)

**Batch 1 — Pure UI components (no Supabase)**
1. **2.0** `src/features/mood/data.ts` — constants: MOOD_OPTIONS, EMOTIONS, HOBBIES, MEALS, SELF_CARE, WEATHER, OTHER_TAGS
2. **2.3** `MoodPicker` component (5 emoji single-select)
3. **2.4** `TagGrid` reusable multi-select (pastel bubbles, wrap)
4. **2.1** Home screen layout: header + scroll body với 6 sections + note + photos slot + Done button

**Batch 2 — Wire Supabase**
5. **2.16** `src/features/mood/api.ts` + `hooks.ts`: useMoodEntry(date), useSaveMoodEntry (upsert)
6. **2.14** Done button gọi mutation
7. **2.15** Load existing entry → prefill form

**Batch 3 — Photos**
8. **2.12** Install expo-image-picker, build PhotoPicker (3 slots, preview, remove)
9. **2.13** Upload Storage bucket migration + upload trong save flow

**Batch 4 — Date navigation**
10. **2.2** Date selector dropdown — chọn ngày khác để xem/edit entry past

## Files to Create/Modify

```
src/features/mood/
├── data.ts                    # Constants (mood + tag options)
├── api.ts                     # Supabase calls (getEntry, upsertEntry, uploadPhoto)
├── hooks.ts                   # useMoodEntry, useSaveMoodEntry
└── types.ts                   # MoodEntry, MoodFormValues

src/components/
├── MoodPicker.tsx             # 5 emoji bubbles (single-select)
├── TagGrid.tsx                # Multi-select bubble grid
├── SectionCard.tsx            # Wrapper cream card với title (reuse cho mọi section)
├── DateSelector.tsx           # Header date picker (Phase 2.2)
└── PhotoPicker.tsx            # 3-slot photo picker (Phase 2.12)

app/(main)/home/index.tsx      # Replace placeholder với full mood entry form

supabase/migrations/
└── 0002_storage.sql           # Bucket mood-photos + RLS policies
```

## Decisions Made

- **2.0 Tag values lowercase English**: lưu DB là `'happy'`, `'sad'` etc (stable, không đổi khi rename label hoặc thêm i18n). `label` chỉ display.
- **2.0 TAG_PALETTE 10 colors**: tag bubbles xoay vòng qua 10 pastel colors theo index. Không random để mỗi tag luôn cùng màu.
- **2.4 TagGrid multi-select**: dùng cho cả 6 sections (Emotions/Hobbies/Meals/Self-Care/Weather/Other). Weather hiện multi-select → cần migrate DB `weather text` → `weather text[]` (sẽ làm ở 0002 cùng Storage).
- **2.1 Header layout**: tạm hardcode `format(new Date(), 'EEEE, MMMM d')`. Date picker dropdown defer (sub 2.2). Sign-out button đặt góc trái header để test auth flow nhanh — sẽ chuyển sang Profile tab khi Phase 7.
- **2.14 Validation**: chỉ required `mood_level`. 6 tag groups + note + photos đều optional.
- **Local state với useState**: không dùng react-hook-form vì form không có validation phức tạp (chỉ check mood !== null). 8 useState đơn giản hơn.
- **2.15 Hydrate pattern**: dùng `hydrated` flag + useEffect để prefill 1 lần duy nhất khi entry data đến lần đầu. KHÔNG dùng `defaultValues` vì entry data load async sau mount. Tránh re-prefill khi user đang edit (sẽ ghi đè input của họ).
- **2.14 Button label dynamic**: "Done" nếu chưa có entry, "Update" nếu đã có. Visual cue cho user biết là tạo mới hay update.
- **2.16 onConflict 'user_id,entry_date'**: upsert dựa trên unique constraint trong migration 0001. Lần đầu insert, lần sau update.
- **2.16 Query invalidation**: sau save, invalidate `['mood']` (bao gồm entry today + month aggregation cho Phase 3 garden + Phase 6 stats). Đảm bảo các view khác refetch khi user save xong.
- **note**: trim + nullable. Empty string → null trong DB (consistency với schema).
- **2.12 PhotoPicker**: 3 slot fixed (theo Figma "up to 3 photos"). Slot null = empty. Slot có data = `{ uri, pendingBase64?, pendingMime?, path? }`.
- **2.13 Base64 upload approach**: pass `base64: true` vào `ImagePicker.launchImageLibraryAsync` → asset có sẵn base64 → decode bằng `base64-arraybuffer` → upload Uint8Array. Tránh phải `FileSystem.readAsStringAsync` riêng.
- **2.13 Path = `{userId}/{date}/{index}.jpg`**: storage RLS policy check folder name [1] = auth.uid(). Index 0/1/2 cho 3 slots — upsert OK nếu user replace ảnh cũ.
- **2.13 Signed URL**: bucket private nên display dùng `createSignedUrls(paths, 3600)`. URL expire 1 giờ — đủ cho session view, không cần cache.
- **2.13 Save flow order**: upload tất cả photos pending TRƯỚC, get paths xong rồi mới upsert mood_entry với photo_urls. Nếu upload fail → throw → save abort, user thấy error Alert. Tradeoff: nếu network chậm save lâu, nhưng đảm bảo consistency.
- **Slot có path nhưng không pendingBase64**: là ảnh đã có trong DB (load từ entry). Không upload lại, chỉ giữ path để write vào photo_urls.
- **Slot null**: user removed ảnh đó. KHÔNG xóa file storage — sẽ orphan. TODO Phase 9 cleanup: storage GC khi update entry.

## Issues Encountered

### Issue 1: "Bucket not found" khi save entry có ảnh
- **Symptom**: User tap Done → "Lỗi lưu entry: Bucket not found"
- **Root cause**: Migration 0002 phần `insert into storage.buckets` không apply hoàn toàn (hoặc chỉ insert column `weather` thành công). Có thể do Supabase storage schema yêu cầu admin role mà SQL Editor không có đủ quyền cho phần này, hoặc syntax conflict.
- **Fix**: Tạo 2 buckets thủ công qua Dashboard UI (Storage → New bucket → `mood-photos` private + `avatars` public), sau đó chạy `0003_storage_policies.sql` để add 8 RLS policies.
- **Lesson learned**: Tách bucket creation ra Dashboard UI thay vì SQL — đáng tin hơn. Migration SQL chỉ chứa policies + schema changes thuần.

### Issue 2: User chạy 0003 trước 0002 (skip 0002)
- **Symptom**: User report đã chạy 0003 nhưng chưa chạy 0002. Nếu giờ chạy 0002 sẽ conflict policies (cùng tên).
- **Fix**: Tạo `0004_finish_phase2.sql` chứa CHỈ phần weather conversion + bucket creation từ 0002 (skip policies vì 0003 đã có). Idempotent qua DO block check column type + ON CONFLICT cho buckets.
- **Lesson learned**: Migration nên đánh số đúng thứ tự VÀ idempotent ngay từ đầu — DO block check schema state, ON CONFLICT cho upsert. User có thể chạy sai thứ tự mà không hỏng.

## Verified Milestones

- **2026-05-06 (1)**: User test thành công save + prefill end-to-end. Pick mood + tags + note → Done → DB upsert OK. Force quit app → reopen → form prefill đúng.
- **2026-05-06 (2)**: User test thành công save + load ảnh sau khi apply 0004 (weather text[] + buckets). Photo upload bucket `mood-photos`, signed URL prefill OK. Phase 2 core flow hoàn toàn working.

## Migrations to Apply

User cần apply trước khi wire Supabase save (sub 2.16):
- `supabase/migrations/0002_storage_and_weather.sql` — đổi `weather text → text[]` + tạo 2 buckets `mood-photos` (private) và `avatars` (public read) + 8 RLS policies cho storage

## Status: ✅ DONE (core), 2.2 deferred to Phase 5 (Calendar)

## Started at

2026-05-06

## Completed at

2026-05-06
