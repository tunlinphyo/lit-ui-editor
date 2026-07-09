import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { isLitUiEditorElement } from "../../src/vue.js";

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: isLitUiEditorElement,
        },
      },
    }),
  ],
});
