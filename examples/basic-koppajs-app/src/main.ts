import { Core } from "@koppajs/koppajs-core";
import { installKoppajsUi5 } from "@koppajs/koppajs-ui5";

import appView from "./app-view.kpa";

installKoppajsUi5({
  packages: ["main", "fiori"],
  runtime: {
    theme: "sap_horizon_dark",
    language: "de",
    rtl: false,
    contentDensity: "compact",
  },
});

Core.take(appView, "app-view");
Core();
