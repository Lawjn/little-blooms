# Phase 5 — Calendar

## Goal

Cho user browse các ngày đã log + chọn ngày khác để xem/edit entry. Gom luôn sub-task 2.2 (date selector ở Home header) — toàn bộ navigation date của app làm 1 chỗ.

## Acceptance Criteria

- [ ] Tap dropdown chevron ở Home header → mở Calendar screen
- [ ] Calendar hiển thị month grid với weekday headers (S M T W T F S)
- [ ] Mỗi day cell có chấm màu mood nếu đã log entry, empty nếu chưa
- [ ] Tap day → quay về Home với date đó pre-selected
- [ ] Home prefill form theo date param thay vì luôn today
- [ ] Swipe / nav button đổi tháng hiển thị ở Calendar header
- [ ] Today button quick-jump về hôm nay

## Sub-task Order

**Batch 1 — Calendar screen UI**
1. **5.1** Calendar grid với weekday headers + month nav header
2. **5.2** Render mood dots từ `useMonthMoodEntries`
3. **5.4** Prev/next month navigation

**Batch 2 — Wire navigation**
4. **5.5** Home accept `?date=` param via `useLocalSearchParams`
5. **5.3** Calendar tap day → router replace `/home?date=...`
6. **5.6** Home header dropdown → router push `/home/calendar`

## Files to Create/Modify

```
app/(main)/home/
├── index.tsx                 # Update: accept date param, fallback today
└── calendar.tsx              # Calendar screen mới

src/features/calendar/        # Mới (optional, có thể đặt inline)
└── components/
    └── CalendarGrid.tsx      # 6-row grid với weekday headers + mood dots
```

## Decisions Made

- **5.1 Layout**: SafeAreaView + Stack-style header với back button + month nav row (prev/cur/next chevron) + grid + footer Today button.
- **5.2 Mood dot**: dùng `MOOD_VISUAL[level].bgColor` để chấm — consistency với Garden cells. Today có border accent, selected có fill primary.
- **5.4 Disable future month nav**: không cho user navigate tháng tương lai (UX bảo vệ — tránh log entry future). Today button quick-jump khi đang xem tháng past.
- **5.5 Reset form on date change**: useEffect listen `activeDate` → reset toàn bộ form state + `hydrated` flag → cho phép prefill mới khi entry data đến. KHÔNG dùng `key` prop trick vì sẽ unmount toàn bộ children (mất React Query cache).
- **5.5 router.replace thay vì push**: từ Calendar tap day → replace history entry, KHÔNG đẩy stack mới. Back từ Home không quay về Calendar (hợp lý — user đã chọn xong).
- **Tabs hide /home/calendar**: thêm `<Tabs.Screen name="home/calendar" options={{ href: null }} />` cùng với `garden/[date]` để cả 2 ẩn khỏi tab bar nhưng vẫn navigate được.

## Issues Encountered

(updating khi có issue)

## Verified Milestones

- **2026-05-06**: User test Phase 5 calendar OK. Phát hiện 2 việc:
  1. Cần rule không cho log future date → đã thêm 5.7 (CalendarGrid disable + Home banner notice + onSave defensive check)
  2. Idea: special icon cho ngày đặc biệt → note vào ADR-009, defer thành 5.8 backlog (Phase 9 polish hoặc on-demand)

## Status: ✅ DONE pending user verify

## Started at

2026-05-06
