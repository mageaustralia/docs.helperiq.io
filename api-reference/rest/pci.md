# PCI Scrubbing

::: warning Stub
This page is a placeholder. Full reference coming soon.
:::

| Method | Path | Permission |
| --- | --- | --- |
| `GET` | `/api/v1/settings/pci` | `general_settings:manage` |
| `PUT` | `/api/v1/settings/pci` | `general_settings:manage` |

HelperIQ scans incoming messages for PCI data (card numbers, CVVs,
expiry dates) using [go-pci-scrub](https://github.com/abhinavxd/go-pci-scrub).
When detected, a red warning banner appears on the message with a
"Redact Now" button; if the agent doesn't redact within 7 days, the data
is auto-redacted by a background safety net.

Per-inbox opt-out exists (see [AI Settings → inbox config](./ai-settings))
for inboxes that receive automated payment notifications where the
sender already masks card data and our scrubber would produce false
positives.
