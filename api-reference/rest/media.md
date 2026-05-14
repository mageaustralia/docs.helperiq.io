# Media

Upload attachments and inline images for messages, and serve them back.

| Method | Path | Permission |
| --- | --- | --- |
| `POST` | `/api/v1/media` | authenticated |
| `GET` | `/uploads/{uuid}` | authenticated *or* signed URL |

## Upload

```
POST /api/v1/media
Content-Type: multipart/form-data
```

**Form fields:**

| Field | Type | Notes |
| --- | --- | --- |
| `file` | file | Required. |
| `inline` | bool | `true` for inline images (rendered in `<img>` tags). `false` for downloadable attachments. Defaults to `false`. |

**Response:**

```json
{
  "data": {
    "uuid": "8c3d9e1f-…",
    "filename": "screenshot.png",
    "content_type": "image/png",
    "size": 124680,
    "url": "https://your-host/uploads/8c3d9e1f-…?sig=…&exp=…",
    "inline": true
  }
}
```

The returned `uuid` is what you pass in
[`POST /api/v1/conversations/{cuuid}/messages`](./conversations#send-a-message)'s
`attachments` array. The `url` is a pre-signed URL the agent UI uses
to render images immediately after upload.

## Limits

| Constraint | Default |
| --- | --- |
| Max upload size | 25 MB (configurable in `config.toml` under `upload.max_file_size_mb`) |
| Allowed types | All (filter via your reverse proxy if needed) |
| URL signature TTL | 24 hours from issue |

## Storage backends

The default backend writes to `./uploads/` on the app server. Production
deployments can swap to S3 / R2 / any S3-compatible store via
`config.toml`:

```toml
[upload]
backend = "s3"
s3_bucket = "helperiq-uploads"
s3_region = "ap-southeast-2"
s3_access_key = "…"
s3_secret_key = "…"
s3_url_expiry = "24h"
```

When the backend is S3-compatible, served URLs are pre-signed S3 URLs
rather than going through the app proxy — saves bandwidth.

## Serve

```
GET /uploads/{uuid}?sig=<signature>&exp=<unix_timestamp>
```

Used by the browser to fetch uploads. Three auth paths:

1. **Signed URL** — `sig` + `exp` query params from `POST /api/v1/media`'s
   response. Works even when the user is not logged in (e.g. the recipient
   of an outbound email clicking on an image referenced by CID-fallback URL).
2. **Session cookie** — for authenticated agent UI loads.
3. **API key** — for bot/integration access.

Failure returns `401 AuthError`.

## Inline images in outgoing email

When you send a message containing `<img src="https://host/uploads/...">`
HTML, HelperIQ also embeds the image as a multipart MIME CID part on the
outgoing email — so the recipient sees the image even if your media URLs
later expire or move. This happens automatically; no API call needed.

## Widget media uploads

```
POST /api/v1/widget/media/upload
```

Separate, rate-limited endpoint for anonymous live-chat visitors to
attach screenshots before connecting to an agent. Uses the widget
session auth, not the agent session. Same response shape as
`/api/v1/media`.
