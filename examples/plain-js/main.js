import "../../src/index.js";

const editor = document.querySelector("rich-text-editor");
editor.value = { groups: [] };
editor.addEventListener("editor-change", (event) => {
  console.log(event.detail.value);
});
