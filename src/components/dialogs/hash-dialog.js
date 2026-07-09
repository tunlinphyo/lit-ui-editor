import { LitElement, html } from "lit";
import { hashDialogStyles } from "./hash-dialog.styles.js";

export class HashDialog extends LitElement {
  static properties = {
    value: { type: String },
  };

  static styles = hashDialogStyles;

  constructor() {
    super();
    this.value = "";
    this.resolve = null;
  }

  render() {
    return html`
      <dialog @cancel=${this.#cancel} @click=${this.#closeFromBackdrop}>
        <form @submit=${this.#save}>
          <h2>Set hash link</h2>
          <div class="field">
            <label for="group-hash-id">Group ID</label>
            <div class="hash-input">
              <span aria-hidden="true">#</span>
              <input
                id="group-hash-id"
                name="hashId"
                type="text"
                autocomplete="off"
                placeholder="section-name"
                .value=${this.value}
              />
            </div>
          </div>
          <menu>
            <button type="button" @click=${this.#cancel}>Cancel</button>
            <button type="submit">Save</button>
          </menu>
        </form>
      </dialog>
    `;
  }

  async open({ value = "" } = {}) {
    this.#finish(null);
    this.value = value;
    await this.updateComplete;

    const dialog = this.renderRoot.querySelector("dialog");
    const input = this.renderRoot.querySelector('input[name="hashId"]');
    if (!dialog || !input) return null;

    input.value = value;
    dialog.showModal();
    input.focus();
    input.select();

    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  #save = (event) => {
    event.preventDefault();
    this.#finish(event.currentTarget.elements.hashId.value);
  };

  #cancel = (event) => {
    event?.preventDefault();
    this.#finish(null);
  };

  #closeFromBackdrop = (event) => {
    if (event.target === event.currentTarget) this.#finish(null);
  };

  #finish(value) {
    const dialog = this.renderRoot?.querySelector("dialog");
    if (dialog?.open) dialog.close();

    this.resolve?.(value);
    this.resolve = null;
  }
}

customElements.define("hash-dialog", HashDialog);
