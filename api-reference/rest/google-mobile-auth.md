# Google Mobile Auth

::: warning Stub
This page is a placeholder. Full reference coming soon.
:::

```
POST /api/v1/auth/google-mobile
```

Stateless Google OIDC authentication tuned for the HelperIQ mobile app.
Unlike the browser flow (`/api/v1/oidc/{id}/login`) which sets a session
cookie, this returns an **API key** the mobile app stores in secure
storage and sends as `Authorization: Bearer <key>` on every request.

Rate-limited per IP under the `auth` bucket.

**Body:**

| Field | Type | Required |
| --- | --- | --- |
| `id_token` | string | yes — Google ID token obtained via Google Sign-In SDK |

**Response:**

```json
{
  "data": {
    "user": { "id": 42, "email": "agent@example.com", "first_name": "Bob" },
    "api_key": "lk_…",
    "expires_at": null
  }
}
```

Same agent → multiple devices: each device gets its own API key.
Revocation is per-key from the admin user settings page.
