import { TextBlockBase } from "../text/text-block-base.js";
import {
  captureEditorState,
  insertEditorLineBreak,
  normalizeEditorInput,
  restoreEditorState,
  syncEditorFromProperties,
} from "../text/text-editor-dom.js";
import { normalizeBlockType } from "../text/text-utils.js";
import { ENTER_ACTIONS, getEnterAction } from "../text/text-keyboard.js";
import { INLINE_TEXT_FEATURES } from "./inline-text-capabilities.js";

export class InlineTextBlock extends TextBlockBase {
  get paragraphMode() {
    return false;
  }

  get contentModel() {
    return "inline";
  }

  get supportedFeatures() {
    return INLINE_TEXT_FEATURES;
  }

  init(options = {}) {
    const { children = [], type = "p", elementType, fontSize = "" } = options;
    const legacyType = normalizeBlockType(type);

    this.applyCommonOptions(options);
    this.type = normalizeBlockType(elementType ?? legacyType);
    this.textChildren = Array.isArray(children) ? children : [];
    this.fontSize = fontSize;
    this.initializeEditorAfterUpdate();
    return this;
  }

  render() {
    return this.renderEditor(normalizeBlockType(this.type));
  }

  toJSON() {
    return this.serializeBlock({
      type: "inline-text",
      elementType: this.type,
    });
  }

  setType(type) {
    const nextType = normalizeBlockType(type);
    const editor = this.editorElement;
    if (!editor || nextType === this.type) return false;

    const editorState = captureEditorState(editor, this.selectedRange);
    this.type = nextType;

    void this.updateComplete.then(() => {
      if (!this.editorElement) return;

      restoreEditorState(this.editorElement, {
        ...editorState,
        type: this.type,
        paragraphMode: false,
      });
      this.notifySelection();
    });
    return true;
  }

  handleEditorKeyDown(event) {
    if (event.key !== "Enter" || event.isComposing) return;

    event.preventDefault();
    const action = getEnterAction({
      inlineText: true,
      shiftKey: event.shiftKey,
    });
    if (action === ENTER_ACTIONS.unsupported) return;

    insertEditorLineBreak(this.editorSelection, event.currentTarget);
    void this.updateComplete.then(() => this.notifySelection());
  }

  normalizeEditorInput(editor) {
    normalizeEditorInput(editor, false);
  }

  syncEditor({ preserveContent = false } = {}) {
    const editor = this.editorElement;
    if (!editor || this.renderRoot.activeElement === editor) return;

    syncEditorFromProperties(editor, {
      value: preserveContent ? editor.innerHTML : this.getEditorValue(),
      type: this.type,
      paragraphMode: false,
      textAlign: this.textAlign,
      fontWeight: this.fontWeight,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
    });
  }
}

customElements.define("inline-text", InlineTextBlock);
