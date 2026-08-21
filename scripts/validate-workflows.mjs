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
if (publish.includes('confirm-promotion')) {
  fail('strategy publication must not require redundant manual confirmation');
}
for (const required of [
  'id-token: write',
  "inputs.channel == 'beta'",
  "inputs.channel == 'stable'",
  'beta-candidate',
  'Verify published package in a clean consumer',
  'consumer_root="$(mktemp -d)"',
  'npm install --ignore-scripts --no-audit --no-fund',
  'await import(publicSpecifier)',
  'npm dist-tag add',
  'stable-candidate',
  'npm publish --access public --provenance',
  'main release inputs advanced beyond the verified beta',
  'Validate host-provided TradeJS runtime contract',
  'validate-runtime-package@v1',
  'Validate npm release credentials',
]) {
  if (!publish.includes(required)) {
    fail(`strategy-publish.yml is missing ${required}`);
  }
}

if (
  publish.indexOf('Validate host-provided TradeJS runtime contract') >
  publish.indexOf('Publish beta candidate with provenance')
) {
  fail('strategy dependency contract must be validated before beta publication');
}
if (!/npm-token:\n\s+description:[^\n]+\n\s+required: true/.test(publish)) {
  fail('strategy publication must require npm-token');
}
if (
  publish.indexOf('Verify published package in a clean consumer') >
  publish.indexOf('Mark the verified candidate as current beta')
) {
  fail('strategy beta tag moved before clean-consumer validation');
}
if (
  publish.indexOf('Verify stable package') >
  publish.indexOf('Promote verified stable candidate to latest')
) {
  fail('strategy stable tag moved before stable package validation');
}

for (const forbidden of [
  'TradeJS-Project.git',
  'beta-runtime-smoke.sh',
  'docker build',
]) {
  if (publish.includes(forbidden)) {
    fail(`strategy publication crosses the Project boundary: ${forbidden}`);
  }
}

const monorepoPublish = readRequired(
  '.github/workflows/monorepo-package-publish.yml',
);
if (!/npm-token:\n\s+description:[^\n]+\n\s+required: true/.test(monorepoPublish)) {
  fail('monorepo publication must require npm-token');
}
for (const required of [
  'id-token: write',
  'Validate unpublished package identity',
  'Validate npm release credentials',
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
