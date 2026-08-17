# AGENTS.md

## Scope

These rules apply to the TradeJS reusable-workflows repository.

## Boundaries

- Keep workflows package-neutral.
- Callers own package source, package metadata, and release decisions.
- This repository owns CI and npm publication mechanics only.
- Never add deployment, exchange, database, AI-provider, or production secrets.
- Prefer OIDC trusted publishing. `npm-token` is an optional bootstrap fallback.
- Do not use `secrets: inherit`.
- Keep reusable callers pinned to the stable `v1` ref.
- Monorepo callers must hard-code the workspace name and package directory.

## Verification

Run `yarn checks` before every commit.
