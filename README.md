# HelperIQ Documentation

Source for the HelperIQ documentation site at [docs.helperiq.io](https://docs.helperiq.io).

Built with [VitePress](https://vitepress.dev/) and deployed to Cloudflare Pages.

## Local development

```bash
npm install
npm run dev
```

Then open <http://localhost:5173>.

## Build

```bash
npm run build
npm run preview   # serve the built site locally for sanity check
```

## Deploy

```bash
npm run deploy
```

(Requires `wrangler login` with the Cloudflare account that owns the
`docs-helperiq-io` Pages project.)

## Structure

- `index.md` — landing page
- `getting-started/` — install, quickstart
- `configuration/` — `config.toml`, inboxes, AI providers, RAG, ecommerce
- `features/` — overview of differentiating features
- `api-reference/` — REST + WebSocket reference
- `contributing/` — developer setup, contribution guide
- `.vitepress/config.ts` — site config, nav, sidebar

## License

Documentation content released under AGPL-3.0, matching the HelperIQ application.
