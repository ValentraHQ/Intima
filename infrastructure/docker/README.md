# Local development stack

Local-only services for INTIMA development (Sprint 1, T1.4). Every port binds to `127.0.0.1`. Nothing here creates cloud resources or uses paid services.

| Service | Image (pinned) | Local port(s) |
|---|---|---|
| PostgreSQL | `postgres:16.10-alpine` | 5432 |
| Redis | `redis:7.4.6-alpine` | 6379 |
| RabbitMQ | `rabbitmq:4.1.4-management-alpine` | 5672, 15672 (UI) |
| OpenSearch | `opensearchproject/opensearch:2.19.3` (security plugin off, local only) | 9200 |
| S3-compatible storage | `chrislusf/seaweedfs:3.97` | 8333 |
| Keycloak | `keycloak/keycloak:26.4` (`start-dev`) | 8080 |
| Mailpit | `axllent/mailpit:v1.27.10` | 1025 (SMTP), 8025 (UI) |

```bash
pnpm stack:up      # generates .env with random local credentials on first run, then starts and waits for health
pnpm stack:ps      # status
pnpm stack:down    # stop, keep data
pnpm stack:reset   # stop and delete all volumes
```

Credentials are generated per machine by `init-env.sh` into `infrastructure/docker/.env` (git-ignored). No credentials are committed.

**Object storage:** the plan named MinIO, but the official MinIO images are no longer pullable from Docker Hub. SeaweedFS (Apache-2.0, S3 API) is used instead. Object-lock behaviour needed by audit export tests (O2, AU-8) must be confirmed against SeaweedFS when O2 starts.

**Data rule (D12):** only synthetic, non-explicit data may be loaded into this stack.
