# AI

These endpoints power the in-line AI transform actions in the reply
editor (Improve writing, Make shorter, Fix grammar, Translate, etc.) and
manage the AI provider configuration. They are **separate from the RAG
endpoints** — RAG is HelperIQ's knowledge-base-augmented reply
generation pipeline and lives under [`/api/v1/rag`](./rag).

| Method | Path | Permission |
| --- | --- | --- |
| `GET` | `/api/v1/ai/prompts` | authenticated |
| `POST` | `/api/v1/ai/completion` | authenticated |
| `GET` | `/api/v1/ai/providers` | `ai:manage` |
| `GET` | `/api/v1/ai/providers/supported` | `ai:manage` |
| `GET` | `/api/v1/ai/models` | `ai:manage` |
| `PUT` | `/api/v1/ai/provider` | `ai:manage` |
| `PUT` | `/api/v1/ai/provider/default` | `ai:manage` |
| `POST` | `/api/v1/ai/provider/test` | `ai:manage` |

## Get AI prompts

```
GET /api/v1/ai/prompts
```

Returns the built-in prompt library shown in the reply editor's
BubbleMenu. These are the "Improve writing", "Fix grammar", etc.
prompts that transform the agent's selected text.

```json
{
  "data": [
    { "key": "improve_writing", "title": "Improve writing", "icon": "sparkles" },
    { "key": "fix_grammar",     "title": "Fix grammar",     "icon": "spell-check" },
    { "key": "shorten",         "title": "Make shorter",    "icon": "minimize" },
    { "key": "expand",          "title": "Make longer",     "icon": "maximize" },
    { "key": "friendly",        "title": "Friendlier tone", "icon": "smile" },
    { "key": "professional",    "title": "Professional tone", "icon": "briefcase" },
    { "key": "translate",       "title": "Translate",       "icon": "languages" }
  ]
}
```

## AI completion

```
POST /api/v1/ai/completion
```

Runs a prompt against the configured default AI provider. Used by every
in-editor AI action.

**Body:**

| Field | Type | Description |
| --- | --- | --- |
| `prompt_key` | string | One of the keys from `GET /ai/prompts`. Resolves server-side to the actual system prompt template. |
| `text` | string | The text to transform (usually the agent's editor selection). |
| `target_language` | string | Only for `prompt_key: "translate"`. ISO 639-1 code (`en`, `es`, `de`, etc.) or full name. |

**Response:**

```json
{
  "data": {
    "completion": "Hi Linda,\n\nThanks for getting in touch…"
  }
}
```

Errors:

- `400 InputError` — unknown `prompt_key`, empty `text`, missing
  `target_language` for translation.
- `500 GeneralError` — provider API call failed (network, quota,
  authentication). Error string includes the upstream provider's
  message where safe to expose.

::: tip Difference vs RAG
`/ai/completion` runs a single prompt over a single text input. No
conversation context, no knowledge base lookup, no ecommerce data.
For full conversational reply generation grounded in your knowledge
base, see [`POST /api/v1/rag/generate`](./rag#generate-a-reply).
:::

## Provider management

These manage the global AI provider configuration shown under
**Admin → AI** in the UI.

### List configured providers

```
GET /api/v1/ai/providers
```

Returns all providers the admin has set up, with API keys masked.

```json
{
  "data": [
    { "id": 1, "type": "openai",     "label": "OpenAI",     "default": false, "configured": true,  "model": "gpt-4o-mini" },
    { "id": 2, "type": "openrouter", "label": "OpenRouter", "default": true,  "configured": true,  "model": "anthropic/claude-sonnet-4.6" },
    { "id": 3, "type": "claude",     "label": "Claude",     "default": false, "configured": false }
  ]
}
```

### List supported provider types

```
GET /api/v1/ai/providers/supported
```

Static — the providers HelperIQ knows how to talk to. Currently
`openai`, `claude` (direct Anthropic API), `openrouter`.

```json
{ "data": ["openai", "claude", "openrouter"] }
```

### List available models

```
GET /api/v1/ai/models?provider=openrouter
```

For `openrouter` this hits OpenRouter's `/models` API to enumerate the
100+ available models. For `openai` and `claude` it returns a curated
hard-coded list of recommended models.

```json
{
  "data": [
    { "id": "anthropic/claude-sonnet-4.6", "name": "Claude Sonnet 4.6" },
    { "id": "openai/gpt-4o-mini",          "name": "GPT-4o mini" },
    …
  ]
}
```

### Add / update provider

```
PUT /api/v1/ai/provider
```

**Body:**

| Field | Type | Notes |
| --- | --- | --- |
| `type` | string | One of the supported types. |
| `api_key` | string | The provider's API key (sk-…, etc.). Stored encrypted at rest. |
| `model` | string | Default model name. Optional. |
| `extras` | object | Provider-specific extras (e.g. `{ "base_url": "..." }` for OpenAI-compatible proxies). |

Upserts by `type` — calling with the same `type` updates the existing
record.

### Set the default provider

```
PUT /api/v1/ai/provider/default
{ "type": "openrouter" }
```

The "default" provider is the one used by `/ai/completion`,
`/rag/generate`, and the reply-box AI actions. Multiple providers can
be configured simultaneously — only one is default at a time.

### Test a provider's credentials

```
POST /api/v1/ai/provider/test
{ "type": "openai", "api_key": "sk-…", "model": "gpt-4o-mini" }
```

Sends a 1-token "hello" completion to validate the API key works. Used
by the "Test connection" button under each provider card.

**Response:**

```json
{ "data": { "ok": true, "model": "gpt-4o-mini", "latency_ms": 412 } }
```

Errors return `400 InputError` with a human-readable reason
(`"invalid_api_key"`, `"quota_exceeded"`, etc.).

## Related

- [AI Settings](./ai-settings) — global default system prompt + per-inbox
  AI overrides.
- [RAG / Knowledge Base](./rag) — the retrieval-augmented reply
  generation pipeline.
