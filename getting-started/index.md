# Introduction

![Conversation list — Inbox view](/images/conversation-list.png)

HelperIQ is a self-hosted customer support desk built on top of the
open-source [LibreDesk](https://github.com/abhinavxd/libredesk) project,
extended by [Mage Australia](https://mageaustralia.com.au) with:

- **Multi-provider AI replies** — OpenAI, Anthropic Claude, OpenRouter.
- **RAG (Retrieval-Augmented Generation)** — `pgvector`-backed knowledge
  base. Sources can be webpages, macros, or uploaded files.
- **Ecommerce integration** — surface customer order history and live
  order status from Maho Commerce / Magento 1 inline in the reply box.
- **Per-message forwarding** — forward an individual reply to a supplier
  or third party as a fresh email thread.
- **Conversation followers** — notify agents without assigning them.
- **PCI scrubbing** — automatic detection + redaction of card data.

The product is deployed as a single Go binary, with a Vue 3 frontend
embedded via [stuffbin](https://github.com/knadh/stuffbin), and a
Docker Compose stack for PostgreSQL (with `pgvector`) and Redis.

## Stack

- **Backend** — Go 1.22+, [fastglue](https://github.com/zerodha/fastglue)
- **Frontend** — Vue 3, Vite, Pinia, reka-ui
- **Database** — PostgreSQL 17 with `pgvector`
- **Cache / pub-sub** — Redis 7
- **Deployment** — Docker Compose (local build, not the upstream image)

## License

HelperIQ is licensed under **AGPL-3.0**, the same license as upstream
LibreDesk. You may self-host, modify, and redistribute under AGPL terms.
If you run a hosted instance for end-users, AGPL §13 obliges you to make
the source available to those users.

## What's next

- [**Installation**](./installation) — clone, build, run with Docker.
- [**API Reference**](../api-reference/) — REST endpoints + the
  WebSocket protocol for real-time updates.
