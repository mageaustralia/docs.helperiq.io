# Agents & Teams

Agents are users with the `agent` type — they sign in, handle
conversations, and have permissions via roles. Teams are agent
groupings, used for team-based assignment and team-inbox routing.

## Current agent (self-service)

These endpoints act on the authenticated caller. No permission required
beyond being logged in.

| Method | Path |
| --- | --- |
| `GET` | `/api/v1/agents/me` |
| `PUT` | `/api/v1/agents/me` |
| `GET` | `/api/v1/agents/me/teams` |
| `PUT` | `/api/v1/agents/me/availability` |
| `DELETE` | `/api/v1/agents/me/avatar` |
| `POST` | `/api/v1/agents/me/push-token` |
| `DELETE` | `/api/v1/agents/me/push-token` |

### Get current agent

```
GET /api/v1/agents/me
```

Returns the full agent record + their permissions + their teams.

**Response:**

```json
{
  "data": {
    "id": 17,
    "first_name": "Bob",
    "last_name": "Smith",
    "email": "bob@example.com",
    "avatar_url": "…",
    "type": "agent",
    "availability": "online",
    "country": "AU",
    "roles": ["admin"],
    "permissions": [
      "conversations:read_all", "messages:write", "users:manage", …
    ],
    "teams": [{ "id": 3, "name": "Support" }]
  }
}
```

### Update current agent

```
PUT /api/v1/agents/me
```

**Body:**

```json
{
  "first_name": "Bob",
  "last_name": "Smith",
  "email": "bob@example.com",
  "avatar_url": "…",
  "country": "AU"
}
```

Field-level partial updates — only provided fields are touched.

### Update availability

```
PUT /api/v1/agents/me/availability
```

**Body:**

```json
{ "availability": "online" }
```

Allowed values: `online`, `away`, `offline`. Drives the green/yellow/grey
dot on agent avatars across the app.

### Push notifications (mobile)

```
POST   /api/v1/agents/me/push-token   { "token": "...", "platform": "ios" }
DELETE /api/v1/agents/me/push-token
```

Register / unregister a device push token. Used by the mobile app to
receive new-message notifications when backgrounded.

## Lightweight directory

```
GET /api/v1/agents/compact    authenticated
GET /api/v1/teams/compact     authenticated
```

Returns `[{ id, name }]` for every agent or team — used by the
assignee/team picker dropdowns. Lighter than the full list endpoints
below and accessible to any authenticated user.

## Agent management

| Method | Path | Permission |
| --- | --- | --- |
| `GET` | `/api/v1/agents` | `users:manage` |
| `GET` | `/api/v1/agents/{id}` | `users:manage` |
| `POST` | `/api/v1/agents` | `users:manage` |
| `PUT` | `/api/v1/agents/{id}` | `users:manage` |
| `DELETE` | `/api/v1/agents/{id}` | `users:manage` |

### List agents

```
GET /api/v1/agents
```

Standard pagination. Returns the directory.

### Create agent

```
POST /api/v1/agents
```

**Body:**

```json
{
  "first_name": "Alice",
  "last_name": "Agent",
  "email": "alice@example.com",
  "roles": ["agent"],
  "teams": [3],
  "send_welcome_email": true
}
```

If `send_welcome_email` is `true`, the new agent gets a reset-password
link and can set their own password. Otherwise, an admin must invoke
[set-password](#set-password) manually.

### Update agent

```
PUT /api/v1/agents/{id}
```

Same body shape as create. All fields optional. Setting `roles` to an
empty array removes all roles.

### Delete agent

```
DELETE /api/v1/agents/{id}
```

Soft-delete — the agent's conversations stay, but they can no longer
sign in. Audit log entries retain the original author.

## Agent import

| Method | Path | Permission |
| --- | --- | --- |
| `POST` | `/api/v1/agents/import` | `users:manage` |
| `GET` | `/api/v1/agents/import/status` | `users:manage` |

Bulk-import agents from a CSV. The import runs async — `import/status`
returns the running/completed/errored count.

**Import body** (multipart):

| Field | Type | Notes |
| --- | --- | --- |
| `file` | file | CSV with header row `email,first_name,last_name,roles,teams`. Roles + teams are comma-separated names within each cell. |

## API keys

| Method | Path | Permission |
| --- | --- | --- |
| `POST` | `/api/v1/agents/{id}/api-key` | `users:manage` |
| `DELETE` | `/api/v1/agents/{id}/api-key` | `users:manage` |

### Generate API key

```
POST /api/v1/agents/{id}/api-key
```

Provisions a new API key for the target agent. **The plaintext key is
returned only once in this response** — it's stored hashed in the
database and cannot be retrieved later.

**Response:**

```json
{
  "data": {
    "api_key": "lk_abc123def456…",
    "created_at": "…"
  }
}
```

Subsequent requests use it as `Authorization: Bearer lk_…`.

### Revoke API key

```
DELETE /api/v1/agents/{id}/api-key
```

Invalidates the agent's API key. Future requests with the old key
return `401 AuthError`.

::: warning One key per agent
Each agent has at most one active API key. Generating a new one revokes
the previous. If you need per-device keys, use the
[Google Mobile Auth](./google-mobile-auth) endpoint, which issues
device-bound keys.
:::

## Password reset

| Method | Path | Auth | Rate-limit |
| --- | --- | --- | --- |
| `POST` | `/api/v1/agents/reset-password` | none (try-auth) | per-IP |
| `POST` | `/api/v1/agents/set-password` | reset token | per-IP |

### Request a reset

```
POST /api/v1/agents/reset-password
{ "email": "agent@example.com" }
```

Always returns `200` — never reveals whether the email exists. If a
matching agent exists, an email is sent with a reset link.

### Set the new password

```
POST /api/v1/agents/set-password
{ "token": "…", "password": "new-strong-password" }
```

The `token` comes from the reset email. On success, the agent can sign
in immediately.

## Teams

| Method | Path | Permission |
| --- | --- | --- |
| `GET` | `/api/v1/teams` | `teams:manage` |
| `GET` | `/api/v1/teams/{id}` | `teams:manage` |
| `POST` | `/api/v1/teams` | `teams:manage` |
| `PUT` | `/api/v1/teams/{id}` | `teams:manage` |
| `DELETE` | `/api/v1/teams/{id}` | `teams:manage` |

### Create team

```
POST /api/v1/teams
```

**Body:**

```json
{
  "name": "Support",
  "emoji": "🛟",
  "members": [17, 42]
}
```

`members` is an array of agent IDs. Updating later replaces the full
member set.

### Delete team

```
DELETE /api/v1/teams/{id}
```

Unassigns the team from all conversations first, then deletes. Cannot
be undone.

## Related

- [Conversations → Assignment](./conversations#assignment) for changing
  who owns a ticket.
- [Followers](./followers) for the lighter-weight "notify without
  assigning" workflow.
