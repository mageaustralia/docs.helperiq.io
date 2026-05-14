# Search

HelperIQ provides a **unified search** endpoint plus per-resource search
endpoints. All search is full-text (PostgreSQL trigram + tsvector
indexes — no Elastic dependency).

| Method | Path | Permission |
| --- | --- | --- |
| `GET` | `/api/v1/search` | `conversations:read` |
| `GET` | `/api/v1/conversations/search` | `conversations:read` |
| `GET` | `/api/v1/messages/search` | `messages:read` |
| `GET` | `/api/v1/contacts/search` | `contacts:read` |

## Unified search

```
GET /api/v1/search?q=<query>
```

Searches across conversations, messages, and contacts simultaneously.
Used by the global `Ctrl+K` search palette in the agent UI.

**Query parameters:**

| Param | Default | Description |
| --- | --- | --- |
| `q` | — required | Search query. Minimum 2 characters. |
| `limit` | `10` per category | Max results per category. |

**Response:**

```json
{
  "data": {
    "conversations": [
      {
        "uuid": "afa55a3b-…",
        "reference_number": 217,
        "subject": "Login problem after password reset",
        "snippet": "…can't <mark>login</mark> after I reset my password…",
        "contact": { "first_name": "Linda", "email": "linda@example.com" }
      }
    ],
    "messages": [
      {
        "uuid": "b29d68b1-…",
        "conversation_uuid": "afa55a3b-…",
        "snippet": "…tried to <mark>login</mark> three times…",
        "created_at": "…"
      }
    ],
    "contacts": [
      { "id": 42, "first_name": "Linda", "last_name": "Olsen", "email": "linda@example.com" }
    ]
  }
}
```

Matches include a `snippet` with the matched query highlighted via
`<mark>` tags — convenient to render directly in HTML.

## Search conversations

```
GET /api/v1/conversations/search?q=<query>
```

Returns conversations whose subject or first/last message matches.

**Query parameters:**

| Param | Default | Description |
| --- | --- | --- |
| `q` | — required | Query. Min 2 chars. |
| `page`, `page_size` | `1`, `50` | Standard pagination. |
| `filters` | — | JSON-encoded ad-hoc filter array (see [API Introduction → Filtering](../#filtering)). Combines with the text query. |

Response shape matches the
[conversation list endpoints](./conversations#list-conversations).

## Search messages

```
GET /api/v1/messages/search?q=<query>
```

Full-text search over message content (HTML stripped). Useful for
finding "the email that mentioned the SKU X42".

**Query parameters:** `q`, `page`, `page_size`, optional
`conversation_uuid` to scope to a single thread.

**Response:**

```json
{
  "data": {
    "results": [
      {
        "uuid": "b29d68b1-…",
        "conversation_uuid": "afa55a3b-…",
        "snippet": "…order <mark>X42</mark> was shipped on…",
        "type": "outgoing",
        "private": false,
        "created_at": "…"
      }
    ],
    "total": 12, "total_pages": 1, "page": 1, "page_size": 50
  }
}
```

## Search contacts

```
GET /api/v1/contacts/search?q=<query>
```

Quick lookup over contact name + email + phone. Used by the recipient
autocomplete in the reply editor and the "+ New conversation" form.

Returns up to 20 matches; no pagination.

```json
{
  "data": [
    { "id": 42, "first_name": "Linda", "last_name": "Olsen", "email": "linda@example.com", "phone": "…" }
  ]
}
```

## Search index lifecycle

The search indexes are PostgreSQL GIN indexes maintained automatically:

- `idx_trgm_conversation_messages_on_text_content` (trigram on plain text)
- Per-table tsvector indexes on `subject`, contact name, etc.

Indexes are updated synchronously on insert/update — no separate
ingestion process. New conversations are searchable immediately after
the writing transaction commits.
