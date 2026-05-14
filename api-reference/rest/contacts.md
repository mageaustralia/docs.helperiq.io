# Contacts

Customers, leads, anyone you've had a conversation with. Contacts are
created automatically when a new email/chat arrives from an unknown
address; agents can also create them manually.

| Method | Path | Permission |
| --- | --- | --- |
| `GET` | `/api/v1/contacts` | `contacts:read_all` |
| `GET` | `/api/v1/contacts/{id}` | `contacts:read` |
| `PUT` | `/api/v1/contacts/{id}` | `contacts:write` |
| `POST` | `/api/v1/contacts/quick` | `contacts:write` |
| `PUT` | `/api/v1/contacts/{id}/block` | `contacts:block` |
| `GET` | `/api/v1/contacts/search` | `contacts:read` |
| `GET` | `/api/v1/contacts/{id}/conversations` | `contacts:read` |
| `GET` | `/api/v1/contacts/{id}/notes` | `contact_notes:read` |
| `POST` | `/api/v1/contacts/{id}/notes` | `contact_notes:write` |
| `DELETE` | `/api/v1/contacts/{id}/notes/{note_id}` | `contact_notes:delete` |

## List contacts

```
GET /api/v1/contacts
```

Standard pagination + filtering. Returns the directory.

**Response:**

```json
{
  "data": {
    "results": [
      {
        "id": 42,
        "first_name": "Linda",
        "last_name": "Olsen",
        "email": "linda@example.com",
        "phone": "+61 4xx xxx xxx",
        "blocked": false,
        "custom_attributes": {},
        "created_at": "…",
        "updated_at": "…"
      }
    ],
    "total": 82171,
    "total_pages": 1644,
    "page": 1,
    "page_size": 50
  }
}
```

## Get one contact

```
GET /api/v1/contacts/{id}
```

Includes contact-channel records (alternate email addresses, phone
numbers, etc.) and any custom attributes.

## Update contact

```
PUT /api/v1/contacts/{id}
```

**Body** — all fields optional, only provided ones are updated:

| Field | Type | Notes |
| --- | --- | --- |
| `first_name` | string | |
| `last_name` | string | |
| `email` | string | Validated. Used as the matching key. |
| `phone` | string | |
| `custom_attributes` | object | Free-form. Keys must match defined custom-attribute definitions if [strict mode is enabled](./statuses-priorities-tags). |

## Quick-create contact

```
POST /api/v1/contacts/quick
```

Used by the "+ New conversation" flow to create a minimal contact
in-place if the recipient isn't already in the directory.

**Body:**

```json
{ "first_name": "Linda", "last_name": "Olsen", "email": "linda@example.com" }
```

Returns the created contact.

## Block / unblock

```
PUT /api/v1/contacts/{id}/block
```

**Body:**

```json
{ "blocked": true }
```

Blocking marks the contact so:

- Incoming messages from that contact bypass routing and land directly
  in the **Spam** bucket.
- Outbound replies are still allowed (so you can email a blocked
  contact about the block if needed).

Pass `"blocked": false` to unblock.

## Search

```
GET /api/v1/contacts/search?q=linda
```

Full-text search across name + email + phone. Returns up to 20 matches.

## Per-contact conversations

```
GET /api/v1/contacts/{id}/conversations
```

Lists every conversation the contact has been part of. Used by the
"Previous conversations" sidebar accordion in the agent UI.

## Contact notes

Notes are private agent-only annotations on a contact (separate from
conversation-level private notes).

```
GET /api/v1/contacts/{id}/notes
POST /api/v1/contacts/{id}/notes
DELETE /api/v1/contacts/{id}/notes/{note_id}
```

**Create body:**

```json
{ "content": "Spoke with this customer on the phone — wants invoice changes." }
```

Notes are authored, immutable, and only deletable by the author or
anyone with `contact_notes:delete`.
