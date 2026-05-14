# Followers

Followers are agents added to a conversation so they receive
notifications (and real-time `new_message` WebSocket events) without
being assigned as the owner. Useful for SMEs who want to be looped in
on a thread, or a manager monitoring escalations.

| Method | Path | Permission |
| --- | --- | --- |
| `POST` | `/api/v1/conversations/{uuid}/follow` | authenticated (self-add) |
| `DELETE` | `/api/v1/conversations/{uuid}/follow` | authenticated (self-remove) |
| `POST` | `/api/v1/conversations/{uuid}/followers` | `conversations:read` |
| `DELETE` | `/api/v1/conversations/{uuid}/followers/{user_id}` | `conversations:read` |
| `GET` | `/api/v1/conversations/{uuid}/participants` | `conversations:read` |

## Follow / unfollow yourself

```
POST   /api/v1/conversations/{uuid}/follow
DELETE /api/v1/conversations/{uuid}/follow
```

Add or remove **the authenticated user** as a follower. No body required.
Used by the "Follow this conversation" button in the agent UI.

**Response:**

```json
{
  "data": {
    "participants": [
      { "id": 42, "first_name": "Bob", "last_name": "Smith", "email": "bob@example.com", "type": "agent" },
      { "id": 17, "first_name": "Alice", "last_name": "Jones", "email": "alice@example.com", "type": "agent" }
    ]
  }
}
```

The full refreshed participant list is returned so the UI's followers
picker can update without a separate fetch.

## Add another agent as a follower

```
POST /api/v1/conversations/{uuid}/followers
```

**Body:**

| Field | Type | Required |
| --- | --- | --- |
| `user_id` | int | yes |

```http
POST /api/v1/conversations/afa55a3b-…/followers
Content-Type: application/json

{ "user_id": 17 }
```

**Response:** same shape as `follow` — the refreshed participant list.

**Errors:**

- `400 InputError` — `user_id` missing or not a positive int.
- `404 NotFoundError` — conversation or user not found.

::: info System user
The `System` user (used for activity-log entries and automation) is
filtered out of the participants list on read. Adding the System user as
a follower is a no-op.
:::

## Remove a follower

```
DELETE /api/v1/conversations/{uuid}/followers/{user_id}
```

Removes the specified user from the conversation's followers. Returns the
refreshed participant list.

## Get participants

```
GET /api/v1/conversations/{uuid}/participants
```

Returns the current followers list. Used by the sidebar followers picker
on conversation load.

**Response:**

```json
{
  "data": [
    { "id": 42, "first_name": "Bob", "last_name": "Smith", "email": "bob@example.com", "type": "agent" }
  ]
}
```

The list excludes the `System` user.

## Notifications

Adding a user as a follower triggers a `new_notification` WebSocket event
to that user, and (if email notifications are enabled) an email:

> *Bob added you as a follower on ticket #217 — "Login problem after password reset"*

Removing a follower does **not** generate a notification.

Followers also receive `new_message` WebSocket events for the conversation
without needing to subscribe via `conversation_subscribe`, because the
server fan-out targets the union of assignee + team members + followers.

## Implementation notes

- Followers are stored as rows in the `conversation_participants` table
  with `type = 'agent'`.
- The reply-box "@mention" feature inserts mentions inline in the
  message but does **not** auto-add the mentioned user as a follower —
  that's a separate explicit action.
- Frontend uses a debounced SelectTag picker (multi-select); each add/
  remove fires its own request. The server returns the refreshed full
  list so the UI is always source-of-truth.

## Related

- [WebSocket `new_message`](../websocket#new-message) — what followers
  actually receive.
- [WebSocket `new_notification`](../websocket#new-notification) — the
  "you've been added as a follower" toast.
