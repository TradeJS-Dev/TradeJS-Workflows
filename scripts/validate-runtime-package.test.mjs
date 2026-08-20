import assert from 'node:assert/strict';
import test from 'node:test';
import { validateRuntimePackageContract } from '../.github/actions/validate-runtime-package/validate.mjs';

const validManifest = {
  name: '@tradejs/strategy-example',
  dependencies: { zod: '^4.0.0' },
  peerDependencies: {
    '@tradejs/core': '^3.0.1',
    '@tradejs/types': '^3.0.1',
  },
  devDependencies: {
    '@tradejs/core': '^3.0.1',
    '@tradejs/types': '^3.0.1',
    typescript: '^5.9.0',
  },
};

test('accepts host-provided TradeJS peers with standalone development copies', () => {
  assert.doesNotThrow(() => validateRuntimePackageContract(validManifest));
});

test('rejects a packaged TradeJS runtime dependency', () => {
  assert.throws(
    () =>
      validateRuntimePackageContract({
        ...validManifest,
        dependencies: { '@tradejs/core': '^3.0.1' },
      }),
    /host-provided peers, not dependencies: @tradejs\/core/,
  );
});

test('rejects a peer that standalone checks do not install', () => {
  assert.throws(
    () =>
      validateRuntimePackageContract({
        ...validManifest,
        devDependencies: { '@tradejs/types': '^3.0.1' },
      }),
    /@tradejs\/core must use the same non-empty range/,
  );
});

test('rejects a development version that differs from the consumer contract', () => {
  assert.throws(
    () =>
      validateRuntimePackageContract({
        ...validManifest,
        devDependencies: {
          ...validManifest.devDependencies,
          '@tradejs/core': '^4.0.0',
        },
      }),
    /@tradejs\/core must use the same non-empty range/,
  );
});
