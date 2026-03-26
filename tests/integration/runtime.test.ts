import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLanguage } from "@ui5/webcomponents-base/dist/config/Language.js";
import { resetConfiguration } from "@ui5/webcomponents-base/dist/config/ConfigurationReset.js";
import { getTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";

import { resolveKoppajsUi5Config } from "../../src/config";
import {
  ensureKoppajsUi5RuntimeReady,
  registerKoppajsUi5Runtime,
  resetKoppajsUi5RuntimeForTests,
} from "../../src/runtime";

const createCtx = () => ({
  registerHook: vi.fn(),
  take: vi.fn(),
});

const resetDocumentRuntimeHints = () => {
  document.documentElement.lang = "";
  document.documentElement.dir = "";
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-ui5-compact-size");
  delete document.documentElement.dataset.koppajsUi5Theme;
  delete document.documentElement.dataset.koppajsUi5Language;
  delete document.documentElement.dataset.koppajsUi5ContentDensity;
};

describe("Koppajs UI5 runtime", () => {
  beforeEach(() => {
    resetConfiguration();
    resetKoppajsUi5RuntimeForTests();
    resetDocumentRuntimeHints();
  });

  it("loads requested packages and applies theme/language/runtime hints", async () => {
    const ctx = createCtx();

    registerKoppajsUi5Runtime(
      ctx,
      resolveKoppajsUi5Config({
        packages: ["main", "fiori", "ai"],
        runtime: {
          theme: "sap_horizon_dark",
          language: "de",
          rtl: true,
          contentDensity: "compact",
        },
      }),
    );

    await ensureKoppajsUi5RuntimeReady();

    expect(ctx.registerHook).toHaveBeenCalledWith(
      "created",
      expect.any(Function),
    );
    expect(getTheme()).toBe("sap_horizon_dark");
    expect(getLanguage()).toBe("de");
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("de");
    expect(
      document.documentElement.classList.contains(
        "ui5-content-density-compact",
      ),
    ).toBe(true);
    expect(customElements.get("ui5-button")).toBeDefined();
    expect(customElements.get("ui5-shellbar")).toBeDefined();
    expect(customElements.get("ui5-ai-prompt-input")).toBeDefined();
  });

  it("bridges multiple real UI5 custom-event aliases", async () => {
    registerKoppajsUi5Runtime(
      createCtx(),
      resolveKoppajsUi5Config({
        packages: ["main"],
      }),
    );

    await ensureKoppajsUi5RuntimeReady();

    const selectionHost = document.createElement("ui5-segmented-button");
    const valueStateHost = document.createElement("ui5-step-input");
    const selectionHandler = vi.fn();
    const valueStateHandler = vi.fn();

    selectionHost.addEventListener("ui5selectionchange", selectionHandler);
    valueStateHost.addEventListener("ui5valuestatechange", valueStateHandler);

    selectionHost.dispatchEvent(
      new CustomEvent("selection-change", { bubbles: true }),
    );
    valueStateHost.dispatchEvent(
      new CustomEvent("value-state-change", { bubbles: true }),
    );

    expect(selectionHandler).toHaveBeenCalledTimes(1);
    expect(valueStateHandler).toHaveBeenCalledTimes(1);
  });

  it("warns once for unsupported JS-only bindings on UI5 elements", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    registerKoppajsUi5Runtime(
      createCtx(),
      resolveKoppajsUi5Config({
        packages: ["main"],
      }),
    );

    await ensureKoppajsUi5RuntimeReady();

    const button = document.createElement("ui5-button");
    button.setAttribute("accessibility-attributes", "[object Object]");
    button.setAttribute("accessibility-attributes", "[object Object]");

    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });

  it("keeps repeated initialization idempotent and ignores conflicting runtime overrides", async () => {
    const ctx = createCtx();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    registerKoppajsUi5Runtime(
      ctx,
      resolveKoppajsUi5Config({
        packages: ["main"],
        runtime: {
          theme: "sap_horizon_dark",
          language: "de",
        },
      }),
    );

    await ensureKoppajsUi5RuntimeReady();

    registerKoppajsUi5Runtime(
      ctx,
      resolveKoppajsUi5Config({
        packages: ["fiori"],
        runtime: {
          theme: "sap_horizon",
          language: "en",
        },
      }),
    );

    await ensureKoppajsUi5RuntimeReady();

    expect(ctx.registerHook).toHaveBeenCalledTimes(1);
    expect(customElements.get("ui5-shellbar")).toBeDefined();
    expect(getTheme()).toBe("sap_horizon_dark");
    expect(getLanguage()).toBe("de");
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
