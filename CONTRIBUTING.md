# Contributing to INTIMA

> **INTIMA** · PRODUCT OWNER & ENGINEER: Surely Win Dilag
> Prepared by: Surely Win Dilag · Designation: Product Owner & Engineer · Project: INTIMA · Document Status: Draft

## Ground rules

1. Work only inside approved scope (see `docs/requirements/decision-register.md`).
2. **Synthetic, non-explicit data and media only (D12).** Never commit real user data, performer records, identity documents, adult media or payment data. Video files are git-ignored; fixtures are generated.
3. Never commit secrets. Use `.env` files locally (git-ignored); CI uses GitHub secrets.
4. No production infrastructure, paid services, `terraform apply` against cloud, or image publishing without explicit Product Owner authorization.

## Workflow

- Trunk-based: short-lived branches from `main`, pull request back to `main`.
- Branch names: `<sprint-or-type>/<short-description>`, e.g. `sprint1/wp1-repo-tooling`.
- Commits and PR titles follow [Conventional Commits](https://www.conventionalcommits.org/) (`pnpm commitlint` checks them).
- Every PR fills the template, links CI evidence, and must pass all required checks.

## Review policy

- Target: 2 approving reviews for `ledger`, `billing`, `entitlement`, `compliance`, `moderation`, `audit`, migrations and CI/infrastructure; 1 review elsewhere.
- **Current limitation:** INTIMA has one maintainer, so the 2-review target cannot be enforced yet. Until a second reviewer exists, high-risk PRs need the Product Owner's explicit approval recorded on the PR.

## Local setup

```bash
corepack enable          # uses pnpm version pinned in package.json
pnpm install
pnpm build && pnpm lint && pnpm typecheck
pnpm stack:up            # local services in Docker (see infrastructure/docker)
pnpm stack:reset         # stop and delete all local data
```

Requirements: Node.js 22 (`.nvmrc`), Docker with Compose v2.

## Module boundaries

`apps/api/src/modules/<name>` is one module. Other modules import it only through `modules/<name>/index`. Apps never import other apps, and packages never import apps. ESLint rule `intima/module-boundaries` enforces this.
