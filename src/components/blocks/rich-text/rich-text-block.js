import { TextBlockBase } from "../text/text-block-base.js";
import { normalizeEditorInput, syncEditorFromProperties } from "../text/text-editor-dom.js";
import { PARAGRAPH_RICH_TEXT_FEATURES } from "./rich-text-capabilities.js";

export class RichTextBlock extends TextBlockBase {
  get paragraphMode() {
    return true;
  }

  get contentModel() {
    return "paragraph";
  }

  get supportedFeatures() {
    return PARAGRAPH_RICH_TEXT_FEATURES;
  }

  init(options = {}) {
    const { children = [] } = options;

    this.applyCommonOptions(options);
    this.type = "p";
    this.textChildren = Array.isArray(children) ? children : [];
    this.fontSize = "";
    this.initializeEditorAfterUpdate();
    return this;
  }

  render() {
    return this.renderEditor("div");
  }

  toJSON() {
    return this.serializeBlock({ type: "p" });
  }

  handleEditorKeyDown(event) {
    if (event.key !== "Enter" || event.isComposing) return;
  }

  normalizeEditorInput(editor) {
    normalizeEditorInput(editor, true);
  }

  syncEditor({ preserveContent = false } = {}) {
    const editor = this.editorElement;
    if (!editor || this.renderRoot.activeElement === editor) return;

    syncEditorFromProperties(editor, {
      value: preserveContent ? editor.innerHTML : this.getEditorValue(),
      type: "p",
      paragraphMode: true,
      textAlign: this.textAlign,
      fontWeight: this.fontWeight,
      fontSize: "",
      fontFamily: this.fontFamily,
    });
  }
}

customElements.define("rich-text-block", RichTextBlock);
