# Phase 3 — Garden View

## Goal

Hiển thị vườn hoa của tháng hiện tại — mỗi ngày user đã log mood → 1 cây hoa tương ứng (mood level → flower variant) → "mọc" trong vườn 5×6 (~30 cells/tháng).

Đây là **wow moment** của app: user log mood lâu ngày → vào Garden thấy vườn lớn dần.

## Acceptance Criteria

- [ ] Mở Garden tab → thấy date range "01.05 — 31.05" + plant count
- [ ] Render 5×6 grid với flower mọc đúng vị trí theo `entry_date`
- [ ] Mood level 1-5 → 5 flower variants khác nhau (Wilted/Clover/Tulip-red/Tulip-pink/Sunflower)
- [ ] Sky background + decorations (sun, clouds, sheep, bird, house)
- [ ] Tap vào cây → navigate sang Garden info screen với detail của ngày đó
- [ ] Garden info: hiện mood + emotions + note + photos (signed URL từ Storage)
- [ ] Bottom tab navigator (Home/Stats/Garden/Store/Profile)

## Sub-task Order

**Batch 1 — Foundation:**
1. **3.7** `mapMoodToFlower(level)` pure function + flower components
2. **3.6** Flower SVG/image assets (5 variants tạm dùng emoji, swap khi user export Figma)
3. New: `useMonthMoodEntries(yearMonth)` query hook

**Batch 2 — Layout core:**
4. **3.4** Isometric/flat 5×6 grid base (đầu tiên flat, polish isometric ở Phase 9)
5. **3.5** (row, col) ↔ entry_date mapping (date 1 = top-left, etc.)
6. **3.8** Render plants từ mood_entries query
7. **3.1** Garden screen layout với background + grid
8. **3.9** Header: month range + plant count

**Batch 3 — Detail:**
9. **3.11** Tap cây → navigate Garden info `[date].tsx`
10. **3.12** Garden info screen detail (mood + tags + note + photos)

**Batch 4 — Decorations + Tab nav:**
11. **3.2** Sky decorations (sun + clouds, animated drift — tạm static, animate ở Phase 9)
12. **3.3** Foreground (sheep, bird, house) — emoji hoặc SVG
13. **3.10** Top icons: weather theme switcher + music (placeholder, Phase 4 sẽ wire theme)
14. **3.13** Bottom tab navigator (Home/Stats/Garden/Profile — Store ở Phase 8)

## Files to Create/Modify

```
src/features/garden/
├── mapping.ts                # mapMoodToFlower(level) pure function
├── api.ts                    # listMoodEntriesByMonth
├── hooks.ts                  # useMonthMoodEntries
└── components/
    ├── Flower.tsx            # 5 flower variants
    ├── GardenGrid.tsx        # 5×6 grid render plants
    ├── GardenSky.tsx         # Sky + sun + clouds
    └── GardenForeground.tsx  # Hills + sheep + bird + house

app/(main)/garden/
├── index.tsx                 # Garden screen
├── [date].tsx                # Garden info (entry detail)
└── _layout.tsx               # Optional, nếu cần stack

app/(main)/_layout.tsx        # Convert Stack → Tabs (Home/Stats/Garden/Profile)
app/(main)/stats.tsx          # Placeholder cho Phase 6
app/(main)/profile.tsx        # Placeholder cho Phase 7
```

## Decisions Made

- **3.6 Emoji thay SVG**: tạm dùng emoji cho 5 plant species (🌷🌻🌹🌸🍀). Cell có background tint + opacity + scale theo mood để tạo cảm giác "cây cùng loài, sức sống khác nhau theo ngày". Sẽ swap sang SVG/PNG khi user export Figma.
- **Mood visual mapping**: `getMoodVisual(level)` trả `{ bgColor, opacity, scale }`. Mood 5 = nền vàng kim full bloom; mood 1 = nền tím xám opacity 0.6 scale 0.75 (héo).
- **3.4 Flat grid thay isometric**: Phase 3 MVP làm flat 5×6, brown wooden frame + grass green base. Isometric perspective polish ở Phase 9 (Skia/SVG transforms).
- **3.5 Cell→day mapping linear**: cell idx 0 = ngày 1, idx 29 = ngày 30. Tháng 31 ngày → ngày 31 KHÔNG được hiển thị (out of grid). Trade-off: grid cố định, đơn giản. Phase 9 có thể expand thành 6×6 = 36 cells để fit mọi tháng.
- **Bottom Tabs**: Home/Stats/Garden/Profile (4 tabs). Store defer Phase 8. Tab `garden/[date]` ẩn khỏi tab bar bằng `href: null` — vẫn navigate được qua `router.push`.
- **Sign Out di chuyển**: từ Home header (Phase 1 placeholder) → Profile tab (đúng UX). Home giờ chỉ có dropdown date.
- **Decorations static**: sky (sun/clouds) + foreground (sheep/bird/house) chỉ render emoji static. Animate (Reanimated drift) defer Phase 9.
- **Garden info read-only**: Phase 3 chỉ view detail. Edit phải về Home tab (chọn ngày qua calendar Phase 5). Tránh phức tạp routing.
- **Typed routes object form**: `router.push({ pathname: '/garden/[date]', params: { date } })` — proper way cho dynamic segments. String template `/garden/${date}` không pass typed routes check.

## Issues Encountered

### Issue 1: Misunderstanding garden requirement (mid-phase)
- **Symptom**: Implement ban đầu sai concept — mood → 5 species khác nhau (sunflower/tulip-pink/tulip-red/clover/wilted).
- **Correct requirement**: Vườn = 1 species cố định (user chọn, default tulip 🌷). Mỗi ngày cùng species đó nhưng MÀU SẮC + HIỆU ỨNG khác theo mood (background tint, opacity, scale).
- **Fix**: Refactor `mapping.ts`:
  - Thêm `PlantType` (5 options: tulip/sunflower/rose/cherry/clover) + `DEFAULT_PLANT = 'tulip'`
  - Thay `mapMoodToFlower(level): FlowerType` bằng `getMoodVisual(level): { bgColor, opacity, scale }`
  - `Flower` component nhận thêm `plantType` prop, render emoji theo plantType + cell tint theo mood
- **Active plant storage**: hiện hardcode `DEFAULT_PLANT = 'tulip'`. Phase 8 sẽ thêm field `user_inventory.active_plant` qua migration để Store cho phép user mua/đổi.

## Status: ✅ DONE (functional). Visual polish (isometric + SVG flowers) defer Phase 9.

## Verified Milestones

- **2026-05-06**: User chọn defer isometric sang Phase 9 (option C). Phase 3 functional core — render plants từ DB, mood→color/effect, tap navigate Garden info — đã đủ cho phase này. Visual upgrade gom 1 lần ở Phase 9 (isometric + SVG flowers + animations).

## Started at

2026-05-06

---

## Pixel-perfect upgrade + Watering feature (2026-05-30)

### Context
Thầy yêu cầu garden phải match Figma 100%. User chọn **path A**: real SVG assets từ Iconify (Figma dùng Iconify icon sets) + virtual canvas 430×932 scale theo screenWidth + absolute positioning theo Figma coords. Sau khi load xong full garden, user gửi 3 screenshot mới về Garden info detail (single-plant view + watering can).

### What was built

**Files created:**
- `src/features/garden/gardenAssets.ts` — SVG strings (SVG_SUN, SVG_CLOUD, SVG_CLOUD2, SVG_BIRD, SVG_SUNFLOWER, SVG_ROSE, SVG_TULIP, SVG_CLOVER, SVG_CHERRY, SVG_SHEEP, SVG_HOUSE, SVG_TREE, SVG_SNOWMAN, SVG_WATERING_CAN) downloaded từ Iconify API (twemoji/noto/fxemoji/mdi).
- `src/features/garden/weather.ts` — `WeatherTheme` type + `WEATHER_CONFIGS` (sky/hills/sun/clouds/particle/character per theme) + `normalizeTheme()` guard + `WEATHER_OPTIONS` list.
- `src/features/garden/components/IsometricGarden.tsx` — pixel-perfect main garden scene (rhombus plot path, bilinear cell→point, 6×6 = 36 cells, sky LinearGradient, hills, sun/clouds/bird/sheep/house/tree/snowman SVG, snow/rain particles, month nav header).
- `src/features/garden/components/WeatherPicker.tsx` — "Choose your weather" modal với 4 options.
- `src/features/garden/components/SinglePlantScene.tsx` — single-plant scene cho Garden info detail (rhombus tile + plant mọc lên + sheep/house/tree + watering can button + pour animation).
- `supabase/migrations/0012_watering.sql` — `last_watered_date date` + `water_streak integer default 0` columns.

**Files modified:**
- `src/features/garden/mapping.ts` — added `PlantType`, `MOOD_VISUAL` per level (bgColor/opacity/scale), `getMoodVisual()`.
- `src/features/garden/components/Flower.tsx` — use `SvgXml` với `PLANT_SVG` map, scale + opacity theo mood.
- `src/features/inventory/api.ts` — `UserInventory` interface +last_watered_date+water_streak, new `waterPlant(userId, todayStr)` function (1 lần/ngày, streak +1 nếu liên tục, reset về 1 nếu skip).
- `src/features/inventory/hooks.ts` — `useWaterPlant` mutation invalidate inventory query.
- `app/(main)/garden/index.tsx` — sử dụng IsometricGarden + WeatherPicker modal + month nav.
- `app/(main)/garden/[date].tsx` — rewrite: SinglePlantScene hero ở trên + detail cards (mood label + tag sections + note + photos + pulses) bên dưới. Handle `handleWater()` qua mutation + Toast feedback. Back button overlay.

### Decisions
- **Iconify thay Figma export**: User không export được PNG/SVG từ Figma Starter plan. Iconify cung cấp đúng exact icons mà Figma dùng (twemoji, noto, mdi). Download qua API: `https://api.iconify.design/{prefix}/{name}.svg`.
- **Virtual canvas 430×932**: Figma frame width = 430. Scale tất cả positioning bằng `S(v) = v * screenW / 430` — pixel-perfect responsive.
- **Watering = daily streak action**: Mỗi ngày user tap watering can → +1 streak. Skip 1 ngày → reset về 1. Lưu `last_watered_date` chỉ cho phép 1 lần/ngày (UI lock + API guard).
- **Watering UI chỉ hiện khi `isToday`**: Quá khứ không thể water (không hợp lý), tương lai không nên water (chưa tới ngày).
- **Pour animation**: 1.1s droplet emoji 💧💧 translateY + opacity interpolate, callback gọi mutation sau khi animation xong → cảm giác mượt.

### Issues encountered
- **Tôi không thể xem render của chính mình**: Lặp lại pattern phải xin screenshot từ user mỗi lần tinh chỉnh pixel position. User accept vì là môn coursework có thể iterate.
- **TILE_VB viewBox cho rhombus**: rhombus full size = 381.857×227.82 (từ Figma plot path), nhưng cần thêm space dưới cho 3D depth layers (#865A3D, #947151) → viewBox height = TILE_VB + 40.

### Update 2026-05-30 (lần 2) — đổi chức năng bình tưới + Việt hóa pulse

**Theo feedback user:**
1. **Tab Garden** → center FAB pink nổi giữa tab bar (icon sprout), tab bar bo góc + nền xanh nhạt. Thêm `colors.accent`/`colors.tabBar`.
2. **House/tree** dời xuống hill front (y 612/632) — hết "lơ lửng".
3. **Bình tưới đổi concept**: User: "đừng khóa giới hạn bình tưới, thay vào đó mỗi khi tưới cây → 1 câu an ủi/động viên". → Bỏ hoàn toàn lock 1 lần/ngày + streak. Mỗi tap tưới → random 1 câu trong 30 câu chữa lành tiếng Việt (`wateringQuotes.ts`) hiện trong `WateringQuoteModal` (card đẹp + bình tưới + giọt nước).
   - `WateringCanButton` đơn giản hóa: props chỉ còn `onWater` + `style`, luôn enable.
   - `SinglePlantScene` bỏ props alreadyWatered/waterStreak; watering can luôn bấm được.
   - **Dead code**: `waterPlant` (api.ts) + `useWaterPlant` (hooks.ts) + migration 0012 columns giờ không dùng. Giữ lại không xóa (harmless, tránh thêm migration drop).
4. **Việt hóa Quick pulse**: "Quick mood pulse"→"Ghi nhanh cảm xúc", "How are you feeling?"→"Bạn đang cảm thấy thế nào?", "Save pulse"→"Lưu khoảnh khắc", "Pulses"→"Khoảnh khắc", "Or quick pulse"→"Hoặc ghi nhanh", "Pulse logged ✓"→"Đã ghi khoảnh khắc ✓", "Update reflection"→"Cập nhật nhật ký", v.v.

### Status: 🟡 IN PROGRESS — pending user verify watering quote flow + tab FAB + pulse Việt hóa + gửi screenshot fine-tuning.
