import { defineConfig } from "vite-plus";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "lit-ui-editor": new URL("./src/index.js", import.meta.url).pathname,
        vue: new URL("./src/vue.js", import.meta.url).pathname,
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: ["lit", "@vaadin/rich-text-editor", "vue"],
      output: {
        assetFileNames: (assetInfo) =>
          assetInfo.name === "style.css" ? "lit-ui-editor.css" : "assets/[name][extname]",
        entryFileNames: "[name].js",
      },
    },
  },
});
