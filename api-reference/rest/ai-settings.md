# AI Settings

::: warning Stub
This page is a placeholder. Full reference coming soon.
:::

| Method | Path | Permission |
| --- | --- | --- |
| `GET` | `/api/v1/settings/ai` | `ai:manage` |
| `PUT` | `/api/v1/settings/ai` | `ai:manage` |
| `GET` | `/api/v1/settings/ai/inbox/{id}` | `ai:manage` |
| `PUT` | `/api/v1/settings/ai/inbox/{id}` | `ai:manage` |
| `DELETE` | `/api/v1/settings/ai/inbox/{id}` | `ai:manage` |

The global endpoints manage the default AI provider, model, API key,
embedding model, and system prompt. The per-inbox endpoints let you
override any of these for a specific inbox — the "Sales" inbox can use
GPT-4o while "Support" uses Claude Sonnet, with different system prompts.

When `/api/v1/rag/generate` is called for a conversation, the per-inbox
override takes precedence if present; otherwise the global config is
used.
