import { defineConfig } from "vite";
import { resolve } from "node:path";

// popup.html is the HTML entry; background.ts is built as a separate
// module service worker; content.ts is a classic script (keep it import-free). public/ (manifest + icons) is copied as-is.
export default defineConfig({
  root: "src",
  publicDir: resolve(__dirname, "public"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    target: "es2022",
    modulePreload: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup/popup.html"),
        background: resolve(__dirname, "src/background.ts"),
        content: resolve(__dirname, "src/content.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
