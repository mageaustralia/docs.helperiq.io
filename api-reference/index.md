# API Reference

HelperIQ exposes two APIs:

- **REST** — JSON over HTTP, session-cookie or API-key auth.
- **WebSocket** — real-time message stream for the agent UI (new messages,
  typing indicators, presence, notifications).

## Base URL

In a self-hosted deployment the API is served from the same origin as the UI:

```
https://your-helperiq-host
```

The default port (Docker) is `9000`.

## Authentication

REST endpoints accept either of:

- **Session cookie** — set by `POST /api/v1/auth/login`. Used by the
  in-browser agent UI.
- **API key** — `Authorization: Bearer <api_key>` header. Provisioned per
  user from the admin UI. Used by the mobile app and external integrations.

The WebSocket endpoint (`/ws`) requires a session cookie. The widget
WebSocket (`/widget/ws`) is rate-limited and used by anonymous chat
visitors.

## Response envelope

All REST responses are wrapped in an envelope:

```json
{
  "data": <payload>
}
```

On error:

```json
{
  "data": {
    "message": "Human-readable error description",
    "type": "InputError"
  }
}
```

The HTTP status code matches the error type:

| `type` | Status |
| --- | --- |
| `InputError` | 400 |
| `AuthError` | 401 |
| `PermissionError` | 403 |
| `NotFoundError` | 404 |
| `GeneralError` | 500 |

## Pagination

List endpoints accept `page` and `page_size` query parameters. Responses
include `total` and `total_pages` alongside `data`:

```json
{
  "data": {
    "results": [...],
    "total": 1234,
    "total_pages": 25,
    "page": 1,
    "page_size": 50
  }
}
```

## Rate limiting

- `/api/v1/auth/*` — limited per IP, per minute.
- `/widget/ws` — limited per IP, per minute.
- Other endpoints — no application-level limit; rely on your reverse proxy.

A rate-limited response returns `429 Too Many Requests`.

## Endpoint catalogue (HelperIQ additions over upstream)

These endpoints were added by Mage Australia and are not present in
upstream LibreDesk:

- [**WebSocket** (`/ws`)](./websocket) — real-time message stream,
  subscription, typing, presence.
- [**RAG / Knowledge base**](./rest/rag) — manage knowledge sources,
  trigger sync, semantic search, generate AI reply.
- [**Followers**](./rest/followers) — add/remove agents as followers on
  a conversation.
- [**AI Settings**](./rest/ai-settings) — global default prompt + per-inbox
  provider/prompt overrides.
- [**Ecommerce**](./rest/ecommerce) — Maho/Magento 1 connection settings
  and live customer/order lookup.
- [**PCI scrubbing**](./rest/pci) — settings for automatic card-data
  detection and redaction.
- [**Forward**](./rest/forward) — forward an individual conversation
  message to an external recipient as a new email thread.
- [**Google Mobile Auth**](./rest/google-mobile-auth) — Google OIDC
  flow tuned for the mobile app (returns an API key, not a session
  cookie).
