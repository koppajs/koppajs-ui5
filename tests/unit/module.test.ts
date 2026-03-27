import { describe, expect, it, vi } from "vitest";

const { registerKoppajsUi5Runtime } = vi.hoisted(() => ({
  registerKoppajsUi5Runtime: vi.fn(),
}));

vi.mock("../../src/runtime", () => ({
  registerKoppajsUi5Runtime,
}));

import { createKoppajsUi5Module } from "../../src/module";

describe("createKoppajsUi5Module", () => {
  it("creates a Core-compatible module registration", () => {
    const registerHook = vi.fn();
    const take = vi.fn();
    const module = createKoppajsUi5Module({
      packages: ["main", "fiori"],
    });

    expect(module.name).toBe("koppajsUi5");
    expect(module.config.packages).toEqual(["main", "fiori"]);

    module.install({ registerHook, take });

    expect(registerKoppajsUi5Runtime).toHaveBeenCalledWith(
      { registerHook, take },
      module.config,
    );
  });
});
