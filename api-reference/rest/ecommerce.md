# Ecommerce

![Ecommerce settings page](/images/ecommerce-settings.png)

::: warning Stub
This page is a placeholder. Full reference coming soon.
:::

HelperIQ integrates with [Maho Commerce](https://mahocommerce.com) and
Magento 1 over OAuth2 client_credentials. Once configured, agents see
the customer's recent orders inline in the reply box, and "+ Orders" in
the reply menu fetches full order details from the conversation's
mentioned order numbers.

| Method | Path | Permission |
| --- | --- | --- |
| `GET` | `/api/v1/ecommerce/settings` | `general_settings:manage` |
| `PUT` | `/api/v1/ecommerce/settings` | `general_settings:manage` |
| `POST` | `/api/v1/ecommerce/test` | `general_settings:manage` |
| `GET` | `/api/v1/ecommerce/status` | authenticated |
| `GET` | `/api/v1/ecommerce/test/customer` | `general_settings:manage` |
| `GET` | `/api/v1/ecommerce/test/order` | `general_settings:manage` |

The `/status` endpoint is intentionally readable by any authenticated
user — the reply box uses it to decide whether to render the "+ Orders"
button.
