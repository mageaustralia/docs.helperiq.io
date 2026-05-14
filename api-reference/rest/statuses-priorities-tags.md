# Statuses, Priorities & Tags

These are the conversation taxonomies you customise per-workspace. Out
of the box HelperIQ ships with reasonable defaults — most teams just
add a tag or two and leave the rest.

## Statuses

The conversation lifecycle states. Default set: `Open`, `Snoozed`,
`Resolved`, `Closed`, `Spam`, `Trashed`.

| Method | Path | Permission |
| --- | --- | --- |
| `GET` | `/api/v1/statuses` | authenticated |
| `POST` | `/api/v1/statuses` | `status:manage` |
| `PUT` | `/api/v1/statuses/{id}` | `status:manage` |
| `PUT` | `/api/v1/statuses/{id}/color` | `status:manage` |
| `DELETE` | `/api/v1/statuses/{id}` | `status:manage` |

### List statuses

```
GET /api/v1/statuses
```

Returns the full status set in display order.

**Response:**

```json
{
  "data": [
    { "id": 1, "name": "Open",     "color": "#F59E0B", "system": true,  "sort_order": 1 },
    { "id": 2, "name": "Snoozed",  "color": "#A78BFA", "system": true,  "sort_order": 2 },
    { "id": 3, "name": "Resolved", "color": "#10B981", "system": true,  "sort_order": 3 },
    { "id": 4, "name": "Closed",   "color": "#6B7280", "system": true,  "sort_order": 4 },
    { "id": 5, "name": "Spam",     "color": "#EF4444", "system": true,  "sort_order": 5 },
    { "id": 6, "name": "Trashed",  "color": "#6B7280", "system": true,  "sort_order": 6 }
  ]
}
```

`system: true` statuses can be renamed and recoloured but not deleted —
they have hard-coded semantics in routing, SLA, and reporting.

### Create custom status

```
POST /api/v1/statuses
```

**Body:**

```json
{ "name": "Waiting on Customer", "color": "#3B82F6", "sort_order": 7 }
```

Custom statuses don't trigger any built-in behaviour — they're for
your own workflow tracking. Conversations in a custom status behave
like `Open` for SLA and notification purposes.

### Update / colour-only update

```
PUT /api/v1/statuses/{id}              { "name": "...", "color": "...", "sort_order": ... }
PUT /api/v1/statuses/{id}/color        { "color": "#…" }
```

The split exists because admins recolour statuses far more often than
they rename — the colour-only path lets the UI's colour-picker save
without sending the rest of the form.

### Delete custom status

```
DELETE /api/v1/statuses/{id}
```

Only custom statuses are deletable. Conversations in the deleted status
are auto-migrated to `Open`.

## Priorities

| Method | Path | Permission |
| --- | --- | --- |
| `GET` | `/api/v1/priorities` | authenticated |

Priorities are **read-only** — fixed set: `Low`, `Medium`, `High`,
`Urgent`. Used for filtering, SLA escalation, and the priority dot in
the conversation list.

```json
{
  "data": [
    { "id": 1, "name": "Low" },
    { "id": 2, "name": "Medium" },
    { "id": 3, "name": "High" },
    { "id": 4, "name": "Urgent" }
  ]
}
```

To change a conversation's priority, use
[`PUT /api/v1/conversations/{uuid}/priority`](./conversations#update-conversation-fields).

## Tags

Free-form labels you attach to conversations. Tags are workspace-wide
and reusable.

| Method | Path | Permission |
| --- | --- | --- |
| `GET` | `/api/v1/tags` | authenticated |
| `POST` | `/api/v1/tags` | `tags:manage` |
| `PUT` | `/api/v1/tags/{id}` | `tags:manage` |
| `DELETE` | `/api/v1/tags/{id}` | `tags:manage` |
| `POST` | `/api/v1/tags/import` | `tags:manage` |
| `GET` | `/api/v1/tags/import/status` | `tags:manage` |

### List tags

```
GET /api/v1/tags
```

Returns every tag (no pagination — there's rarely a useful reason to
have hundreds).

```json
{
  "data": [
    { "id": 1, "name": "billing" },
    { "id": 2, "name": "vip" },
    { "id": 3, "name": "feature-request" }
  ]
}
```

### Create / update tag

```
POST /api/v1/tags                  { "name": "billing" }
PUT  /api/v1/tags/{id}             { "name": "billing-renamed" }
DELETE /api/v1/tags/{id}
```

Tag names are unique. Deleting a tag removes it from every conversation.

### Bulk import

```
POST /api/v1/tags/import
```

Multipart upload — one tag name per line in a CSV. Runs async, status
available at `GET /api/v1/tags/import/status`.

### Attaching tags to a conversation

Use [`POST /api/v1/conversations/{uuid}/tags`](./conversations#update-conversation-fields)
— accepts a JSON array that **replaces** the conversation's full tag
set (not append).

## Naming length limits

| Resource | Max length |
| --- | --- |
| Status `name` | 64 chars |
| Tag `name` | 64 chars |
| Custom attribute key | 64 chars |
| Macro `name` | 140 chars |
| Macro `message_content` | 5000 chars |
