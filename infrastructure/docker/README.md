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
pnpm stack:reset   # stop, delete all volumes and the generated .generated/ files (.env is kept)
```

**Bash and OpenSSL are required** for `stack:up` and `stack:env`, because they run `init-env.sh`. On Linux and macOS they are already present. On Windows, use Git for Windows (Git Bash ships `bash` and `openssl`) or WSL, and make sure `bash` on `PATH` resolves to one of them: run `where bash` in `cmd`. If only `C:\Windows\System32\bash.exe` appears, that is the WSL launcher and needs a WSL distribution with `openssl`. The other stack scripts use only Docker and Node, so they work in any shell.

Credentials are generated per machine by `init-env.sh` into `infrastructure/docker/.env` (git-ignored). No credentials are committed.

**File permissions:** on Linux and macOS, `init-env.sh` makes `.env` and `.generated/s3.json` readable by your user only (mode 600, `.generated/` mode 700). On Windows the checkout usually sits on NTFS, where these modes are not enforced: Git Bash ignores `chmod`, and WSL applies it only on drives mounted with the `metadata` option. There, access is governed by the NTFS permissions of your user profile, so keep the checkout inside your own profile folder (for example `C:\Users\<you>\...`), not in a shared location.

**Object storage:** the plan named MinIO, but the official MinIO images are no longer pullable from Docker Hub. SeaweedFS (Apache-2.0, S3 API) is used instead. Object-lock behaviour needed by audit export tests (O2, AU-8) must be confirmed against SeaweedFS when O2 starts.

**Data rule (D12):** only synthetic, non-explicit data may be loaded into this stack.
