import { describe, expect, it } from "vitest";

import { resolveKoppajsUi5Config } from "../../src/config";

describe("resolveKoppajsUi5Config", () => {
  it("resolves the documented defaults", () => {
    document.documentElement.lang = "de-DE";
    document.documentElement.dir = "rtl";

    const config = resolveKoppajsUi5Config();

    expect(config.packages).toEqual(["main", "fiori"]);
    expect(config.runtime.theme).toBe("sap_horizon");
    expect(config.runtime.language).toBe("de-DE");
    expect(config.runtime.rtl).toBe(true);
    expect(config.runtime.contentDensity).toBe("cozy");
    expect(config.bridge.ui5CustomEvents).toBe(true);
    expect(config.bridge.warnOnUnsupportedBindings).toBe(true);
  });

  it("normalizes explicit overrides and deduplicates packages", () => {
    const config = resolveKoppajsUi5Config({
      packages: ["main", "fiori", "main", "ai"],
      runtime: {
        theme: "sap_horizon_dark",
        language: "en",
        rtl: false,
        contentDensity: "compact",
      },
      assets: {
        baseUrl: " https://cdn.example.test/ui5/ ",
      },
      bridge: {
        ui5CustomEvents: false,
        warnOnUnsupportedBindings: false,
      },
    });

    expect(config.packages).toEqual(["main", "fiori", "ai"]);
    expect(config.runtime).toEqual({
      theme: "sap_horizon_dark",
      language: "en",
      rtl: false,
      contentDensity: "compact",
    });
    expect(config.assets).toEqual({
      baseUrl: "https://cdn.example.test/ui5/",
    });
    expect(config.bridge).toEqual({
      ui5CustomEvents: false,
      warnOnUnsupportedBindings: false,
    });
  });
});
