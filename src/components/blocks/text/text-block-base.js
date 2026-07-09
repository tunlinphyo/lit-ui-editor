import { LitElement } from "lit";
import { html, unsafeStatic } from "lit/static-html.js";
import { getCapabilities, toFeatureAttribute } from "../../../registries/formatter-registry.js";
import { markStyles } from "./mark.styles.js";
import { textBlockStyles } from "./text-block.styles.js";
import {
  getEditorElement,
  getEditorSelection,
  initializeEditor,
  placeCaretInEmptyEditor,
  setDefaultParagraphSeparator,
  updateEditorEmptyState,
  updateEditorPlaceholder,
} from "./text-editor-dom.js";
import { applySelectionCommand, describeSelectionFormat } from "./text-formatting.js";
import {
  deserializeTextChildren,
  insertPlainText,
  insertPlainTextAsParagraphs,
  isSelectionInside,
  normalizeBlockContent,
  removeLinkSelectionPreview,
  selectRange,
  serializeTextChildren,
} from "./text-utils.js";
import { resolveSupportedFeatures } from "./text-capabilities.js";

export class TextBlockBase extends LitElement {
  static properties = {
    blockId: { type: String, attribute: "block-id", reflect: true },
    textChildren: { state: true },
    placeholder: { type: String },
    disabled: { type: Boolean, reflect: true },
    predefinedMargin: { type: String, attribute: "predefined-margin", reflect: true },
    type: { type: String, reflect: true },
    textAlign: { type: String, attribute: "text-align", reflect: true },
    fontWeight: { type: String, attribute: "font-weight", reflect: true },
    fontSize: { type: String, attribute: "font-size", reflect: true },
    fontFamily: { type: String, attribute: "font-family", reflect: true },
    features: { type: String, reflect: true },
  };

  static styles = [textBlockStyles, markStyles];

  constructor() {
    super();
    this.blockId = "";
    this.textChildren = [];
    this.placeholder = "";
    this.disabled = false;
    this.predefinedMargin = "0.5rem";
    this.type = "p";
    this.textAlign = "left";
    this.fontWeight = "";
    this.fontSize = "";
    this.fontFamily = "";
    this.features = undefined;
    this.selectedRange = null;
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("mouseup", this._handleMouseup);
    document.addEventListener("selectionchange", this._handleSelectionChange);
  }

  disconnectedCallback() {
    document.removeEventListener("mouseup", this._handleMouseup);
    document.removeEventListener("selectionchange", this._handleSelectionChange);
    super.disconnectedCallback();
  }

  firstUpdated() {
    this.syncEditor();
  }

  updated(changedProperties) {
    if (changedProperties.has("predefinedMargin")) {
      this.style.setProperty("--predefined-margin", this.predefinedMargin || "0.5rem");
    }
    const contentChanged = changedProperties.has("textChildren");
    const presentationChanged =
      changedProperties.has("textAlign") ||
      changedProperties.has("fontWeight") ||
      changedProperties.has("fontSize") ||
      changedProperties.has("fontFamily");
    if (contentChanged || presentationChanged) {
      this.syncEditor({ preserveContent: !contentChanged });
    }
    if (changedProperties.has("placeholder")) {
      const editor = this.editorElement;
      if (editor) updateEditorPlaceholder(editor, this.placeholder);
    }
  }

  get editorElement() {
    return getEditorElement(this.renderRoot);
  }

  get editorSelection() {
    return getEditorSelection(this.renderRoot);
  }

  applyCommonOptions(options = {}) {
    const { id = "", textAlign = "left", fontWeight = "", fontFamily = "" } = options;

    this.blockId = id;
    this.textAlign = textAlign;
    this.fontWeight = fontWeight;
    this.fontFamily = fontFamily;
    if (Object.hasOwn(options, "features")) {
      this.features = toFeatureAttribute(options.features);
    }
  }

  initializeEditorAfterUpdate() {
    void this.updateComplete.then(() => {
      const editor = this.editorElement;
      if (!editor) return;

      initializeEditor(editor, {
        value: this.getEditorValue(),
        type: this.type,
        placeholder: this.placeholder,
        textAlign: this.textAlign,
        fontWeight: this.fontWeight,
        fontSize: this.fontSize,
        fontFamily: this.fontFamily,
        paragraphMode: this.paragraphMode,
      });
    });
  }

  renderEditor(tagName) {
    const tag = unsafeStatic(tagName);

    return html`
      <${tag}
        class="editor"
        part="editor"
        contenteditable=${this.disabled ? "false" : "true"}
        data-placeholder=${this.placeholder}
        @focus=${this._handleFocus}
        @beforeinput=${this._handleBeforeInput}
        @keydown=${this._handleKeyDown}
        @paste=${this._handlePaste}
        @input=${this._handleInput}
      ></${tag}>
    `;
  }

  serializeBlock(typeData) {
    const editor = this.editorElement;

    return {
      id: this.blockId,
      children: editor
        ? serializeTextChildren(editor, { paragraphMode: this.paragraphMode })
        : this.textChildren,
      ...typeData,
      textAlign: editor?.style.textAlign || this.textAlign || "left",
      fontWeight: editor?.style.fontWeight || this.fontWeight || "",
      fontSize: this.paragraphMode ? "" : editor?.style.fontSize || this.fontSize || "",
      fontFamily: editor?.style.fontFamily || this.fontFamily || "",
      predefinedMargin: this.predefinedMargin,
    };
  }

  getEditorValue() {
    return normalizeBlockContent(
      deserializeTextChildren(this.textChildren, { paragraphMode: this.paragraphMode }),
      this.paragraphMode ? "p" : "h1",
    );
  }

  captureSelection({ preserve = false } = {}) {
    const selection = this.editorSelection;
    const editor = this.editorElement;

    if (!isSelectionInside(editor, selection)) {
      if (preserve) return Boolean(this.selectedRange);

      this.selectedRange = null;
      this.toggleAttribute("has-format-selection", false);
      return false;
    }

    this.selectedRange = selection.getRangeAt(0).cloneRange();
    this.toggleAttribute("has-format-selection", !selection.isCollapsed);
    return true;
  }

  clearSelection() {
    this._removeLinkSelectionPreview();
    this.selectedRange = null;
    this.removeAttribute("has-format-selection");
  }

  restoreSelection() {
    const selection = this.editorSelection;
    const editor = this.editorElement;

    if (
      !selection ||
      !this.selectedRange ||
      !editor?.contains(this.selectedRange.commonAncestorContainer)
    ) {
      return false;
    }

    selectRange(selection, this.selectedRange);
    return true;
  }

  formatSelection(command, value = null) {
    if (command === "linkCancel") {
      this._removeLinkSelectionPreview();
      return true;
    }

    if (!this.selectedRange) return false;

    const selection = this.editorSelection;
    const editor = this.editorElement;
    if (!selection || !editor) return false;

    const result = applySelectionCommand({
      command,
      value,
      editor,
      type: this.type,
      paragraphMode: this.paragraphMode,
      range: this.selectedRange,
      selection,
      onFontSizeChange: (fontSize) => {
        this.fontSize = fontSize;
      },
    });
    this.selectedRange = result.range;
    if (!result.shouldNotify) return true;

    this.notifySelection();
    return true;
  }

  align(alignment) {
    const editor = this.editorElement;
    if (!editor) return false;

    editor.style.textAlign = alignment;
    this.notifySelection();
    return true;
  }

  setFontFamily(fontFamily) {
    const editor = this.editorElement;
    if (!editor) return false;

    editor.style.fontFamily = fontFamily;
    this.fontFamily = fontFamily;
    this.notifySelection();
    return true;
  }

  getSelectionFormat() {
    return {
      ...describeSelectionFormat({
        editor: this.editorElement,
        type: this.type,
        paragraphMode: this.paragraphMode,
        textAlign: this.textAlign,
        range: this.selectedRange,
        selection: this.editorSelection,
      }),
      contentModel: this.contentModel,
      capabilities: getCapabilities("text", this.effectiveFeatures),
    };
  }

  get effectiveFeatures() {
    if (this.features != null) {
      return resolveSupportedFeatures(this.features, this.supportedFeatures);
    }
    if (this.hasAttribute("features")) {
      return resolveSupportedFeatures(this.getAttribute("features") ?? "", this.supportedFeatures);
    }

    return this.supportedFeatures;
  }

  notifySelection() {
    this.captureSelection();
    this._dispatchSelection();
  }

  _dispatchSelection() {
    this.dispatchEvent(
      new CustomEvent("selection-format-change", {
        detail: this.getSelectionFormat(),
        bubbles: true,
        composed: true,
      }),
    );
  }

  _handleFocus = (event) => {
    if (this.paragraphMode) setDefaultParagraphSeparator(event.currentTarget);
    placeCaretInEmptyEditor(event.currentTarget, this.editorSelection);
  };

  _handleKeyDown = (event) => {
    this.handleEditorKeyDown(event);
  };

  _handleBeforeInput = (event) => {
    this.handleEditorBeforeInput?.(event);
  };

  _handleInput = (event) => {
    this.normalizeEditorInput(event.currentTarget);
    this.notifySelection();
  };

  _handleMouseup = (event) => {
    if (!event.composedPath().includes(this)) return;

    queueMicrotask(() => {
      this._removeLinkSelectionPreview();
      if (this.captureSelection()) this._dispatchSelection();
    });
  };

  _handleSelectionChange = () => {
    if (!isSelectionInside(this.editorElement, this.editorSelection)) return;
    if (this.captureSelection()) this._dispatchSelection();
  };

  _handlePaste = (event) => {
    event.preventDefault();

    const selection = this.editorSelection;
    placeCaretInEmptyEditor(event.currentTarget, selection);
    const text = event.clipboardData?.getData("text/plain") ?? "";
    const inserted = this.paragraphMode
      ? insertPlainTextAsParagraphs(event.currentTarget, selection, text)
      : insertPlainText(selection, text);
    if (!inserted) return;
    updateEditorEmptyState(event.currentTarget, this.paragraphMode);
    this.notifySelection();
  };

  _removeLinkSelectionPreview() {
    removeLinkSelectionPreview(this.editorElement, this.selectedRange);
  }
}
