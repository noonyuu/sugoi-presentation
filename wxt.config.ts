import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-react"],
  runner: {
    startUrls: ["https://google.com"],
  },
  manifest: {
    permissions: ["storage"],
    host_permissions: [
      "https://presentation.noonyuu.com/*"
    ],
  },
});
