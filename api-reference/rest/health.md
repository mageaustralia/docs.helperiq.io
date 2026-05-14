# Health

```
GET /health
```

Liveness probe. Returns `200 OK` with no body when the HTTP server is
up and the database connection pool can issue a `SELECT 1`. Returns
`503` otherwise.

**No authentication required** — meant for Kubernetes/Docker health
checks, AWS ELB target groups, uptime monitors, etc.

```http
GET /health HTTP/1.1
Host: helperiq.example.com

HTTP/1.1 200 OK
Content-Length: 0
```

## What `/health` checks

| Check | Failure mode |
| --- | --- |
| HTTP server responding | Process crashed → no response, monitor times out |
| Database connection | `SELECT 1` against the pool → `503` if all connections exhausted or DB unreachable |

## What `/health` does NOT check

To keep the probe fast and reliable, it deliberately does not check:

- Redis (the app degrades gracefully without it — cache misses get rebuilt)
- Outgoing SMTP credentials (those can be down without the app being
  unhealthy from a user's perspective)
- AI provider connectivity (same — AI features fail soft, app still
  works for reply/triage)
- Disk space, file uploads, etc.

If you want a deeper probe, hit a real endpoint with an API key (e.g.
`GET /api/v1/agents/me`) — that will additionally exercise session
handling, permissions, and a real DB read against the `users` table.

## Recommended monitor config

**Kubernetes:**

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 9000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 3
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health
    port: 9000
  initialDelaySeconds: 5
  periodSeconds: 5
```

**AWS ELB target group:** path `/health`, healthy threshold 2,
interval 15s.

**Uptime-monitor services** (UptimeRobot, BetterStack, etc.): poll
every 60s.
