# CLAUDE.md: INTIMA

> **INTIMA** · PRODUCT OWNER & ENGINEER: Surely Win Dilag
> Prepared by: Surely Win Dilag · Designation: Product Owner & Engineer · Project: INTIMA · Document Status: Draft

Instructions for Claude Code (CLI and Web) working in this repository. Read `PROJECT_HANDOVER.md` for current status before starting any task.

## 1. Project

- **Product:** INTIMA, a pre-release platform. It is not deployed anywhere.
- **Repository:** `ValentraHQ/Intima` (private). Default branch `main`.
- **Product Owner and Engineer:** Surely Win Dilag (GitHub `Win1817`). They are the sole maintainer and the only approval authority.
- **Governance source of truth:** the decision register at `docs/requirements/decision-register.md`. It arrives in Sprint 1 WP6. Until then, the Phase 0 documents live in the Claude Code Web project for INTIMA, outside this repo (see `PROJECT_HANDOVER.md` §4).

## 2. Approval boundaries (read first)

1. **Work only inside scope the Product Owner has explicitly authorized.** Authorization given in one session or for one work package does not carry over to the next. If the scope is unclear, stop and ask.
2. **Current local authorization (2026-11-22):** repository synchronization and local development handover only. Do **not** start Sprint 1 implementation (WP2 onward), deployment or infrastructure provisioning until the Product Owner authorizes it in the session.
3. Do not merge PRs, force-push, rewrite history, change repository settings, or push to `main` directly unless the Product Owner asks for it in that session.
4. Do not expand scope. If a task needs work outside the authorized package, report it as a proposed change.

## 3. Hard constraints (never relax without a recorded decision)

| Ref | Constraint |
|---|---|
| **D12** | Synthetic, non-explicit data and media only. Never commit or load real user data, performer records, identity documents, adult media or payment data. Video files are git-ignored. Fixtures are generated, not stored. |
| **D14** (Sprint 1 approved with conditions) | No production infrastructure, paid services, `terraform apply` against cloud, or image publishing without explicit Product Owner authorization (condition 4). Tests and security checks must actually run. Do not claim checks that did not run. |
| **D10** | Pending. No Kubernetes or Argo CD cluster exists. Do not create one. |
| Secrets | Never commit secrets. Local `.env` files are git-ignored. CI uses GitHub secrets. Local stack credentials are generated per machine by `infrastructure/docker/init-env.sh`. |
| Illegal content | Suspected illegal content (including CSAM) must never be uploaded, attached or reproduced anywhere in the repo, issues or PRs. |
| Security reports | Report through private GitHub Security Advisories, never public issues. |

## 4. Architecture rules

- Monorepo: pnpm workspaces + Turborepo.
  - `apps/{web,api,media-worker,admin}`
  - `packages/{ui,contracts,config}`
  - `infrastructure/{docker,helm,terraform,argocd}`
  - `docs/`, `tests/`
- **Module boundaries (ADR-001):** `apps/api/src/modules/<name>` is one module. Other modules import it only through `modules/<name>/index`. Apps never import other apps. Packages never import apps. The ESLint rule `intima/module-boundaries` in `@intima/config` enforces this.
- **High-risk paths (ADR-003, ADR-008, D4):** `ledger`, `billing`, `entitlement`, `compliance`, `moderation`, `audit` modules, `apps/api/src/database/migrations/`, `.github/`, `infrastructure/` and the decision register. These are listed in CODEOWNERS. The policy target is 2 reviews. With a single maintainer, high-risk PRs need the Product Owner's explicit approval recorded on the PR.

> The structure and tooling in §4 to §6 arrive with **PR #1 (Sprint 1 WP1)**, which is not merged yet. Until it merges, `main` contains only `README.md` and these handover documents.

## 5. Development standards

- **Runtime:** Node.js 22 (`.nvmrc` = `22`; `engines` = `>=22.12 <23`; `engine-strict=true`). pnpm `10.28.0` via Corepack (`packageManager` field).
- **TypeScript:** strict bases from `@intima/config/tsconfig`.
- **Lint and format:** typescript-eslint strict type-checked flat config, Prettier, EditorConfig.
- **Commands:**
  ```
  corepack enable
  pnpm install --frozen-lockfile
  pnpm build && pnpm typecheck && pnpm lint && pnpm test
  pnpm format:check
  pnpm stack:up | stack:ps | stack:down | stack:reset   # local Docker services, 127.0.0.1 only
  ```
- **Git workflow:** trunk-based. Use short-lived branches from `main` named `<sprint-or-type>/<short-description>` (e.g. `sprint1/wp2-app-skeletons`), and open a PR back to `main`.
- **Commits and PR titles:** Conventional Commits, checked by `pnpm commitlint`.
- **PRs:** fill `.github/pull_request_template.md` completely, including work package, decisions relied on, D14 checklist and evidence. Evidence must be real command output or CI links.
- **Attribution:** the Product Owner disabled Claude co-author attribution (`.claude/settings.json` sets `attribution.commit` and `attribution.pr` to empty). Do not add `Co-Authored-By` or "Generated with" lines.
- **Document headers:** project documents carry the INTIMA header block shown at the top of this file.

## 6. Windows local environment notes

- `stack:*` scripts call `bash` and `rm -rf`. On Windows, set pnpm's script shell to Git Bash once:
  `pnpm config set script-shell "C:\Program Files\Git\bin\bash.exe"`
- Pushing `.github/workflows/*` needs a token with the `workflow` scope: `gh auth refresh -h github.com -s workflow`.
- Branch protection is unavailable on this private repo with the current GitHub plan (API returns 403). Required checks are therefore not enforced, so run the full check suite locally before every PR.

## 7. Reporting

- State outcomes plainly. If a check failed or was skipped, say so with the output.
- Do not claim synchronization, deployment or test success without evidence.
- Escalate blockers to the Product Owner instead of working around approval boundaries.
