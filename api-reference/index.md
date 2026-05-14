# API Introduction

HelperIQ exposes a comprehensive HTTP + WebSocket API. Everything the
agent UI does is implemented on top of these same endpoints — there are
no private internal APIs.

This page covers authentication, base URL, request/response conventions,
errors, and pagination. The sidebar lists every endpoint grouped by
resource.

## Base URL

The API is served from the same origin as the application:

```
https://your-helperiq-host
```

Default port for Docker self-host is `9000`. All REST paths are prefixed
with `/api/v1/`.

## Authentication

Three auth methods are supported. Each request must use one.

### 1. Session cookie (browser)

`POST /api/v1/auth/login` with form-encoded `email` + `password` sets a
session cookie. Subsequent requests carry the cookie automatically. Used
by the in-browser agent UI.

```http
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

email=agent@example.com&password=…
```

### 2. API key (bearer)

For mobile apps, external integrations, scripts.

```http
GET /api/v1/conversations/all
Authorization: Bearer lk_abc123def…
```

API keys are provisioned per user under
[`POST /api/v1/agents/{id}/api-key`](./rest/agents-teams#generate-api-key)
and revoked under
[`DELETE /api/v1/agents/{id}/api-key`](./rest/agents-teams#revoke-api-key).

### 3. OIDC (single sign-on)

If configured, browser users can sign in through your OIDC provider via
`GET /api/v1/oidc/{id}/login`. The flow ends with the same session
cookie as method 1.

The mobile app uses
[`POST /api/v1/auth/google-mobile`](./rest/google-mobile-auth) — a
stateless variant that returns an API key (method 2) instead of a
session cookie.

::: tip Picking a method
- **Agent UI in a browser**: session cookie (automatic).
- **Mobile app, CI scripts, integrations**: API key.
- **Single sign-on into the browser UI**: OIDC.
:::

## Permissions

Most endpoints require an explicit permission scope shown as a chip in
the endpoint reference (e.g. `conversations:read`, `users:manage`). The
permissions a user has come from the roles assigned to them in
**Admin → Teammates → Roles**.

Permission denial returns `403 Forbidden` with a `PermissionError`
envelope.

A handful of endpoints fall back to the looser `auth` middleware
(authenticated user only, no permission check) — those are noted as
"authenticated" in the reference.

## Request format

- JSON bodies use `Content-Type: application/json`.
- Form bodies (mostly auth + file upload) use
  `application/x-www-form-urlencoded` or `multipart/form-data`.
- Path parameters are interpolated like `/api/v1/conversations/{uuid}`.
- Query parameters use standard `?key=value&…` syntax.

## Response format

All responses are JSON wrapped in an envelope:

**Success:**

```json
{
  "data": <payload>
}
```

**Error:**

```json
{
  "data": {
    "message": "Human-readable error description",
    "type": "InputError"
  }
}
```

The HTTP status matches the `type`:

| `type` | HTTP | Meaning |
| --- | --- | --- |
| `InputError` | 400 | Validation failure (missing field, bad format, etc.) |
| `AuthError` | 401 | Missing or invalid auth |
| `PermissionError` | 403 | Authenticated but lacking permission |
| `NotFoundError` | 404 | Resource doesn't exist (or not visible to caller) |
| `GeneralError` | 500 | Unexpected server-side failure |

## Pagination

List endpoints accept these query parameters:

| Parameter | Default | Notes |
| --- | --- | --- |
| `page` | `1` | 1-indexed page number |
| `page_size` | `50` | Max 100 on most endpoints |
| `order_by` | resource-specific | Column to sort by |
| `order` | `desc` | `asc` or `desc` |

Responses wrap the page in metadata:

```json
{
  "data": {
    "results": [ … ],
    "total": 1234,
    "total_pages": 25,
    "page": 1,
    "page_size": 50
  }
}
```

## Filtering

Conversation/contact list endpoints support **ad-hoc filters** via a
JSON-encoded `filters` query parameter:

```
GET /api/v1/conversations/all?filters=[{"field":"priority","operator":"=","value":"High"}]
```

Allowed fields and operators are resource-specific — invalid filters
return `400 InputError`. The agent UI builds these via the "Add filter"
button on the inbox list.

## Rate limiting

| Endpoint family | Rate |
| --- | --- |
| `/api/v1/auth/*` | Per-IP, per-minute |
| `/widget/*` | Per-IP, per-minute |
| `/api/v1/agents/reset-password` | Per-IP, per-minute |
| Everything else | No application-level limit (rely on your reverse proxy) |

Rate-limited responses return `429 Too Many Requests`.

## Versioning

All endpoints live under `/api/v1/`. Breaking changes will move to
`/api/v2/`; we'll keep `v1` running for at least 6 months alongside.

## Endpoint catalogue

REST is grouped by resource:

- [**Conversations & Messages**](./rest/conversations) — list, read,
  create, send, retry, status/priority/assignee updates, tags,
  participants, page visits, drafts, merge.
- [**Contacts**](./rest/contacts) — CRUD, block/unblock, notes,
  per-contact conversations.
- [**Agents & Teams**](./rest/agents-teams) — agent CRUD, import,
  API keys, password reset, team CRUD, current-agent self-service.
- [**Statuses, Priorities & Tags**](./rest/statuses-priorities-tags) —
  CRUD for the conversation status/tag taxonomies.
- [**AI**](./rest/ai) — completion endpoint + provider management
  (separate from the [RAG endpoints](./rest/rag)).
- [**Inboxes**](./rest/inboxes) — IMAP/SMTP email channels, live chat
  widget channels.
- [**Macros**](./rest/macros) — canned-response CRUD + apply.
- [**Search**](./rest/search) — unified search + per-resource search
  endpoints.
- [**Media**](./rest/media) — upload + serve attachments and inline
  images.
- [**Health**](./rest/health) — liveness probe.

Plus the HelperIQ-only extensions (not in upstream LibreDesk):

- [**WebSocket**](./websocket)
- [**RAG / Knowledge base**](./rest/rag)
- [**Followers**](./rest/followers)
- [**AI Settings**](./rest/ai-settings)
- [**Ecommerce**](./rest/ecommerce)
- [**PCI Scrubbing**](./rest/pci)
- [**Forward**](./rest/forward)
- [**Google Mobile Auth**](./rest/google-mobile-auth)
