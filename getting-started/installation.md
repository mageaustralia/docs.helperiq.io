# Installation

HelperIQ is designed for self-hosting via Docker Compose with a locally-built
Go binary. The upstream `libredesk/libredesk` image is **not** used — the
included `Dockerfile` is a thin Alpine layer that expects a pre-built
`libredesk` binary in the build context.

## Prerequisites

- Docker + Docker Compose v2
- Go 1.22+ (for compiling the binary)
- Node 20+ and `pnpm` (for compiling the frontend)
- `make`
- ~2 GB RAM minimum; ~4 GB recommended for the frontend build step

## Docker (recommended)

```shell
git clone https://github.com/mageaustralia/libredesk.git helperiq
cd helperiq

# Pin to a release branch.
git checkout v2.1.1-plus-enhancements

cp config.sample.toml config.toml
# Edit config.toml as needed (database URL, redis URL, etc).

# Compile the binary. The Dockerfile copies a pre-built binary in,
# rather than compiling Go inside the container, so this step is required.
make

docker compose up -d

# Set the System user password on first boot.
docker exec -it libredesk_app ./libredesk --set-system-user-password
```

Open <http://localhost:9000> and sign in as `System` with the password you set.

::: tip Memory-constrained builds
Frontend compilation (`pnpm build`) wants ~4 GB of RAM. If you're deploying
to a small VPS, build the frontend on your local machine and rsync the
resulting `dist/` to the server before running `make` there. See
`deploy.sh` for an example.
:::

## What gets built

`make` runs the default target which:

1. Installs `stuffbin` if missing.
2. Compiles the Vue frontend with Vite (`pnpm build`).
3. Compiles the Go backend with version info embedded via `ldflags`.
4. Runs `stuffbin` to embed `frontend/dist/`, `i18n/`, `schema.sql`, and
   `static/` into the resulting binary.

The output is a single `libredesk` binary containing everything.

## Database schema

On first start the binary creates the schema from the embedded `schema.sql`.
The `pgvector` extension must be available on the database — the
`pgvector/pgvector:pg17` image in `docker-compose.yml` includes it.

## Next steps

- [Configuration](../configuration/) — `config.toml` options, inbox setup,
  AI providers, knowledge sources, ecommerce integration.
- [API Reference](../api-reference/) — REST and WebSocket APIs.
