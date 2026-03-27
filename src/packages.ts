import { ui5PackageLoaders } from "./generated/ui5-package-manifests";
import type { KoppajsUi5Package } from "./config";

const packageLoadPromises = new Map<KoppajsUi5Package, Promise<void>>();

export const officialUi5PackageNames: Record<KoppajsUi5Package, string> = {
  main: "@ui5/webcomponents",
  fiori: "@ui5/webcomponents-fiori",
  compatibility: "@ui5/webcomponents-compat",
  ai: "@ui5/webcomponents-ai",
};

const loadUi5Package = (packageName: KoppajsUi5Package): Promise<void> => {
  const existingPromise = packageLoadPromises.get(packageName);
  if (existingPromise) {
    return existingPromise;
  }

  const [assetLoader, ...componentLoaders] = ui5PackageLoaders[packageName];

  const promise = (async () => {
    if (assetLoader) {
      await assetLoader();
    }

    await Promise.all(componentLoaders.map((loadModule) => loadModule()));
  })().catch((error) => {
    packageLoadPromises.delete(packageName);

    throw new Error(
      `[koppajs-ui5] Failed to load UI5 package "${packageName}" (${officialUi5PackageNames[packageName]}).`,
      { cause: error },
    );
  });

  packageLoadPromises.set(packageName, promise);
  return promise;
};

export const ensureKoppajsUi5PackagesLoaded = async (
  packages: readonly KoppajsUi5Package[],
): Promise<void> => {
  await Promise.all(packages.map((packageName) => loadUi5Package(packageName)));
};
