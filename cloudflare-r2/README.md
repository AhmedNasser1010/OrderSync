# Cloudflare R2 Worker — `ordersync-r2`

Uploads, deletes and serves images for the Order Sync platform (restaurant
icons/covers, homepage hero banners, menu item backgrounds).

Images are stored in the **`zajil`** R2 bucket and served via the bucket's
public URL (`https://pub-fd5c9e71bf0d4aa6bf3ebbfefbed5c55.r2.dev`). The
public URL is stored in Firestore (`branding.icon`, `branding.cover`,
`HeroBanner.imageUrl`, `ItemType.backgrounds`, ...) so the customer and
onboarding apps can render them with `next/image`.

## Endpoints

| Method | Path       | Description                                             |
| ------ | ---------- | ------------------------------------------------------- |
| POST   | `/upload`  | Upload an image. Headers: `Authorization: Bearer <secret>`, `Content-Type: image/*`, `X-Filename`, `X-Folder`. Returns `{ key, url, size, contentType, uploadedAt }`. |
| DELETE | `/delete?key=<key>` | Delete an object. Header: `Authorization: Bearer <secret>`. |
| GET    | `/health`  | Health check.                                           |

Limits: max **15MB**, allowed types **jpg/jpeg/png/webp/gif/avif** (no SVG to
avoid stored-XSS via the public bucket).

## Gallery index

The onboarding app keeps a Firestore index of uploaded objects in the
`r2Images` collection (one doc per object: `key`, `url`, `folder`,
`fileName`, `size`, `contentType`, `createdBy`, `createdAt`) so editors can
list/re-pick images without an R2 ListObjects call and deletions clean up
both R2 and the index. See the `match /r2Images/{imageId}` block in
`firestore.rules`.

## Local development

```bash
npm install         # installs wrangler
npx wrangler dev    # uses .dev.vars for UPLOAD_SECRET
```

`.dev.vars` contains `UPLOAD_SECRET` (not committed). The production value
is stored as the Worker secret `UPLOAD_SECRET` (set via `wrangler secret put`).

## Deploy

```bash
npm run deploy      # wrangler deploy
```

The client apps reference the Worker URL via
`NEXT_PUBLIC_R2_WORKER_URL` (onboarding_app/.env.local) and the upload
secret via `NEXT_PUBLIC_R2_UPLOAD_SECRET`.

## Security notes

- The upload/delete endpoints require the `UPLOAD_SECRET` bearer token.
- ⚠️ The onboarding app sends it as `NEXT_PUBLIC_R2_UPLOAD_SECRET`, which is
  embedded in the client JS bundle. Anyone with the onboarding app's source
  can extract it and upload to the `zajil` bucket (bounded to images ≤15MB).
  For maximum security beyond an internal admin tool, harden the Worker to
  validate a Firebase ID token from the signed-in partner/manager instead.
- The R2 bucket is public-read by design so images render without per-image
  signatures. Do not upload non-public content.