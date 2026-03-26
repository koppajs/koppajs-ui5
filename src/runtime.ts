import { setLanguage } from "@ui5/webcomponents-base/dist/config/Language.js";
import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";
import { setThemeRoot } from "@ui5/webcomponents-base/dist/config/ThemeRoot.js";
import applyDirection from "@ui5/webcomponents-base/dist/locale/applyDirection.js";

import type { CoreCtx } from "@koppajs/koppajs-core";

import type { KoppajsUi5ResolvedConfig } from "./config";
import { installUi5CustomEventBridge } from "./bridge/ui5-events";
import {
  installUnsupportedBindingWarnings,
  resetUnsupportedBindingWarningsForTests,
} from "./bridge/warnings";
import { resetUi5CustomEventBridgeStateForTests } from "./bridge/ui5-events";
import { ensureKoppajsUi5PackagesLoaded } from "./packages";

type RuntimeState = {
  activeConfig: KoppajsUi5ResolvedConfig | null;
  appliedConfigSignature: string | null;
  initializationPromise: Promise<void> | null;
  hooksRegistered: boolean;
  runtimeConflictWarnings: Set<string>;
};

const runtimeState: RuntimeState = {
  activeConfig: null,
  appliedConfigSignature: null,
  initializationPromise: null,
  hooksRegistered: false,
  runtimeConflictWarnings: new Set<string>(),
};

const CREATED_HOOK = async (): Promise<void> => {
  await ensureKoppajsUi5RuntimeReady();
};

const serializeConfig = (config: unknown): string => JSON.stringify(config);

const mergePackages = (
  current: KoppajsUi5ResolvedConfig,
  next: KoppajsUi5ResolvedConfig,
): KoppajsUi5ResolvedConfig => ({
  ...current,
  packages: Array.from(new Set([...current.packages, ...next.packages])),
  bridge: {
    ui5CustomEvents:
      current.bridge.ui5CustomEvents || next.bridge.ui5CustomEvents,
    warnOnUnsupportedBindings:
      current.bridge.warnOnUnsupportedBindings ||
      next.bridge.warnOnUnsupportedBindings,
  },
  assets: {
    baseUrl: current.assets.baseUrl ?? next.assets.baseUrl,
  },
});

const warnRuntimeConflict = (key: string, message: string): void => {
  if (runtimeState.runtimeConflictWarnings.has(key)) {
    return;
  }

  runtimeState.runtimeConflictWarnings.add(key);
  console.warn(message);
};

const registerRuntimeConfig = (
  config: KoppajsUi5ResolvedConfig,
): KoppajsUi5ResolvedConfig => {
  if (!runtimeState.activeConfig) {
    runtimeState.activeConfig = config;
    return runtimeState.activeConfig;
  }

  const current = runtimeState.activeConfig;
  const merged = mergePackages(current, config);

  if (serializeConfig(current.runtime) !== serializeConfig(config.runtime)) {
    warnRuntimeConflict(
      "runtime",
      "[koppajs-ui5] A second runtime configuration was registered after initialization. " +
        "The first runtime theme/language/RTL/content-density settings stay active.",
    );
  }

  if (
    (current.assets.baseUrl ?? null) !== (config.assets.baseUrl ?? null) &&
    config.assets.baseUrl
  ) {
    warnRuntimeConflict(
      "assets",
      "[koppajs-ui5] A second assets.baseUrl was registered after initialization. " +
        "The first assets.baseUrl stays active in v0.",
    );
  }

  runtimeState.activeConfig = merged;
  return runtimeState.activeConfig;
};

const applyContentDensity = (
  contentDensity: KoppajsUi5ResolvedConfig["runtime"]["contentDensity"],
): void => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const isCompact = contentDensity === "compact";

  root.classList.toggle("ui5-content-density-compact", isCompact);
  root.classList.toggle("sapUiSizeCompact", isCompact);

  if (isCompact) {
    root.setAttribute("data-ui5-compact-size", "");
  } else {
    root.removeAttribute("data-ui5-compact-size");
  }

  root.dataset.koppajsUi5ContentDensity = contentDensity;
};

const applyDocumentRuntimeHints = (config: KoppajsUi5ResolvedConfig): void => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.lang = config.runtime.language;
  document.documentElement.dir = config.runtime.rtl ? "rtl" : "ltr";
  document.documentElement.dataset.koppajsUi5Theme = config.runtime.theme;
  document.documentElement.dataset.koppajsUi5Language = config.runtime.language;

  applyContentDensity(config.runtime.contentDensity);
};

const applyRuntimeConfig = async (
  config: KoppajsUi5ResolvedConfig,
): Promise<void> => {
  applyDocumentRuntimeHints(config);

  if (config.assets.baseUrl) {
    await setThemeRoot(config.assets.baseUrl);
  }

  await setTheme(config.runtime.theme);
  await setLanguage(config.runtime.language);
  await applyDirection();
};

const runInitializationCycle = async (): Promise<void> => {
  while (runtimeState.activeConfig) {
    const config = runtimeState.activeConfig;
    const signature = serializeConfig(config);

    if (signature === runtimeState.appliedConfigSignature) {
      return;
    }

    await ensureKoppajsUi5PackagesLoaded(config.packages);
    await applyRuntimeConfig(config);

    runtimeState.appliedConfigSignature = signature;
  }
};

export const ensureKoppajsUi5RuntimeReady = async (): Promise<void> => {
  if (!runtimeState.activeConfig) {
    return;
  }

  if (!runtimeState.initializationPromise) {
    runtimeState.initializationPromise = runInitializationCycle().finally(
      () => {
        runtimeState.initializationPromise = null;
      },
    );
  }

  await runtimeState.initializationPromise;
};

export const registerKoppajsUi5Runtime = (
  ctx: CoreCtx,
  config: KoppajsUi5ResolvedConfig,
): KoppajsUi5ResolvedConfig => {
  const activeConfig = registerRuntimeConfig(config);

  installUi5CustomEventBridge(
    () => runtimeState.activeConfig?.bridge.ui5CustomEvents ?? true,
  );
  installUnsupportedBindingWarnings(
    () => runtimeState.activeConfig?.bridge.warnOnUnsupportedBindings ?? true,
  );

  if (!runtimeState.hooksRegistered) {
    runtimeState.hooksRegistered = true;
    ctx.registerHook("created", CREATED_HOOK);
  }

  void ensureKoppajsUi5RuntimeReady();

  return activeConfig;
};

export const resetKoppajsUi5RuntimeForTests = (): void => {
  runtimeState.activeConfig = null;
  runtimeState.appliedConfigSignature = null;
  runtimeState.initializationPromise = null;
  runtimeState.hooksRegistered = false;
  runtimeState.runtimeConflictWarnings.clear();
  resetUi5CustomEventBridgeStateForTests();
  resetUnsupportedBindingWarningsForTests();
};
