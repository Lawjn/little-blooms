# Quick Wins #2 — Photo Gallery + Image Speed

## Goal

User-requested:
1. **Photo gallery** giống Locket — feed grid xem lại tất cả ảnh đã log + tap → entry detail.
2. **Image load speed** — ảnh load nhanh hơn ở Garden info + Avatar.
3. **Roll Call** (Locket feature) — defer thành ADR-010 backlog.

## Acceptance Criteria

- [x] Gallery screen với grid 3 cột, ảnh + date overlay + mood dot
- [x] Tap ảnh → navigate sang Garden info của ngày đó
- [x] Empty state nếu chưa có ảnh
- [x] Profile có "My Photos" link → mở Gallery
- [x] Image load qua expo-image (caching mạnh, transition smooth)

## Files Created/Modified

```
src/features/gallery/
├── api.ts                  # listAllPhotos: query + flatten + signed URLs batch
└── hooks.ts                # useAllPhotos (5 phút staleTime cho signed URL cache)

app/(main)/gallery.tsx      # New — grid screen
app/(main)/_layout.tsx      # Hide gallery khỏi tabs
app/(main)/profile.tsx      # Add "My Photos" link card

src/components/PhotoPicker.tsx              # Image → expo-image
src/features/profile/components/AvatarPicker.tsx  # Image → expo-image
app/(main)/garden/[date].tsx                # Image → expo-image
```

## Decisions Made

- **expo-image thay React Native Image**: drop-in API tương đồng nhưng có:
  - `cachePolicy="memory-disk"` — cache cả memory + disk, lần load thứ 2+ instant
  - `transition={150-200}` — fade-in smooth thay vì pop appearance
  - `contentFit="cover"` — explicit, tránh confusion với resizeMode
  - Better blurhash/placeholder support (chưa dùng nhưng available)
- **Gallery limit 100 photos**: tránh load quá nhiều signed URLs cùng lúc. Pagination thêm sau nếu user có nhiều entries.
- **Signed URL batch**: 1 call `createSignedUrls(paths, 3600)` cho tất cả paths thay vì N calls. Latency giảm đáng kể.
- **Gallery query staleTime 5 phút**: tránh re-fetch (= regenerate signed URLs) mỗi lần screen focus. URLs expire 1 giờ nên 5 phút stale OK.
- **Mood dot trên tile**: visual nhanh thấy mood của ngày chụp ảnh. Dùng `MOOD_VISUAL.bgColor` consistency.
- **Date overlay bottom**: format "MMM d" — đủ context, không cluttered.
- **Tap → Garden info**: reuse existing screen thay vì làm lightbox riêng. Đỡ code, user thấy full context.
- **Roll Call defer**: ADR-010 ghi rõ implementation plan, ~1 ngày work. User chọn timing (sau khi verify gallery hoặc gộp Phase 9).

## Issues Encountered

(updating khi có issue)

## Status: ✅ DONE pending user verify
