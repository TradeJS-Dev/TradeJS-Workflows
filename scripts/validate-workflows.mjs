import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reusableFiles = [
  '.github/workflows/monorepo-package-publish.yml',
  '.github/workflows/strategy-ci.yml',
  '.github/workflows/strategy-publish.yml',
];

const fail = (message) => {
  throw new Error(message);
};

const readRequired = (relativePath) => {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) fail(`Missing ${relativePath}`);
  return fs.readFileSync(absolutePath, 'utf8');
};

for (const relativePath of [
  'README.md',
  'AGENTS.md',
  '.github/workflows/self-check.yml',
  ...reusableFiles,
]) {
  readRequired(relativePath);
}

for (const relativePath of reusableFiles) {
  const source = readRequired(relativePath);
  if (!source.includes('workflow_call:')) {
    fail(`${relativePath} must declare workflow_call`);
  }
  if (!source.includes('permissions:')) {
    fail(`${relativePath} must declare explicit permissions`);
  }
}

const publish = readRequired('.github/workflows/strategy-publish.yml');
for (const required of [
  'id-token: write',
  "github.event_name == 'release'",
  'npm publish --access public --provenance',
]) {
  if (!publish.includes(required)) {
    fail(`strategy-publish.yml is missing ${required}`);
  }
}

const monorepoPublish = readRequired(
  '.github/workflows/monorepo-package-publish.yml',
);
for (const required of [
  'id-token: write',
  'Validate unpublished package identity',
  'yarn workspace "$WORKSPACE" npm publish',
  '--provenance',
]) {
  if (!monorepoPublish.includes(required)) {
    fail(`monorepo-package-publish.yml is missing ${required}`);
  }
}

const workflowSources = fs
  .readdirSync(path.join(root, '.github/workflows'))
  .filter((name) => name.endsWith('.yml'))
  .map((name) => readRequired(`.github/workflows/${name}`));
const allWorkflows = workflowSources.join('\n');

for (const forbidden of [
  'pull_request_target:',
  'secrets: inherit',
  'permissions: write-all',
  'TradeJS-Workflows/.github/workflows/strategy-ci.yml@main',
  'TradeJS-Workflows/.github/workflows/strategy-publish.yml@main',
]) {
  if (allWorkflows.includes(forbidden)) {
    fail(`Forbidden workflow construct: ${forbidden}`);
  }
}

console.log('Validated reusable TradeJS CI and npm release workflows.');
