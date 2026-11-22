# PROJECT_HANDOVER: Claude Code Web → local Windows (Claude Code CLI)

> **INTIMA** · PRODUCT OWNER & ENGINEER: Surely Win Dilag
> Prepared by: Surely Win Dilag · Designation: Product Owner & Engineer · Project: INTIMA · Document Status: Draft

**Handover date:** 2026-11-22
**Local path:** `C:\Users\surely.dilag\Project\Intima`
**Remote:** https://github.com/ValentraHQ/Intima (private, owner `ValentraHQ`)
**Scope of this handover:** repository synchronization and local development handover only. No Sprint 1 implementation, deployment or infrastructure provisioning was performed or is authorized by this handover.

Every statement below is checked against the repository, PR #1 or the local machine unless it is marked **unverified**.

## 1. Completed work

| Item | Status | Evidence |
|---|---|---|
| Phase 0 documentation (requirements, SDD, ADRs, decision register D1 to D14, sprint plan) | Done in the Claude Code Web project | Referenced throughout the WP1 files. **Not in this repo** (see §4). |
| Private repo `ValentraHQ/Intima` created, GitHub Actions enabled (`allowed_actions: all`) | Done | Reported by the Product Owner. Repo confirmed private. Account `Win1817` has admin. |
| `main` initialized | Done | `2d32911` `chore: initialize repository` (README only) |
| **Sprint 1 WP1: repository and tooling (T1.1 to T1.4)** | **Implemented, in review, not merged** | PR #1, branch `sprint1/wp1-repo-tooling`, head `e3b3109`, 57 files, +2514 lines |
| Local clone at `C:\Users\surely.dilag\Project\Intima` | Done | This handover branch |

WP1 contents (PR #1):

- **T1.1** pnpm and Turborepo monorepo layout with placeholder workspaces.
- **T1.2** `@intima/config` package: strict TypeScript and ESLint configuration, the `intima/module-boundaries` rule (ADR-001) and its tests.
- **T1.3** CODEOWNERS, PR template, CONTRIBUTING, SECURITY and commitlint.
- **T1.4** Docker Compose local stack bound to 127.0.0.1: Postgres 16, Redis 7.4, RabbitMQ 4.1, OpenSearch 2.19, SeaweedFS, Keycloak 26.4 and Mailpit.

The WP1 evidence was run in the Web environment. It shows build, typecheck, lint and tests passing, gitleaks clean and `pnpm audit` clean. **It has not been re-run on this Windows machine yet.**

History note: on 2026-11-22 the branches `main` (`a949b43` → `2d32911`) and `sprint1/wp1-repo-tooling` (`f5879c7` → `e3b3109`) were rewritten to remove automatic attribution. The file contents are unchanged. Discard any local clone made before the rewrite.

## 2. Product Owner decisions and approval boundaries (preserved)

These are decisions referenced in repo files. The full text is in the decision register, which is not yet in the repo.

| ID | What the repo records |
|---|---|
| D2, D11 | Relied on by WP1 (PR #1). **Content unverified locally.** |
| D4 | One basis for the high-risk path list in CODEOWNERS. |
| D10 | **Pending.** No cluster. Argo CD and Helm are placeholders. |
| D12 | Synthetic, non-explicit data and media only. |
| D14 | Sprint 1 **Approved with Conditions**. No production infrastructure, paid services, cloud Terraform or image publishing (condition 4). Tests and security checks must run, with honest evidence. |
| ADR-001 | Module boundaries, enforced by an ESLint rule. |
| ADR-003, ADR-008 | High-risk paths need code-owner review. |
| Review policy | Target is 2 reviews on high-risk paths. With a single maintainer, the Product Owner's explicit approval must be recorded on the PR. |
| Attribution | Claude co-author and PR attribution disabled. |

**Current boundary:** the local CLI session is authorized for sync and handover only. Each subsequent work package needs explicit Product Owner authorization in the session.

## 3. Pending decisions (Product Owner)

1. **Review and merge (or request changes on) PR #1 (WP1).** It is the gate for all further Sprint 1 work.
2. **CI workflow:** `.github/workflows/ci.yml` was prepared in the Web session but never pushed, because the Web integration token lacked the `workflow` scope. The file is **not in GitHub and not on this machine**. Decide whether to recover it from the Web session or have it re-authored, then push it from the CLI with a `workflow`-scoped token.
3. **D10** (deployment and cluster) is still pending.
4. **Object storage:** SeaweedFS replaced MinIO because the official MinIO images can no longer be pulled from Docker Hub. Object-lock behaviour for audit export (O2, AU-8) must be confirmed when O2 starts.
5. **Branch protection:** the GitHub plan returns 403 for branch protection on this private repo. Options are to upgrade the plan or accept unenforced checks with local verification.
6. **CodeRabbit** is on the Free plan and rate-limited, so automated PR review is partial. Optional.

## 4. Files that could not be transferred

The Phase 0 document set and the CI workflow exist only in the Claude Code Web project or session environment. This local CLI session has no access to that environment, so they were **not** pushed:

- `docs/requirements/decision-register.md` (D1 to D14), the requirements, the SDD (referenced as "SDD §3"), ADR-001 to ADR-008 and the Sprint 1 plan (WP1 to WP6, O2, AU-8).
- `.github/workflows/ci.yml`.

**To recover them:** in the INTIMA Claude Code Web project, ask the thread to commit the Phase 0 documents to a branch of `ValentraHQ/Intima` (for example `docs/phase0-import`) and open a PR. Committing the CI workflow from there needs the `workflow` scope, so it is easier to copy the file contents and commit them locally. The plan places the Phase 0 import in Sprint 1 WP6. Doing it earlier needs Product Owner approval.

## 5. Dependencies (local machine, checked 2026-11-22)

| Tool | Required | Found | Action |
|---|---|---|---|
| Git | any recent | 2.56.0 | OK |
| GitHub CLI | authenticated | 2.104.0, `Win1817`, scopes `repo, read:org, gist` | Add `workflow` scope before pushing CI files |
| Node.js | `>=22.12 <23` (engine-strict) | **v24.22.3** | **Install Node 22.** `pnpm install` will refuse Node 24. |
| pnpm | 10.28.0 via Corepack | **not installed** | `corepack enable` (under Node 22) |
| Docker + Compose v2 | yes | Docker 29.9.2 | OK (the WP1 evidence used 29.10) |
| Bash for `stack:*` scripts | Git Bash | `C:\Program Files\Git\bin\bash.exe` | `pnpm config set script-shell` (see CLAUDE.md §6) |

## 6. Blockers

- **B1:** Phase 0 documents are not in the repo (§4). Local sessions cannot read the decision register.
- **B2:** The CI workflow is missing, and checks cannot be enforced on PRs (§3.2, §3.5).
- **B3:** The local Node version is incompatible (v24 instead of 22).

## 7. Next authorized milestone

**Authorized now:** local environment readiness only. This means cloning, installing the toolchain, and optionally running WP1 verification read-only from the PR branch. It does not mean changing the PR.

**Next planned milestone, which needs explicit Product Owner authorization:**

1. The Product Owner reviews and merges PR #1 (WP1).
2. Push the CI workflow and recover the Phase 0 documents.
3. Sprint 1 **WP2** (real application skeletons replacing the placeholders).

WP4 brings the test harness and WP6 brings the documentation import. Do not start any of these until the Product Owner says so.
