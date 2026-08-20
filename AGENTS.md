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
- Use OIDC trusted publishing for provenance and require the scoped `npm-token`
  release credential up front for post-smoke dist-tag operations. Never continue
  with a partially authenticated release path.
- Do not use `secrets: inherit`.
- Keep reusable callers pinned to the stable `v1` ref.
- Monorepo callers must hard-code the workspace name and package directory.
- Keep strategy publication beta-first and stable promotion weekly. Production
  declarations and exact dependencies belong to the downstream
  `TradeJS-Project` commit. Runtime identifiers are computed from that verified
  composition; reusable publication workflows must never invent versions,
  publish Project images, or write runtime Redis state.
- Validate a beta package by installing its published tarball and declared peers
  in a clean npm consumer and importing a public export. Do not clone Project,
  build application images, or start exchange-facing daemons from a package
  release workflow. Project owns composition and image smoke tests after stable
  dependency synchronization.
- Reject caller packages that place `@tradejs/*` in `dependencies`, or whose
  TradeJS `peerDependencies` and `devDependencies` use different ranges.

## Verification

Run `yarn checks` before every commit.
