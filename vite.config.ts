import { defineConfig, loadEnv, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), splitVendorChunkPlugin()],
    envPrefix: ["APP_"],
    resolve: {
      alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }]
    },
    server: {
      port: Number(env.APP_PORT) || 3000
    }
  };
});
