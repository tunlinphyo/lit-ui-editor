# Correct Vue Usage For `lit-ui-editor`

This package is a Lit custom-element editor. In Vue, use the custom element directly
and call `init(pageData)` after the element is mounted.

## Local Package Install

When another Vue app uses this repo as a local package, it should depend on the
package folder:

```json
{
  "dependencies": {
    "lit-ui-editor": "file:../../CODE/Lit/lit-ui-editor"
  }
}
```

Build this package before reinstalling or running the app:

```sh
npm run build
```

The package entry points use `dist`, so a stale build can make the Vue app run old
validation code.

## Vue Setup

Import the editor once in `main.js`:

```js
import { createApp } from "vue";
import "lit-ui-editor";
import "lit-ui-editor/style.css";
import App from "./App.vue";

// Import app-specific editor groups before editor.init(pageData).
// import "./editor-groups.js";

createApp(App).mount("#app");
```

Tell Vue that `lit-ui-editor` tags are custom elements:

```js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { isLitUiEditorElement } from "lit-ui-editor/vue";

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
```

## Correct Component Usage

```vue
<template>
  <rich-text-editor ref="editor" />
</template>

<script setup>
import { onMounted, ref } from "vue";

const editor = ref(null);

async function fetchPageData() {
  const response = await fetch("/api/page");
  return response.json();
}

onMounted(async () => {
  const pageData = await fetchPageData();
  const editorElement = editor.value;
  if (!editorElement) return;

  await editorElement.updateComplete;
  await editorElement.init(pageData);

  editorElement.addEventListener("editor-change", (event) => {
    console.log(event.detail.value);
  });
});
</script>
```

Do not set `editor.value.value = pageData` in Vue. The first `value` is the Vue
template ref, and the second `value` is not the recommended editor API. Use
`editorElement.init(pageData)`.

## Required Init Order

1. Import `lit-ui-editor`.
2. Import `lit-ui-editor/style.css`.
3. Register app-specific groups, lists, configs, and pickers.
4. Mount Vue.
5. Wait for the editor element with `await editorElement.updateComplete`.
6. Call `await editorElement.init(pageData)`.

Custom groups must be registered before `init(pageData)`, otherwise saved group
types such as `home-banner` or `home-news` may not render correctly.

## Saved JSON Shape

Saved page data should be passed directly:

```js
await editorElement.init(pageData);
```

The editor now normalizes defaultable group fields before strict validation:

```json
{
  "id": "db12d647-aca3-4b42-bf43-3899ee1471a0",
  "sort": 1,
  "type": "home-news",
  "blocks": []
}
```

becomes:

```json
{
  "id": "db12d647-aca3-4b42-bf43-3899ee1471a0",
  "type": "home-news",
  "hashId": "",
  "sort": 1,
  "style": {
    "backgroundColor": "",
    "borderWidth": "",
    "borderColor": "",
    "borderStyle": "",
    "borderPosition": "",
    "borderRadius": ""
  },
  "blocks": []
}
```

This means the Vue app does not need to add missing `style` or `hashId` fields
before calling `init(pageData)`.
