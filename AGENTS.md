# AGENTS.md

## Scope

These rules apply to the TradeJS reusable-workflows repository.

## Workspace Routing

- Start from `~/dev/tradejs/AGENTS.md`; do not scan sibling repositories.
- Change reusable CI/npm publication mechanics here. Package source and
  release decisions remain in the caller repository; application deployment
  remains in `tradejs-project` and `tradejs-deploy`.
- Run `yarn checks` here and inspect only the affected caller when validating a
  caller-specific contract.

## Boundaries

- Keep workflows package-neutral.
- Callers own package source, package metadata, and release decisions.
- This repository owns CI and npm publication mechanics only.
- Never add deployment, exchange, database, AI-provider, or production secrets.
- Prefer OIDC trusted publishing. `npm-token` is an optional bootstrap fallback.
- Do not use `secrets: inherit`.
- Keep reusable callers pinned to the stable `v1` ref.
- Monorepo callers must hard-code the workspace name and package directory.
- Keep strategy publication beta-first and stable promotion weekly. Production
  declarations and exact dependencies belong to the downstream
  `TradeJS-Project` commit. Runtime identifiers are computed from that verified
  composition; reusable publication workflows must never invent versions,
  publish Project images, or write runtime Redis state.
- Reject caller packages that place `@tradejs/*` in `dependencies`, or whose
  TradeJS `peerDependencies` and `devDependencies` use different ranges.

## Verification

Run `yarn checks` before every commit.
