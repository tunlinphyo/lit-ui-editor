# lit-ui-editor

Lit web component content editor packaged for plain JavaScript and Vue applications.

## Install

```sh
npm install lit-ui-editor
```

For local package testing in another app, point that app at this package folder:

```json
{
  "dependencies": {
    "lit-ui-editor": "file:../../CODE/Lit/lit-ui-editor"
  }
}
```

Run `npm run build` in this package before installing or reinstalling it from the
app. The published entry points load from `dist`.

## Plain JavaScript

Import the package once to define the editor custom elements. Import the CSS when your bundler does not auto-include library CSS.

```js
import "lit-ui-editor";
import "lit-ui-editor/style.css";

const editor = document.querySelector("rich-text-editor");
await editor.init({ version: 1, groups: [] });

editor.addEventListener("editor-change", (event) => {
  console.log(event.detail.value);
});
```

```html
<rich-text-editor></rich-text-editor>
```

`rich-text-editor` renders `group-format-toolbar` and `format-toolbar` internally,
so applications do not need to mount toolbar elements separately.

## Vue 3

Register the package side effects once, then tell Vue compiler that editor tags are custom elements. Register custom groups/config before the app mounts or before calling `editor.init(pageData)`.

```js
// main.js
import { createApp } from "vue";
import "lit-ui-editor";
import "lit-ui-editor/style.css";
import App from "./App.vue";

// Import app-specific group definitions here, before any saved page data is loaded.
// import "./editor-groups.js";

createApp(App).mount("#app");
```

```js
// vite.config.js
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

```vue
<template>
  <rich-text-editor ref="editor" />
</template>

<script setup>
import { onMounted, ref } from "vue";

const editor = ref(null);

const pageData = {
  version: 1,
  groups: [],
};

onMounted(async () => {
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

When loading saved JSON from an API, pass it directly to `init` after custom group
definitions have been registered:

```vue
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

  await editorElement.updateComplete;
  await editorElement.init(pageData);
});
</script>
```

Saved groups may omit optional fields such as `style` and `hashId`; the editor
normalizes those defaults during `init`. Required fields are still `version`,
`groups`, and each group `id`, `type`, `sort`, and `blocks`.

## Customize

Use the exported registries to add app-specific groups, lists, layouts, and picker config.

```js
import { registerConfig, registerGroup } from "lit-ui-editor";

registerConfig({
  "font-family": [
    { value: "Inter, sans-serif", label: "Inter" },
    { value: "Georgia, serif", label: "Georgia" },
  ],
  colors: ["#111827", "#2563eb", "#f97316", "#ffffff"],
  "material-icons": ["settings", "settings_accessibility"],
});

registerGroup({ type: "custom", tagName: "custom-group", label: "Custom" });
```

### Block features

Each block can opt in to a subset of toolbar features with a `features` array. Omit
`features` to use the default controls for that block type.

```js
editor.value = {
  groups: [
    {
      id: "hero",
      type: "custom",
      blocks: [
        {
          id: "headline",
          type: "inline-text",
          elementType: "h1",
          features: ["type", "fontFamily", "fontSize", "color", "bold", "align", "link"],
          children: [{ text: "Editable headline" }],
        },
        {
          id: "cta",
          type: "button",
          features: ["icon", "color", "backgroundColor", "borderRadius", "link"],
          text: "Get started",
        },
      ],
    },
  ],
};
```

Supported feature names by block:

| Block type    | Features                                                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`        | `fontFamily`, `fontSize`, `color`, `bold`, `italic`, `underline`, `orderedList`, `unorderedList`, `align`, `backgroundColor`, `link`, `linkTarget` |
| `inline-text` | `type`, `fontFamily`, `fontSize`, `color`, `bold`, `italic`, `underline`, `align`, `link`                                                          |
| `button`      | `align`, `icon`, `color`, `backgroundColor`, `border`, `borderRadius`, `link`, `linkTarget`, `disabled`                                            |
| `image`       | `align`, `imageUpload`, `objectFit`, `backgroundColor`, `border`, `borderRadius`, `link`, `linkTarget`, `disabled`                                 |
| `icon`        | `fontSize`, `color`, `backgroundColor`, `border`, `borderRadius`, `link`, `linkTarget`, `disabled`                                                 |
| `table`       | `tableHeaders`, `backgroundColor`, `border`                                                                                                        |

Feature picker options come from these config keys:

| Config key              | Used by                                                      |
| ----------------------- | ------------------------------------------------------------ |
| `colors`                | Text, icon, button, image, table, and group color controls   |
| `font-family`           | Text font family picker                                      |
| `font-size`             | Text and icon font size picker                               |
| `element-type`          | Inline text element picker                                   |
| `link-target`           | Text, icon, button, image, and group link target picker      |
| `material-icons`        | Icon and button icon picker                                  |
| `button-icon-placement` | Button icon placement picker                                 |
| `object-fit`            | Image object-fit picker                                      |
| `border-width`          | Icon, button, image, table, and group border width picker    |
| `border-style`          | Icon, button, image, table, and group border style picker    |
| `border-position`       | Icon, button, image, table, and group border position picker |
| `border-radius`         | Icon, button, image, and group border radius picker          |
| `mark-style`            | Rich text highlight style picker                             |

### Custom groups and pickers

Create a custom group by extending `GroupBase`, rendering the blocks you want the
group to own, then calling `GroupBase.define()`. The definition registers the
group type used in saved editor JSON and in picker dialogs.

```js
import { GroupBase, registerGroupPicker } from "lit-ui-editor";
import { html } from "lit";

class HeroGroup extends GroupBase {
  static features = ["backgroundColor", "border", "borderRadius"];

  static defaultJson = {
    style: { backgroundColor: "#f7f7f7" },
    blocks: [
      {
        id: "headline",
        type: "inline-text",
        elementType: "h1",
        children: [{ text: "Hero headline" }],
      },
      {
        id: "intro",
        type: "text",
        children: [{ text: "Hero supporting text" }],
      },
      {
        id: "cta",
        type: "button",
        text: "Get started",
      },
    ],
  };

  render() {
    return html`
      <section part="group" data-group-box>
        ${this.renderSortControls()}
        <inline-text block-id="headline"></inline-text>
        <rich-text-block block-id="intro"></rich-text-block>
        <button-block block-id="cta"></button-block>
      </section>
    `;
  }
}

HeroGroup.define("hero-group", {
  type: "hero",
  label: "Hero",
  picker: "marketing",
});
```

Group definitions support these common options:

| Option         | Description                                                                             |
| -------------- | --------------------------------------------------------------------------------------- |
| `type`         | Saved group type in editor JSON.                                                        |
| `tagName`      | Custom element tag. Added automatically when using `GroupBase.define()`.                |
| `label`        | Name shown in picker dialogs.                                                           |
| `picker`       | Picker category for filtering. Use a string or array of strings. Defaults to `content`. |
| `addable`      | Set to `false` to hide the group from picker dialogs.                                   |
| `defaultStyle` | Initial style values used when a user adds the group.                                   |

Create a custom picker dialog by registering a picker tag with the group types it
can add:

```js
registerGroupPicker("marketing-group-picker", ["hero"]);
```

Then set that picker on the editor in HTML with the `picker-dialog` attribute:

```html
<rich-text-editor picker-dialog="marketing-group-picker"></rich-text-editor>
```

The built-in picker is used when `picker-dialog` is omitted:

```html
<rich-text-editor></rich-text-editor>
```

For a fully custom picker UI, extend `GroupPickerBase` or define an element with
the same contract: `group-order` calls `open()`, then listens for a bubbling
`group-select` event with the selected group `type`.

```js
import { GroupPickerBase } from "lit-ui-editor";
import { html } from "lit";

class CompactGroupPicker extends GroupPickerBase {
  render() {
    return html`
      <dialog>
        <button type="button" @click=${() => this.select("hero")}>Hero</button>
        <button type="button" @click=${this.close}>Cancel</button>
      </dialog>
    `;
  }

  select(type) {
    this.dispatchEvent(
      new CustomEvent("group-select", {
        bubbles: true,
        detail: { type },
      }),
    );
    this.close();
  }
}

customElements.define("compact-group-picker", CompactGroupPicker);
```

```html
<rich-text-editor picker-dialog="compact-group-picker"></rich-text-editor>
```

### CSS variables

Default styles are declared in the `ui-editor-defaults` cascade layer. Define these
variables in your app stylesheet after importing `lit-ui-editor/style.css` to
override editor colors, typography, borders, and highlight marks.

```css
:root {
  --font-heading: Georgia, "Times New Roman", serif;
  --font-body: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  --font-size-xxs: 10px;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-md: 18px;
  --font-size-lg: 20px;
  --font-size-xl: 24px;
  --font-size-xxl: 32px;
  --font-size-xxxl: 40px;

  --border-radius-none: 0px;
  --border-radius-xs: 2px;
  --border-radius-sm: 4px;
  --border-radius-base: 6px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --border-radius-xl: 16px;
  --border-radius-xxl: 24px;
  --border-radius-xxxl: 32px;

  --border-width-xs: 1px;
  --border-width-sm: 2px;
  --border-width-base: 4px;
  --border-width-md: 6px;
  --border-width-lg: 8px;
  --border-width-xl: 12px;
  --border-width-xxl: 24px;
  --border-width-xxxl: 48px;

  --white: #ffffff;
  --gray-25: #f7f7f7;
  --gray-50: #f0f0f0;
  --gray-100: #e8e8e8;
  --gray-200: #d1d1d1;
  --gray-300: #b3b3b3;
  --gray-400: #8d8d8d;
  --gray-500: #676767;
  --gray-600: #525252;
  --gray-700: #414141;
  --gray-800: #1b1b1b;
  --gray-900: #0d0d0d;
  --black: #000000;

  --ui-editor-highlight: deepskyblue;
  --ui-editor-mark: yellow;
  --ui-editor-link-text-color: blue;
  --ui-editor-primary: deeppink;

  --mark-default-background-size: 100%;
  --mark-default-padding: 0 0.25rem;
  --mark-default-border-radius: 0.2rem;
  --mark-primary-background-size: 100% 70%;
  --mark-primary-padding: 0;
  --mark-primary-border-radius: 0;
  --mark-secondary-background-size: 100% 40%;
  --mark-secondary-padding: 0;
  --mark-secondary-border-radius: 0;
}
```

## Development

```sh
vp install
vp check
vp build
```
