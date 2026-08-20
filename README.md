# TradeJS Workflows

Reusable GitHub Actions workflows for independently versioned TradeJS strategy
repositories and explicitly selected packages in the TradeJS monorepo.

Callers must pin the stable `v1` ref rather than `main`:

```yaml
jobs:
  ci:
    uses: TradeJS-Dev/TradeJS-Workflows/.github/workflows/strategy-ci.yml@v1
```

`strategy-publish.yml` is a beta-first release train. A caller push publishes a
unique next-patch `*-beta.<run>` candidate, verifies it inside the production-like
`TradeJS-Project` image, and only then moves the npm `beta` tag. Its separate
weekly channel promotes the current verified beta to one stable patch under
`latest`; production never installs a prerelease. The optional `npm-token`
secret exists only for registries that have not enabled npm trusted publishing.
Never pass install tokens or production credentials to these workflows.

Package documentation is part of the verified candidate. Standalone callers
should trigger this workflow for `README.md` and `docs/**` changes so the npm
package page and packaged documentation advance with the source repository.

Stable promotion does not mutate production Redis or deploy a strategy by
itself. `TradeJS-Project` performs the weekly stable dependency sync; when a
declared strategy package or shared runtime package changes, that Project
commit also increments the affected Git-owned runtime strategy `version`, runs
its production-like image smoke, and publishes one immutable app image.

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
