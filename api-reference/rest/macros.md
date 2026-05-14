# Macros

::: warning Stub
Full reference coming soon — endpoint table below.
:::

Macros are reusable "canned reply" templates with optional automation
actions (status change, tag, assignment) bundled in. Inserted into the
reply editor via `Ctrl+K` or the toolbar Zap button.

| Method | Path | Permission |
| --- | --- | --- |
| `GET` | `/api/v1/macros` | authenticated |
| `GET` | `/api/v1/macros/{id}` | `macros:manage` |
| `POST` | `/api/v1/macros` | `macros:manage` |
| `PUT` | `/api/v1/macros/{id}` | `macros:manage` |
| `DELETE` | `/api/v1/macros/{id}` | `macros:manage` |
| `POST` | `/api/v1/conversations/{uuid}/macros/{id}/apply` | authenticated |

## Macro shape

<!-- VitePress interpolates `{{ }}` in markdown even inside code fences,
     so the placeholder examples below use literal &lcub;&lcub; / &rcub;&rcub; HTML
     entities. The actual macro syntax uses double braces.  -->

```json
{
  "id": 17,
  "name": "[Sales] Welcome to our pro plan",
  "message_content": "<p>Hi &lcub;&lcub;contact.first_name&rcub;&rcub;,</p><p>Welcome…</p>",
  "visibility": "all",
  "visible_when": ["replying", "starting_conversation", "adding_private_note"],
  "actions": [
    { "type": "set_status", "value": "Resolved" },
    { "type": "add_tag",    "value": "onboarded" }
  ]
}
```

- `name` — max 140 chars. Prefix with `[Folder]` to group in the picker.
- `message_content` — max 5000 chars. HTML. Supports
  <code>&lcub;&lcub;contact.first_name&rcub;&rcub;</code>,
  <code>&lcub;&lcub;agent.full_name&rcub;&rcub;</code>,
  <code>&lcub;&lcub;inbox.name&rcub;&rcub;</code> etc.
- `visibility` — `all` (every agent) or `personal` (just the author).
- `visible_when` — array of contexts the macro shows up in.
- `actions` — bundled side-effects fired by `/apply` (not when the
  agent inserts content alone).

## Apply

```
POST /api/v1/conversations/{uuid}/macros/{id}/apply
```

Runs the macro's `actions[]` against the conversation. Returns the
updated conversation.

The macro **message content** is inserted into the reply editor
client-side — this endpoint doesn't touch the message body.
