# Contributing

::: warning Stub
Full contributor guide coming soon.
:::

## Reporting issues

File bugs and feature requests on the
[GitHub issue tracker](https://github.com/mageaustralia/libredesk/issues).

When reporting a bug, include:

- HelperIQ version (footer of any admin page, or `./libredesk --version`).
- Browser + OS for UI bugs.
- Steps to reproduce.
- Relevant logs (`docker compose logs app | tail -200`).

## Development setup

See [Getting Started → Installation](../getting-started/installation) for
the production install. For development:

```shell
# Backend (with hot rebuild via air/reflex of your choice)
go run ./cmd/

# Frontend (Vite dev server with HMR on :8000, proxying to backend on :9000)
cd frontend
pnpm install
pnpm dev:main
```

::: tip Dev-server quirks
The Vite dev server on `:8000` is known to amplify some reactive
cascades vs the production build on `:9000` (built + served via Docker
+ Caddy/nginx). When something looks broken on `:8000`, test the same
flow on `:9000` before concluding it's a real bug.
:::

## Pull requests

- Branch off `v2.1.1-plus-enhancements` (or whatever the current release
  branch is).
- Keep PRs focused — one feature/fix per PR.
- Go code: run `gofmt -w` and `go vet` before pushing.
- Frontend: existing code uses tabs in Vue templates and 2-space in JS.
  Follow surrounding style.
- Test PRs against `:9000` (production build), not just `:8000`.

## License

By contributing you agree your changes are licensed under AGPL-3.0 to
match the rest of the project.
