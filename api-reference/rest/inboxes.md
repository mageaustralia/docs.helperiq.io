# Inboxes

::: warning Stub
Full reference coming soon — endpoint table below; deep schema docs are
in progress.
:::

Inboxes are channels that receive customer messages. HelperIQ supports
email (IMAP/SMTP + OAuth for Google/Microsoft) and a live-chat widget.

| Method | Path | Permission |
| --- | --- | --- |
| `GET` | `/api/v1/inboxes` | `inboxes:manage` |
| `GET` | `/api/v1/inboxes/{id}` | `inboxes:manage` |
| `POST` | `/api/v1/inboxes` | `inboxes:manage` |
| `PUT` | `/api/v1/inboxes/{id}` | `inboxes:manage` |
| `DELETE` | `/api/v1/inboxes/{id}` | `inboxes:manage` |
| `POST` | `/api/v1/inboxes/{id}/test-imap` | `inboxes:manage` |
| `POST` | `/api/v1/inboxes/{id}/test-smtp` | `inboxes:manage` |

Each email inbox config has these notable fields:

- `auth_type` — `password` or `oauth` (Google / Microsoft)
- `imap[]` — array of IMAP server configs (host, port, ssl, password)
- `smtp[]` — array of SMTP server configs
- `reply_to` — optional Reply-To header
- `aliases` — additional From addresses the inbox can send as (for
  agent-side "From switcher")
- `signature` — HTML signature template appended to replies
- `auto_assign_on_reply` — if `true`, replying to an unassigned ticket
  auto-assigns to the replying agent
- `enable_plus_addressing` — accept `support+anything@yourdomain.com`
- `skip_pci_scan` — per-inbox opt-out from PCI scrubbing (for inboxes
  receiving already-masked payment notifications)
