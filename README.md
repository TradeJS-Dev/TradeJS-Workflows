# TradeJS Workflows

Reusable GitHub Actions workflows for independently versioned TradeJS strategy
repositories.

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

## Checks

```bash
yarn install --immutable
yarn checks
```

The validator rejects branch-pinned reusable calls, `secrets: inherit`, broad
write permissions, and publishing outside a GitHub release event.
