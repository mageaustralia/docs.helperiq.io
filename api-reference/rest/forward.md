# Forward

::: warning Stub
This page is a placeholder. Full reference coming soon.
:::

Forward an individual conversation message to an external recipient
(supplier, freight carrier, etc.) as a fresh email thread.

Forwarding does **not** introduce a new endpoint — it reuses the
existing message POST with extra fields:

```
POST /api/v1/conversations/{uuid}/messages
```

**Forward-specific fields:**

| Field | Type | Notes |
| --- | --- | --- |
| `forwarded_to` | string[] | Array of recipient email addresses. Replaces the To list for this send. |

When `forwarded_to` is non-empty:

- Subject is prefixed with `Fwd: ` (idempotent).
- `In-Reply-To` and `References` headers are cleared so the forward
  starts a fresh thread for the recipient.
- An activity note is logged: `"<agent> forwarded to <recipients>"`.
- The original conversation gets a `Forwarded to:` badge on the
  message in the UI.

CC / BCC pass through unchanged so an agent can loop in teammates.

## Example

```http
POST /api/v1/conversations/afa55a3b-…/messages
Content-Type: application/json

{
  "message": "<p>FYI — customer reporting issue with order #1042.</p>",
  "private": false,
  "sender_type": "agent",
  "forwarded_to": ["supplier@example.com"]
}
```
