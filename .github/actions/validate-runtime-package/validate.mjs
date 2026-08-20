import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const tradejsEntries = (dependencies) =>
  Object.entries(dependencies ?? {}).filter(([name]) =>
    name.startsWith('@tradejs/'),
  );

export const validateRuntimePackageContract = (manifest) => {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new Error('package.json must contain an object');
  }
  if (!/^@tradejs\/[a-z0-9-]+$/.test(String(manifest.name))) {
    throw new Error(`Invalid TradeJS package name: ${manifest.name}`);
  }

  const runtimeDependencies = tradejsEntries(manifest.dependencies);
  if (runtimeDependencies.length > 0) {
    throw new Error(
      `TradeJS runtime packages must be host-provided peers, not dependencies: ${runtimeDependencies
        .map(([name]) => name)
        .sort()
        .join(', ')}`,
    );
  }

  const peerDependencies = new Map(tradejsEntries(manifest.peerDependencies));
  const developmentDependencies = new Map(
    tradejsEntries(manifest.devDependencies),
  );
  if (peerDependencies.size === 0) {
    throw new Error('At least one @tradejs/* peerDependency is required');
  }

  const packageNames = new Set([
    ...peerDependencies.keys(),
    ...developmentDependencies.keys(),
  ]);
  for (const packageName of [...packageNames].sort()) {
    const peerRange = peerDependencies.get(packageName);
    const developmentRange = developmentDependencies.get(packageName);
    if (
      typeof peerRange !== 'string' ||
      !peerRange.trim() ||
      peerRange !== developmentRange
    ) {
      throw new Error(
        `${packageName} must use the same non-empty range in peerDependencies and devDependencies`,
      );
    }
  }
};

const invokedPath = process.argv[1]
  ? pathToFileURL(process.argv[1]).href
  : undefined;
if (invokedPath === import.meta.url) {
  const manifestPath = process.argv[2];
  if (!manifestPath) throw new Error('package.json path is required');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  validateRuntimePackageContract(manifest);
  process.stdout.write(`Validated runtime package contract for ${manifest.name}.\n`);
}
