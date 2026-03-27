import { afterEach, describe, expect, it, vi } from "vitest";

const { core, take } = vi.hoisted(() => {
  const take = vi.fn();
  const core = Object.assign(vi.fn(), { take });

  return { core, take };
});

vi.mock("@koppajs/koppajs-core", () => ({
  Core: core,
}));

describe("installKoppajsUi5", () => {
  afterEach(() => {
    core.mockClear();
    take.mockClear();
    vi.resetModules();
  });

  it("registers the adapter module through Core.take", async () => {
    const { installKoppajsUi5 } = await import("../../src/module");

    installKoppajsUi5({
      packages: ["main"],
    });

    expect(take).toHaveBeenCalledTimes(1);
    expect(take.mock.calls[0]?.[0]).toMatchObject({
      name: "koppajsUi5",
      install: expect.any(Function),
      attach: expect.any(Function),
    });
  });
});
