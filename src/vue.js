import "./index.js";

const LIT_UI_EDITOR_ELEMENTS = new Set([
  "rich-text-editor",
  "format-toolbar",
  "group-format-toolbar",
  "group-picker-dialog",
  "confirm-dialog",
  "hash-dialog",
  "editor-toast",
]);

export function isLitUiEditorElement(tagName) {
  return (
    LIT_UI_EDITOR_ELEMENTS.has(tagName) || tagName.endsWith("-block") || tagName.endsWith("-group")
  );
}

export const LitUiEditorVuePlugin = {
  install() {},
};

export default LitUiEditorVuePlugin;
