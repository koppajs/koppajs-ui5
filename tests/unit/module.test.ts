import { describe, expect, it, vi } from "vitest";

import { createKoppajsUi5Module } from "../../src/module";
import { resetKoppajsUi5RuntimeForTests } from "../../src/runtime";

describe("createKoppajsUi5Module", () => {
  it("creates a Core-compatible module registration", () => {
    resetKoppajsUi5RuntimeForTests();

    const registerHook = vi.fn();
    const take = vi.fn();
    const module = createKoppajsUi5Module({
      packages: ["main", "fiori"],
    });

    expect(module.name).toBe("koppajsUi5");
    expect(module.config.packages).toEqual(["main", "fiori"]);

    module.install({ registerHook, take });

    expect(registerHook).toHaveBeenCalledWith("created", expect.any(Function));
  });
});
