import { Core, type IModule } from "@koppajs/koppajs-core";

import { observeUi5CustomEventAttributes } from "./bridge/ui5-events";
import type { KoppajsUi5ConfigInput, KoppajsUi5ResolvedConfig } from "./config";
import { resolveKoppajsUi5Config } from "./config";
import { registerKoppajsUi5Runtime } from "./runtime";

const MODULE_NAME = "koppajsUi5";

export type KoppajsUi5Module = IModule & {
  readonly config: KoppajsUi5ResolvedConfig;
};

export function createKoppajsUi5Module(
  input: KoppajsUi5ConfigInput = {},
): KoppajsUi5Module {
  const config = resolveKoppajsUi5Config(input);

  return {
    name: MODULE_NAME,
    config,
    install(ctx) {
      registerKoppajsUi5Runtime(ctx, config);
    },
    attach() {
      observeUi5CustomEventAttributes(this.element);

      return {
        config,
      };
    },
  };
}

export function installKoppajsUi5(input: KoppajsUi5ConfigInput = {}): void {
  Core.take(createKoppajsUi5Module(input));
}
