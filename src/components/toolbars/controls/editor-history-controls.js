import { LitElement, css, html } from "lit";
import {
  materialSymbolStyles,
  renderMaterialIcon,
} from "../../icon-picker/material-icon-picker.js";

const buttonStyles = css`
  :host {
    display: inline-flex;
  }

  button {
    display: inline-grid;
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    place-items: center;
    color: var(--gray-700);
    background: transparent;
    border: 0;
    border-radius: 50%;
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  button:not(:disabled):focus-visible {
    outline: 2px solid var(--ui-editor-highlight);
    outline-offset: 2px;
  }
`;

class EditorHistoryButton extends LitElement {
  static properties = {
    disabled: { state: true },
  };

  static styles = [buttonStyles, materialSymbolStyles];

  constructor() {
    super();
    this.disabled = true;
    this.editor = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.editor = findEditor(this);
    this.editor?.addEventListener("history-state-change", this.#handleHistoryStateChange);
    this.#updateState();
  }

  disconnectedCallback() {
    this.editor?.removeEventListener("history-state-change", this.#handleHistoryStateChange);
    this.editor = null;
    super.disconnectedCallback();
  }

  #handleHistoryStateChange = () => {
    this.#updateState();
  };

  #updateState() {
    this.disabled = !this.editor?.[this.stateProperty];
  }

  runCommand() {
    if (!this.editor?.[this.command]?.()) return;

    this.dispatchEvent(
      new CustomEvent("history-command", {
        bubbles: true,
        composed: true,
        detail: { command: this.command },
      }),
    );
  }
}

export class EditorUndoButton extends EditorHistoryButton {
  constructor() {
    super();
    this.command = "undo";
    this.stateProperty = "canUndo";
  }

  render() {
    return html`
      <button
        type="button"
        aria-label="Undo"
        title="Undo"
        ?disabled=${this.disabled}
        @click=${this.runCommand}
      >
        ${renderMaterialIcon("undo")}
      </button>
    `;
  }
}

export class EditorRedoButton extends EditorHistoryButton {
  constructor() {
    super();
    this.command = "redo";
    this.stateProperty = "canRedo";
  }

  render() {
    return html`
      <button
        type="button"
        aria-label="Redo"
        title="Redo"
        ?disabled=${this.disabled}
        @click=${this.runCommand}
      >
        ${renderMaterialIcon("redo")}
      </button>
    `;
  }
}

export class EditorHistoryControls extends LitElement {
  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      padding-block-end: 0.5rem;
      border-bottom: 1px solid var(--gray-200);
    }
  `;

  render() {
    return html`
      <editor-undo-button></editor-undo-button>
      <editor-redo-button></editor-redo-button>
    `;
  }
}

function findEditor(element) {
  let current = element;
  while (current) {
    const editor = current.closest?.("rich-text-editor");
    if (editor) return editor;
    current = current.getRootNode?.().host;
  }
  return null;
}

customElements.define("editor-undo-button", EditorUndoButton);
customElements.define("editor-redo-button", EditorRedoButton);
customElements.define("editor-history-controls", EditorHistoryControls);
