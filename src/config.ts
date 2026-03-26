export type KoppajsUi5Package = "main" | "fiori" | "compatibility" | "ai";

export type KoppajsUi5ContentDensity = "cozy" | "compact";

export type KoppajsUi5RuntimeConfig = {
  theme?: string;
  language?: string;
  rtl?: boolean;
  contentDensity?: KoppajsUi5ContentDensity;
};

export type KoppajsUi5AssetsConfig = {
  baseUrl?: string;
};

export type KoppajsUi5BridgeConfig = {
  ui5CustomEvents?: boolean;
  warnOnUnsupportedBindings?: boolean;
};

export type KoppajsUi5ConfigInput = {
  packages?: KoppajsUi5Package[];
  runtime?: KoppajsUi5RuntimeConfig;
  assets?: KoppajsUi5AssetsConfig;
  bridge?: KoppajsUi5BridgeConfig;
};

export type KoppajsUi5ResolvedConfig = {
  packages: KoppajsUi5Package[];
  runtime: Required<KoppajsUi5RuntimeConfig>;
  assets: KoppajsUi5AssetsConfig;
  bridge: Required<KoppajsUi5BridgeConfig>;
};

const DEFAULT_PACKAGES: KoppajsUi5Package[] = ["main", "fiori"];
const DEFAULT_THEME = "sap_horizon";
const DEFAULT_CONTENT_DENSITY: KoppajsUi5ContentDensity = "cozy";

const deriveDocumentLanguage = (): string | null => {
  if (typeof document !== "undefined") {
    const candidates = [document.documentElement.lang, document.body?.lang];
    const language = candidates.find(
      (value) => typeof value === "string" && value.trim(),
    );
    if (language) {
      return language.trim();
    }
  }

  return null;
};

const deriveNavigatorLanguage = (): string | null => {
  if (typeof navigator === "undefined") {
    return null;
  }

  const candidates = [...(navigator.languages ?? []), navigator.language];
  const language = candidates.find(
    (value) => typeof value === "string" && value.trim(),
  );
  return language ? language.trim() : null;
};

const deriveRuntimeLanguage = (): string =>
  deriveDocumentLanguage() ?? deriveNavigatorLanguage() ?? "en";

const deriveRuntimeRtl = (): boolean => {
  if (typeof document === "undefined") {
    return false;
  }

  const dirCandidates = [document.documentElement.dir, document.body?.dir];
  return dirCandidates.some((value) => value?.trim().toLowerCase() === "rtl");
};

const normalizePackages = (
  packages: KoppajsUi5Package[] | undefined,
): KoppajsUi5Package[] => {
  const source = packages?.length ? packages : DEFAULT_PACKAGES;
  return Array.from(new Set(source));
};

const normalizeBaseUrl = (baseUrl: string | undefined): string | undefined => {
  const value = baseUrl?.trim();
  return value ? value : undefined;
};

export function resolveKoppajsUi5Config(
  input: KoppajsUi5ConfigInput = {},
): KoppajsUi5ResolvedConfig {
  return {
    packages: normalizePackages(input.packages),
    runtime: {
      theme: input.runtime?.theme?.trim() || DEFAULT_THEME,
      language: input.runtime?.language?.trim() || deriveRuntimeLanguage(),
      rtl: input.runtime?.rtl ?? deriveRuntimeRtl(),
      contentDensity: input.runtime?.contentDensity ?? DEFAULT_CONTENT_DENSITY,
    },
    assets: {
      baseUrl: normalizeBaseUrl(input.assets?.baseUrl),
    },
    bridge: {
      ui5CustomEvents: input.bridge?.ui5CustomEvents ?? true,
      warnOnUnsupportedBindings:
        input.bridge?.warnOnUnsupportedBindings ?? true,
    },
  };
}
