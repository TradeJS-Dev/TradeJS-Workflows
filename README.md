# TradeJS Workflows

Reusable GitHub Actions workflows for independently versioned TradeJS strategy
repositories and explicitly selected packages in the TradeJS monorepo.

Callers must pin the stable `v1` ref rather than `main`:

```yaml
jobs:
  ci:
    uses: TradeJS-Dev/TradeJS-Workflows/.github/workflows/strategy-ci.yml@v1
```

`strategy-publish.yml` supports npm trusted publishing through GitHub OIDC. The
optional `npm-token` secret exists only for the first publication or a registry
that has not been configured as a trusted publisher. Never pass install tokens
or production credentials to these workflows.

`monorepo-package-publish.yml` publishes one caller-selected Yarn workspace. It
checks the workspace identity, refuses an already published version, runs the
caller's complete `yarn checks`, and publishes with provenance. A caller should
hard-code both `workspace-name` and `package-directory`; do not expose them as
free-form dispatch inputs.

## Checks

```bash
yarn install --immutable
yarn checks
```

The validator rejects branch-pinned reusable calls, `secrets: inherit`, and
broad write permissions. It also checks the release guard for standalone
strategy packages and the identity guard for monorepo packages.

Keywords: ai, claude, codex.
