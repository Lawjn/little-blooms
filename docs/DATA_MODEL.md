# Data Model

Supabase Postgres schema cho Little Blooms. RLS bật trên mọi table.

## Tables

### `profiles`
Extend `auth.users`. Tạo qua trigger khi user signup.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK FK → auth.users(id)` | Same as auth user id |
| `name` | `text NOT NULL` | Display name |
| `avatar_url` | `text NULL` | Supabase Storage path |
| `streak_count` | `int DEFAULT 0` | Consecutive days logged |
| `last_log_date` | `date NULL` | Last entry date (cho streak calc) |
| `created_at` | `timestamptz DEFAULT now()` | |
| `updated_at` | `timestamptz DEFAULT now()` | |

### `mood_entries`
1 entry per user per day. Upsert key = (user_id, entry_date).

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK DEFAULT gen_random_uuid()` | |
| `user_id` | `uuid FK → profiles(id) NOT NULL` | |
| `entry_date` | `date NOT NULL` | |
| `mood_level` | `smallint NOT NULL CHECK (1-5)` | 1=Very Bad, 5=Very Good |
| `emotions` | `text[] DEFAULT '{}'` | tags chọn từ EmotionGrid |
| `hobbies` | `text[] DEFAULT '{}'` | |
| `meals` | `text[] DEFAULT '{}'` | |
| `self_care` | `text[] DEFAULT '{}'` | |
| `weather` | `text NULL` | snowy / cloudy / rainy / sunny |
| `other_tags` | `text[] DEFAULT '{}'` | |
| `note` | `text NULL` | Free-form text |
| `photo_urls` | `text[] DEFAULT '{}'` | Max 3, paths trong `mood-photos` bucket |
| `created_at` | `timestamptz DEFAULT now()` | |
| `updated_at` | `timestamptz DEFAULT now()` | |

**Constraint**: `UNIQUE(user_id, entry_date)`

### `user_inventory`
1 row per user. Tracks seeds + owned themes.

| Column | Type | Notes |
|---|---|---|
| `user_id` | `uuid PK FK → profiles(id)` | |
| `seeds_balance` | `int DEFAULT 0 NOT NULL` | Currency |
| `owned_themes` | `text[] DEFAULT '{default}'` | ['default', 'snowy', 'cloudy', 'rainy'] |
| `active_theme` | `text DEFAULT 'default' NOT NULL` | |
| `updated_at` | `timestamptz DEFAULT now()` | |

### `store_items`
Catalog do admin seed. KHÔNG có RLS user policy (read-only public).

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK DEFAULT gen_random_uuid()` | |
| `type` | `text NOT NULL` | 'seed_pack' / 'theme' / 'set' |
| `name` | `text NOT NULL` | Display name |
| `description` | `text NULL` | |
| `price_vnd` | `int NOT NULL` | Hiển thị UI |
| `product_id_ios` | `text NULL` | App Store Connect product ID |
| `product_id_android` | `text NULL` | Play Console product ID |
| `metadata` | `jsonb DEFAULT '{}'` | `{ seeds_count: 100 }` cho seed_pack, `{ theme_key: 'snowy' }` cho theme |
| `is_active` | `bool DEFAULT true` | Hide khi sản phẩm retired |
| `display_order` | `int DEFAULT 0` | Sort UI |

### `purchases`
Audit log mọi giao dịch IAP.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK DEFAULT gen_random_uuid()` | |
| `user_id` | `uuid FK → profiles(id) NOT NULL` | |
| `store_item_id` | `uuid FK → store_items(id)` | |
| `platform` | `text NOT NULL` | 'ios' / 'android' |
| `receipt` | `text NOT NULL` | Apple/Google receipt for verification |
| `transaction_id` | `text NOT NULL` | Platform tx id (unique) |
| `amount_vnd` | `int NOT NULL` | |
| `status` | `text NOT NULL` | 'pending' / 'completed' / 'refunded' / 'failed' |
| `created_at` | `timestamptz DEFAULT now()` | |
| `completed_at` | `timestamptz NULL` | |

**Constraint**: `UNIQUE(transaction_id)` để chống replay.

## Storage Buckets

### `mood-photos`
- Path format: `{user_id}/{entry_date}/{idx}.jpg`
- Policy: user chỉ access `{user_id}/*` của chính mình.

### `avatars`
- Path: `{user_id}.jpg`
- Public read (avatar nhỏ, OK).

## RLS Policies

Tất cả tables (trừ `store_items` read-only) áp dụng pattern:

```sql
-- SELECT
USING (auth.uid() = user_id)

-- INSERT/UPDATE
WITH CHECK (auth.uid() = user_id)
```

`store_items` có policy SELECT public (mọi authenticated user đọc được).

## Mood → Flower Mapping (App Code, Pure Function)

Không lưu DB, tính tại runtime trong `src/features/garden/mapping.ts`:

```typescript
export function mapMoodToFlower(level: 1|2|3|4|5): FlowerType {
  switch(level) {
    case 5: return 'sunflower';
    case 4: return 'tulip-pink';
    case 3: return 'tulip-red';
    case 2: return 'clover';
    case 1: return 'wilted';
  }
}
```

## Streak Calculation

Trigger tự update khi insert mood_entry:

```sql
-- Pseudo-code
IF entry_date = profiles.last_log_date + INTERVAL '1 day' THEN
  streak_count += 1
ELSIF entry_date = profiles.last_log_date THEN
  -- same day update, no change
ELSE
  streak_count = 1  -- streak broken, reset
END IF
last_log_date = entry_date
```

Implement ở Phase 7 (cần streak để hiện ở Profile).

## Indexes

```sql
CREATE INDEX idx_mood_entries_user_date ON mood_entries(user_id, entry_date DESC);
CREATE INDEX idx_purchases_user ON purchases(user_id, created_at DESC);
CREATE INDEX idx_store_items_active ON store_items(is_active, display_order) WHERE is_active = true;
```

## Migration Files

`supabase/migrations/` (numbered):
- `0001_initial.sql` — tables + RLS + indexes (Phase 0.7)
- `0002_streak_trigger.sql` — streak update trigger (Phase 7)
- `0003_seed_store.sql` — seed store_items catalog (Phase 8)
