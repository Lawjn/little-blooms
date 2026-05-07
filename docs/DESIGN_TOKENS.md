# Design Tokens

Single source of truth cho màu, spacing, typography. Code thực tế ở [src/lib/theme.ts](../src/lib/theme.ts).

> Sẽ refine khi load thêm screens từ Figma. Hiện rút từ 5 screens chính: Start, Home, Garden, Login, Statistics-Weekly.

## Colors

### Brand
- `primary` `#7CB342` — green button, accent (Done button, links)
- `primaryDark` `#558B2F` — pressed state
- `primaryLight` `#AED581` — hover/selected light

### Backgrounds
- `cream` `#FFF8E7` — card background ở Home (sections)
- `greenLight` `#E8F5E8` — secondary card
- `sky` `#A8DADC` — Garden background
- `white` `#FFFFFF` — default screen bg

### Mood Palette (5 levels)
Mỗi mood có 2 tone: `main` (saturated cho mood picker) + `light` (pastel cho EmotionGrid bubbles).

| Level | Label | Main | Light |
|---|---|---|---|
| 5 | Very Good | `#7CB342` | `#C5E1A5` |
| 4 | Good | `#FFEB3B` | `#FFF59D` |
| 3 | Neutral | `#FFC107` | `#FFE082` |
| 2 | Bad | `#FF7043` | `#FFAB91` |
| 1 | Very Bad | `#9575CD` | `#D1C4E9` |

### Text
- `text.primary` `#212121` — body text
- `text.secondary` `#757575` — caption, helper
- `text.inverse` `#FFFFFF` — on primary buttons

### Status
- `error` `#E53935`
- `success` `#43A047`
- `warning` `#FB8C00`
- `border` `#E0E0E0`

## Typography

Font: **Nunito** (rounded, vui tươi, free Google Font).

- `regular` `Nunito_400Regular`
- `semibold` `Nunito_600SemiBold`
- `bold` `Nunito_700Bold`
- `extrabold` `Nunito_800ExtraBold` — title chính

Sizes:
- `xs` 12 — caption, badges
- `sm` 14 — helper text
- `md` 16 — body
- `lg` 20 — section title
- `xl` 24 — screen title
- `xxl` 32 — display
- `display` 40 — hero (Start screen, Welcome)

## Spacing (4-base)

- `xs` 4
- `sm` 8
- `md` 16
- `lg` 24
- `xl` 32
- `xxl` 48

## Border Radius

- `sm` 8 — small chips
- `md` 12 — input fields
- `lg` 16 — cards
- `xl` 24 — large cards (Home sections)
- `pill` 32 — buttons (Done button), pill toggles
- `full` 9999 — fully rounded (avatars)

## Shadows

3 levels: `sm`, `md`, `lg`. Cross-platform (shadowOffset/Opacity/Radius cho iOS, elevation cho Android).

## Usage Rule

```typescript
// ✅ Đúng
import { colors, spacing, typography } from '@/lib/theme';
const styles = StyleSheet.create({
  container: { padding: spacing.md, backgroundColor: colors.cream },
  title: { fontSize: typography.sizes.lg, color: colors.primary },
});

// ❌ Sai — hardcode
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#FFF8E7' },
});
```

## TODO (refine sau)

- [ ] Animations timing/easing
- [ ] Z-index layers
- [ ] Breakpoints (nếu support tablet)
- [ ] Thêm Snowy/Cloudy/Rainy theme tokens cho Garden (Phase 4)
