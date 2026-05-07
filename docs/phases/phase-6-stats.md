# Phase 6 — Statistics / Insights

## Goal

Cho user xem charts thống kê mood + activity theo tuần/tháng. Visualization giúp user thấy pattern cảm xúc.

## Acceptance Criteria

- [ ] Insights screen header + Weekly/Monthly toggle pill
- [ ] Date range label "May 2 - May 8" (week) hoặc "May 2026" (month) + nav prev/next
- [ ] Mood line chart: x=day, y=mood level (1-5), points highlighted với mood color
- [ ] Pie chart: distribution % mood levels trong period
- [ ] Bar chart: số entries hoặc số tags / ngày (activity heat)
- [ ] Top emotions list: ranked by frequency, hiện %
- [ ] Empty state nếu chưa có data trong period

## Sub-task Order

**Batch 1 — Setup:**
1. Install `react-native-gifted-charts` + dep `react-native-svg` (peer dep)
2. **6.7** `src/features/stats/aggregate.ts` — client-side aggregations từ entries

**Batch 2 — Chart components:**
3. **6.3** `MoodLineChart` component
4. **6.4** `MoodPieChart` component
5. **6.5** `ActivityBarChart` component
6. **6.6** `TopEmotionsList` component

**Batch 3 — Screen:**
7. **6.1** Insights screen layout + toggle
8. **6.2** Date range selector

## Files to Create/Modify

```
src/features/stats/
├── aggregate.ts                     # Client-side aggregations
├── hooks.ts                         # useStatsRange (re-use useMonthMoodEntries hoặc range query)
└── components/
    ├── MoodLineChart.tsx
    ├── MoodPieChart.tsx
    ├── ActivityBarChart.tsx
    └── TopEmotionsList.tsx

app/(main)/stats.tsx                 # Replace placeholder
```

## Decisions Made

- **Client-side aggregations**: dùng useStatsRange (1 query lấy entries trong range) + transform ở client. Tránh phải viết RPC functions trong Supabase. Data nhỏ (<31 entries/month) → perf OK.
- **6.3 Mood line chart**: 1 line (không phải 5 lines theo Figma). Mỗi day chỉ có 1 mood, 5 lines không make sense. Y-axis label dùng emoji 5 mood. Hide data point khi null (ngày chưa log).
- **6.4 Pie donut**: dùng `donut` mode, center hiện count "N days". Legend dạng list bên phải với label + percent.
- **6.5 Bar chart Activity**: count là `tags chọn` (sum của 6 tag arrays), KHÔNG phải số entry. Show 0 cho ngày chưa log. Top label per bar nếu count > 0.
- **6.6 Top emotions thay vì top moods**: Figma show "Sad 29%, Anxious 2%, Angry 11%" — đó là EMOTIONS tags (specific feelings), không phải mood levels. Mood distribution đã có ở pie chart.
- **Range mode**: Weekly = startOfWeek..endOfWeek (Sun-Sat), Monthly = startOfMonth..endOfMonth. Disable nav next khi future (consistent với Phase 5 rule).

## Issues Encountered

### Issue 2: Stats nav prev/next bị stuck — không back được về tuần/tháng hiện tại
- **Symptom**: User click prev → đến tuần trước → click next → expect quay về tuần hiện tại nhưng next button vẫn disabled.
- **Root cause**: `isAtCurrent` check `isAfter(addWeeks(anchor, 1), today)`. Khi user click prev, anchorDate = lastWeek (giữ time component, vd 13:00). `addWeeks(anchor, 1)` = today at 13:00. `today` (scope) = `startOfDay(new Date())` = 00:00. → `isAfter(today_13:00, today_00:00)` = TRUE → next disabled.
- **Fix**: Đổi check sang `isSameWeek(anchor, today, {weekStartsOn:0})` cho weekly và `isSameMonth(anchor, today)` cho monthly. Logic dựa trên TUẦN/THÁNG thực, không phải timestamp.
- **Lesson learned**: khi compare dates, prefer `isSameWeek/Month/Day` từ date-fns thay vì arithmetic + `isAfter` — tránh time component bug.

### Issue 1: "Gradient package was not found" runtime error
- **Symptom**: User reload Expo Go → ERROR `Gradient package was not found. Make sure "react-native-linear-gradient" or "expo-linear-gradient" is installed`. Stats tab không load → Tabs nav warn "No route named 'stats'".
- **Root cause**: `react-native-gifted-charts` (BarChart specifically) cần peer dep gradient — KHÔNG được tự động cài cùng package. `expo install react-native-svg + react-native-gifted-charts` không đủ.
- **Fix**: `npx expo install expo-linear-gradient` (Expo flavor work với managed + dev client).
- **Lesson learned**: khi cài lib third-party, kiểm tra README peer deps. `react-native-gifted-charts` cần: `react-native-svg` (đã cài), `react-native-linear-gradient` HOẶC `expo-linear-gradient`. Project Expo → dùng expo-linear-gradient.

## Status: ✅ DONE pending user verify

## Started at

2026-05-06
