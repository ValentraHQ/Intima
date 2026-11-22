# @intima/config

Shared configuration for every INTIMA workspace:

- `tsconfig/base.json`, `tsconfig/node.json`: strict TypeScript bases.
- `eslint`: flat config (`intimaConfig(dirname)`) with `typescript-eslint` strict type-checked rules.
- `eslint/boundaries`: the `intima/module-boundaries` rule (ADR-001). Modules in `apps/api/src/modules/<name>` import each other only through `modules/<name>/index`; apps never import other apps; packages never import apps.

Run the rule tests with `pnpm --filter @intima/config test`.
