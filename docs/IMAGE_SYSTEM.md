# Image Upload & Loading System

> Tham khảo cho việc cải thiện hệ thống ảnh trong Little Blooms. Dùng để tra cứu khi muốn optimize hoặc debug.

## 1. Tổng quan

App có 2 loại ảnh:
- **Mood photos** (private) — ảnh user đính kèm vào daily entry, max 3/entry. Bucket `mood-photos`.
- **Avatars** (public read) — ảnh đại diện user. Bucket `avatars`.

Storage backend: **Supabase Storage** (S3-compatible). Quan hệ với DB:
- `mood_entries.photo_urls text[]` — chứa **paths** (không phải URLs).
- `profiles.avatar_url text` — chứa **public URL** (cache-busted với `?t=timestamp`).

Lý do tách paths vs URLs:
- Mood-photos private → URL có signature expire 1h → lưu URL → expire khi xem lại.
- Avatars public → URL ổn định → lưu URL trực tiếp OK.

## 2. Upload Flow

```
User picks photo (ImagePicker)
  ↓
asset { uri, base64, mimeType }
  ↓
Local state (PhotoSlot)  ────┐
                              │ Khi user tap "Done"/"Update"
                              ↓
                         Upload Storage (parallel Promise.all)
                              ↓
                         Get path: {userId}/{date}/{idx}.jpg
                              ↓
                         Save paths vào mood_entries.photo_urls
```

### Code locations

| File | Trách nhiệm |
|---|---|
| `src/components/PhotoPicker.tsx` | UI 3 slots picker + ImagePicker integration |
| `src/components/AvatarPicker.tsx` | UI single picker cho avatar |
| `src/features/mood/upload.ts` | `uploadMoodPhoto`, `getMoodPhotoSignedUrls`, `deleteMoodPhoto` |
| `src/features/profile/api.ts` | `uploadAvatar` (single-photo flow) |
| `app/(main)/home/index.tsx` (lines ~100-120) | Orchestrate upload + save flow |

### Key technique: base64-arraybuffer

React Native không có Blob/FormData chuẩn cho file upload. Pattern dùng:

```typescript
// 1. ImagePicker với base64=true
const result = await ImagePicker.launchImageLibraryAsync({
  base64: true,
  quality: 0.5,  // 0-1, tradeoff size vs quality
});
const asset = result.assets[0];

// 2. Convert base64 string → ArrayBuffer
import { decode } from 'base64-arraybuffer';
const arrayBuffer = decode(asset.base64);

// 3. Upload to Supabase Storage
await supabase.storage
  .from('mood-photos')
  .upload(path, arrayBuffer, {
    contentType: asset.mimeType,
    upsert: true,  // ghi đè nếu path đã tồn tại
  });
```

### Path conventions (RLS-friendly)

| Bucket | Path pattern | RLS check |
|---|---|---|
| `mood-photos` | `{userId}/{entryDate}/{idx}.{ext}` | `(storage.foldername(name))[1] = auth.uid()::text` |
| `avatars` | `{userId}/avatar.{ext}` | `(storage.foldername(name))[1] = auth.uid()::text` |

⚠ **QUAN TRỌNG**: phải dùng folder pattern, KHÔNG dùng filename pattern.
- `storage.filename({userId}.jpg)` trả `{userId}.jpg` (có ext) → không match `auth.uid()`.
- `storage.foldername({userId}/avatar.jpg)[1]` trả `{userId}` (raw UUID) → match OK.

## 3. Download / Display Flow

### Mood photos (private bucket)

```
DB: photo_urls = ['{userId}/2026-05-07/0.jpg', ...]
  ↓
Khi cần hiển thị, gọi:
  getMoodPhotoSignedUrls(paths)
  → supabase.storage.from('mood-photos').createSignedUrls(paths, 3600)
  → trả ['https://...?token=xxx', ...] expire 1h
  ↓
Pass URL vào <Image source={{uri}}/>
```

### Avatars (public bucket)

```
DB: avatar_url = 'https://....supabase.co/storage/v1/object/public/avatars/.../avatar.jpg?t=1715...'
  ↓
Pass URL trực tiếp vào <Image source={{uri}}/>
```

Cache bust qua `?t=timestamp` query param khi update — vì expo-image cache aggressive, không invalidate khi URL không đổi.

## 4. Performance Optimizations

### Đã implement

1. **expo-image thay React Native Image** (`@/lib`):
   - `cachePolicy="memory-disk"` — cache cả RAM + disk
   - `transition={150-200}` — fade-in smooth
   - `contentFit="cover"` — explicit fit mode
   - Lần xem ảnh thứ 2+ instant (no network)

2. **Parallel upload** (`home/index.tsx`):
   - 3 ảnh upload đồng thời qua `Promise.all` thay vì sequential `for` loop
   - Cắt thời gian save ~3x cho 3 ảnh

3. **Image quality 0.5** (`PhotoPicker.tsx`):
   - ImagePicker quality 0.7 → 0.5
   - Giảm size ~30-40%, mắt thường khó phân biệt cho journal photo

4. **Batch signed URLs** (`gallery/api.ts`):
   - 1 call `createSignedUrls(paths, 3600)` cho N paths
   - Thay vì N calls riêng → giảm latency đáng kể

5. **React Query staleTime** (`gallery/hooks.ts`):
   - 5 phút stale → tránh re-generate signed URLs mỗi lần screen focus

### Có thể cải thiện thêm

1. **Server-side image resize** (chưa làm):
   - Hiện upload ảnh full size → bandwidth + storage tốn
   - Option: dùng Supabase Image Transformations:
     ```
     supabase.storage.from('mood-photos').getPublicUrl(path, {
       transform: { width: 400, height: 400, resize: 'cover' }
     })
     ```
   - Cần Supabase Pro tier ($25/tháng) để dùng transformations
   - Alternative: dùng `expo-image-manipulator` resize ở client TRƯỚC khi upload

2. **Thumbnail vs full size** (chưa làm):
   - Gallery grid render full-size ảnh (lãng phí bandwidth)
   - Option: upload 2 phiên bản — `thumb_{idx}.jpg` (200px) + `full_{idx}.jpg` (1080px)
   - Gallery dùng thumb, Garden info dùng full
   - Trade-off: gấp đôi storage

3. **WebP/AVIF format** (chưa làm):
   - JPEG cũ. WebP nhỏ hơn ~25-35% ở same quality.
   - `expo-image-manipulator` có thể convert
   - Cần test compatibility iOS old versions

4. **Blurhash placeholder** (chưa làm):
   - Khi ảnh chưa load, hiện gradient blur dạng hình ảnh thay vì placeholder trống
   - expo-image support `placeholder={blurhash: '...'}`
   - Cần generate blurhash khi upload (lib `blurhash` hoặc backend tính)

5. **Lazy loading + virtualization** (chưa cần):
   - Hiện gallery limit 100 photos → render hết. OK với <100.
   - Nếu user có 1000+ ảnh → cần FlatList với getItemLayout + windowSize tuning

6. **Progressive JPEG** (chưa làm):
   - Ảnh load dần từ blur → sharp thay vì top-down
   - Phải encode khi upload (server-side hoặc lib)

7. **CDN edge cache** (Supabase auto):
   - Supabase Storage auto cache qua CDN edges
   - Public bucket cache rất tốt
   - Private bucket signed URL → cache theo signature, vẫn OK

8. **Background upload** (chưa làm):
   - Hiện user phải đợi upload xong mới close form
   - Option: optimistic save + upload trong background queue
   - Phức tạp hơn — cần handle retry, conflict resolution

## 5. Storage RLS Policies (recap)

Tất cả ở migration `0003_storage_policies.sql` + `0008_avatar_rls_fix.sql`.

```sql
-- mood-photos: 4 policies (select/insert/update/delete) — user chỉ access folder của mình
create policy "mood-photos: users read own"
  on storage.objects for select
  using (bucket_id = 'mood-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- ... (insert/update/delete tương tự)

-- avatars: public read, write/update/delete chỉ owner
create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars: users upload own"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
```

⚠ **Bucket cần được tạo qua Dashboard UI trước** (không tạo qua SQL được vì permission). Migration chỉ tạo policies.

## 6. Debug Image Issues

### "Bucket not found" khi upload
→ Bucket chưa tồn tại trong Storage. Vào Dashboard → Storage → New bucket.

### "RLS policy violation" khi upload
→ Path không match folder pattern. Verify `storage.foldername(name)[1] = auth.uid()`. Console log `userId` + `path` để check.

### Ảnh hiển thị không lên
→ Signed URL expire (>1h). Refresh query để re-generate. Hoặc tăng expire time `createSignedUrls(paths, 86400)` (24h).

### Avatar update không thấy đổi
→ expo-image cache. Cần cache-bust `?t=${Date.now()}` trong URL khi update.

### Upload chậm
→ Check: parallel hay sequential? Image quality? Network? Tunnel mode chậm hơn LAN.

### Ảnh quá lớn → upload timeout
→ Quality giảm xuống 0.3-0.4. Hoặc resize trước với expo-image-manipulator.

## 7. External References

### Supabase
- [Storage Quickstart](https://supabase.com/docs/guides/storage)
- [RLS Policies cho Storage](https://supabase.com/docs/guides/storage/security/access-control)
- [Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations) (Pro+)
- [Signed URLs API](https://supabase.com/docs/reference/javascript/storage-from-createsignedurls)

### Expo
- [expo-image docs](https://docs.expo.dev/versions/latest/sdk/image/)
- [expo-image-picker docs](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [expo-image-manipulator](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/) — resize/crop ở client
- [expo-file-system](https://docs.expo.dev/versions/latest/sdk/filesystem/)

### Image format & compression
- [WebP vs JPEG comparison](https://developers.google.com/speed/webp/docs/compression)
- [Blurhash explained](https://blurha.sh/)
- [Progressive JPEG explained](https://blog.codinghorror.com/progressive-image-rendering/)

### Performance
- [React Native Image Performance](https://reactnative.dev/docs/image#performance)
- [Web.dev image optimization](https://web.dev/learn/images) — concepts apply to mobile
- [expo-image perf benchmarks](https://github.com/expo/expo/tree/main/packages/expo-image)

### Tools
- [Squoosh](https://squoosh.app/) — visual compare image formats/quality
- [TinyPNG](https://tinypng.com/) — auto compress (concept áp dụng được nếu xây pipeline)

## 8. Roadmap Image Improvements (priority)

| # | Feature | Effort | Impact |
|---|---|---|---|
| 1 | Resize ở client trước upload (expo-image-manipulator) | 2h | Cao — giảm bandwidth + storage |
| 2 | Thumbnail vs full size separate | 4h | Trung — gallery load nhanh hơn nhiều |
| 3 | Blurhash placeholder | 3h | Thấp — visual polish |
| 4 | WebP conversion | 2h | Trung — giảm size 25-35% |
| 5 | Background upload queue | 1 ngày | Trung — UX tốt hơn |
| 6 | Supabase Image Transformations | 30 phút (cần Pro $25/m) | Cao — server-side resize on-demand |

Khi user feedback "gallery load chậm khi nhiều ảnh" → ưu tiên #2. Khi storage hit limit → ưu tiên #1+#4.
