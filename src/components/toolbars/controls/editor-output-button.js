import { LitElement, html } from "lit";
import { editorOutputButtonStyles } from "./editor-output-button.styles.js";

export class EditorOutputButton extends LitElement {
  static styles = editorOutputButtonStyles;

  render() {
    return html`<button type="button" @click=${this.#output}>Log Output</button>`;
  }

  #output = () => {
    const editor = this.closest("rich-text-editor");
    if (editor) console.log(editor.toJSON());
  };
}

customElements.define("editor-output-button", EditorOutputButton);
