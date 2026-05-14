# Conversations & Messages

Conversations are the core entity in HelperIQ — every customer thread is
a conversation, regardless of channel (email, live chat, etc.). Messages
belong to conversations. This page covers the full lifecycle.

::: tip Identifiers
- `uuid` — the public conversation identifier, used in URLs and the
  agent UI. Stable forever.
- `reference_number` — short integer ID for humans (`#217`). Shown in
  emails and the UI.
- `id` — internal numeric primary key. Not used in URLs.
:::

## List conversations

All list endpoints share the same response shape (paginated, see
[API Introduction → Pagination](../#pagination)) and accept the same
filters / sorting / pagination query parameters.

| Method | Path | Permission | Scope |
| --- | --- | --- | --- |
| `GET` | `/api/v1/conversations/all` | `conversations:read_all` | Every conversation visible to the caller |
| `GET` | `/api/v1/conversations/assigned` | `conversations:read_assigned` | Caller's assigned tickets |
| `GET` | `/api/v1/conversations/unassigned` | `conversations:read_unassigned` | Tickets with no agent assignee |
| `GET` | `/api/v1/conversations/mentioned` | `conversations:read` | Tickets where the caller was @mentioned |
| `GET` | `/api/v1/conversations/spam` | `conversations:read_all` | Spam bucket |
| `GET` | `/api/v1/conversations/trash` | `conversations:read_all` | Trash bucket |
| `GET` | `/api/v1/teams/{id}/conversations/unassigned` | `conversations:read_team_inbox` | Team-inbox unassigned |
| `GET` | `/api/v1/views/{id}/conversations` | `conversations:read` | A saved view |

**Common query parameters:**

| Param | Default | Notes |
| --- | --- | --- |
| `page` | `1` | 1-indexed |
| `page_size` | `50` | Max 100 |
| `filters` | — | JSON-encoded ad-hoc filter array (see [API Introduction → Filtering](../#filtering)) |
| `order_by` | `last_message_at` | One of: `status_id`, `priority_id`, `assigned_team_id`, `assigned_user_id`, `inbox_id`, `last_message_at`, `last_interaction_at`, `created_at`, `waiting_since`, `next_sla_deadline_at`, `closed_at`, `resolved_at` |
| `order` | `desc` | `asc` or `desc` |
| `statuses` | — | Comma-separated status names (e.g. `Open,Snoozed`) |

**Response:**

```json
{
  "data": {
    "results": [
      {
        "uuid": "afa55a3b-…",
        "reference_number": 217,
        "subject": "Login problem after password reset",
        "status": "Open",
        "priority": "Medium",
        "assigned_user_id": 17,
        "assigned_team_id": 3,
        "inbox_id": 1,
        "contact": { "first_name": "Linda", "last_name": "Olsen", "email": "…" },
        "last_message_at": "2026-05-13T21:47:44Z",
        "waiting_since": null,
        "created_at": "2026-05-13T20:14:00Z"
      }
    ],
    "total": 16,
    "total_pages": 1,
    "page": 1,
    "page_size": 50
  }
}
```

## Get one conversation

```
GET /api/v1/conversations/{uuid}                  conversations:read
GET /api/v1/conversations/by-ref/{ref}            conversations:read
```

`by-ref` looks up by `reference_number` instead of UUID — convenient for
support agents who only have a ticket number to hand.

## Create a conversation

```
POST /api/v1/conversations                        conversations:write
```

Used by the "New conversation" button to start an outbound thread.

**Body:**

| Field | Type | Description |
| --- | --- | --- |
| `inbox_id` | int | Which inbox to send from. |
| `contact` | object | `{ first_name, last_name, email }` — created if not existing. |
| `subject` | string | Initial subject. |
| `message` | string | Initial outgoing message (HTML). |
| `to` | string[] | Recipients. Defaults to the contact's email. |
| `cc`, `bcc` | string[] | Optional. |
| `set_status` | string | Optional — apply this status after send (deferred until SMTP succeeds). |

Returns the created conversation row.

## Update conversation fields

| Method | Path | Permission |
| --- | --- | --- |
| `PUT` | `/api/v1/conversations/{uuid}/status` | `conversations:update_status` |
| `PUT` | `/api/v1/conversations/{uuid}/priority` | `conversations:update_priority` |
| `PUT` | `/api/v1/conversations/{uuid}/subject` | `conversations:update_status` |
| `PUT` | `/api/v1/conversations/{uuid}/contact` | `conversations:update_status` |
| `POST` | `/api/v1/conversations/{uuid}/tags` | `conversations:update_tags` |
| `PUT` | `/api/v1/conversations/{uuid}/custom-attributes` | authenticated |
| `PUT` | `/api/v1/conversations/{uuid}/contacts/custom-attributes` | authenticated |

**Status update body:**

```json
{ "status": "Resolved", "snoozed_until": null }
```

Snooze takes a Go duration string (`"24h"`, `"3d"`) — only required when
`status == "Snoozed"`.

**Priority update body:**

```json
{ "priority": "High" }
```

**Tags update body** (replaces the full tag set):

```json
{ "tags": ["billing", "vip"] }
```

## Assignment

| Method | Path | Permission |
| --- | --- | --- |
| `PUT` | `/api/v1/conversations/{uuid}/assignee/user` | `conversations:update_user_assignee` |
| `PUT` | `/api/v1/conversations/{uuid}/assignee/team` | `conversations:update_team_assignee` |
| `PUT` | `/api/v1/conversations/{uuid}/assignee/user/remove` | `conversations:update_user_assignee` |
| `PUT` | `/api/v1/conversations/{uuid}/assignee/team/remove` | `conversations:update_team_assignee` |

**Body** (user or team):

```json
{ "assignee_id": 17 }
```

`/remove` endpoints take no body.

## Trash, spam, merge, delete

| Method | Path | Permission |
| --- | --- | --- |
| `PUT` | `/api/v1/conversations/{uuid}/trash` | `conversations:update_status` |
| `PUT` | `/api/v1/conversations/{uuid}/restore` | `conversations:update_status` |
| `PUT` | `/api/v1/conversations/{uuid}/spam` | `conversations:update_status` |
| `PUT` | `/api/v1/conversations/{uuid}/not-spam` | `conversations:update_status` |
| `POST` | `/api/v1/conversations/merge` | `conversations:update_status` |
| `DELETE` | `/api/v1/conversations/{uuid}` | `conversations:update_status` |

**Merge body:**

```json
{ "source_uuid": "abc-…", "target_uuid": "def-…" }
```

Moves all messages from `source` into `target`. `source` is then closed.

**Delete** is a permanent hard-delete — the conversation must be in the
trash bucket first.

## Read receipts + unread

| Method | Path | Permission |
| --- | --- | --- |
| `PUT` | `/api/v1/conversations/{uuid}/last-seen` | `conversations:read` |
| `PUT` | `/api/v1/conversations/{uuid}/mark-unread` | `conversations:read` |

`last-seen` updates the caller's `assignee_last_seen_at` for collision
indicators. The agent UI calls this on conversation focus.

## Participants & followers

| Method | Path | Permission |
| --- | --- | --- |
| `GET` | `/api/v1/conversations/{uuid}/participants` | `conversations:read` |
| `POST` | `/api/v1/conversations/{uuid}/follow` | authenticated |
| `DELETE` | `/api/v1/conversations/{uuid}/follow` | authenticated |
| `POST` | `/api/v1/conversations/{uuid}/followers` | `conversations:read` |
| `DELETE` | `/api/v1/conversations/{uuid}/followers/{user_id}` | `conversations:read` |

Detailed coverage of these on the [Followers page](./followers).

## Page visits (live chat)

```
GET /api/v1/conversations/{uuid}/page-visits      conversations:read
```

Returns the customer's recent page visits (livechat-only). Used by the
"Pages visited" sidebar accordion on live-chat conversations.

## Messages — list & read

```
GET /api/v1/conversations/{uuid}/messages         messages:read
GET /api/v1/conversations/{cuuid}/messages/{uuid} messages:read
```

The list endpoint accepts:

| Param | Default | Description |
| --- | --- | --- |
| `page`, `page_size` | `1`, `50` | Standard pagination |
| `types` | — | Comma-separated. E.g. `incoming,outgoing` to exclude activity log entries |
| `private` | — | `true` / `false`. Filters to private notes / public messages |

**Response (single message):**

```json
{
  "data": {
    "id": 12345,
    "uuid": "b29d68b1-…",
    "conversation_uuid": "afa55a3b-…",
    "type": "outgoing",
    "status": "sent",
    "private": false,
    "content_type": "html",
    "content": "<p>Hi Linda…</p>",
    "text_content": "Hi Linda…",
    "sender_id": 17,
    "sender_type": "agent",
    "created_at": "…",
    "meta": {}
  }
}
```

## Send a message

```
POST /api/v1/conversations/{cuuid}/messages       messages:write
```

The agent reply endpoint. Powers both regular replies and forwards (see
[Forward](./forward) for the extra `forwarded_to` field).

**Body:**

| Field | Type | Description |
| --- | --- | --- |
| `message` | string | HTML body. |
| `private` | bool | `true` for private notes (not sent to customer). |
| `sender_type` | string | Usually `agent`. |
| `to`, `cc`, `bcc` | string[] | Recipients (email channel only). |
| `from` | string | Override the inbox primary From. Must match the inbox's configured From or one of its aliases. |
| `attachments` | object[] | Array of `{ media_uuid }`. Upload via [`POST /api/v1/media`](./media) first. |
| `mentions` | int[] | Agent user IDs to mention (triggers in-app notifications). |
| `set_status` | string | Optional — apply this status after a successful send (gated on SMTP success). See [Send-and-Close gating](../websocket#new-message). |
| `forwarded_to` | string[] | Forward mode — routes the message as a fresh email thread to these recipients instead of the conversation contact. |

Response is the created message row.

## Retry a failed message

```
PUT /api/v1/conversations/{cuuid}/messages/{uuid}/retry   messages:write
```

Re-queues a message in `failed` status. Only the original sender can
retry. Powers the **"Failed: retry?"** affordance shown on failed
message bubbles.

## Private notes — edit / delete

```
PUT    /api/v1/conversations/{cuuid}/messages/{uuid}/note   messages:write
DELETE /api/v1/conversations/{cuuid}/messages/{uuid}/note   messages:write
```

Private notes are editable / deletable by the author only. Public
messages (sent to the customer) are immutable.

**PUT body:**

```json
{ "content": "<p>Updated note</p>" }
```

## PCI redaction

```
POST /api/v1/conversations/{cuuid}/messages/{uuid}/redact   messages:write
```

Manually redact a message that contains PCI data flagged by the
scrubber. Irreversible. See [PCI Scrubbing](./pci) for details.

## Drafts

| Method | Path | Permission |
| --- | --- | --- |
| `GET` | `/api/v1/drafts` | authenticated |
| `POST` | `/api/v1/conversations/{uuid}/draft` | authenticated |
| `DELETE` | `/api/v1/conversations/{uuid}/draft` | authenticated |

Drafts are per-(user × conversation). The agent UI auto-saves replies
as drafts as you type.

**Draft body:**

```json
{
  "content": "<p>Hi Linda…</p>",
  "private": false,
  "is_forward": false,
  "to": [], "cc": [], "bcc": [],
  "mentions": [],
  "macro_id": null
}
```

`GET /api/v1/drafts` returns all the caller's drafts across conversations
— used to render the unsent-reply badge on the sidebar.

## Apply a macro

```
POST /api/v1/conversations/{uuid}/macros/{id}/apply    authenticated
```

Applies the macro's actions (status change, tag, assignment, etc.) to
the conversation. Returns the updated conversation row.

Macro **content** (the reply template) is inserted on the client side,
not applied via this endpoint.

## Search

`GET /api/v1/conversations/search` and `GET /api/v1/messages/search`
are covered on the [Search page](./search).
