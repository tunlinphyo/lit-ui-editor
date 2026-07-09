import { LitElement, html } from "lit";
import { confirmDialogStyles } from "./confirm-dialog.styles.js";

export class ConfirmDialog extends LitElement {
  static properties = {
    title: { type: String },
    message: { type: String },
    confirmLabel: { type: String, attribute: "confirm-label" },
    cancelLabel: { type: String, attribute: "cancel-label" },
  };

  static styles = confirmDialogStyles;

  constructor() {
    super();
    this.title = "Confirm";
    this.message = "Are you sure?";
    this.confirmLabel = "Confirm";
    this.cancelLabel = "Cancel";
    this.resolve = null;
  }

  render() {
    return html`
      <dialog @cancel=${this.#cancel} @click=${this.#closeFromBackdrop}>
        <h2>${this.title}</h2>
        <p>${this.message}</p>
        <menu>
          <button type="button" @click=${this.#cancel}>${this.cancelLabel}</button>
          <button class="primary" type="button" @click=${this.#confirm}>
            ${this.confirmLabel}
          </button>
        </menu>
      </dialog>
    `;
  }

  async open({
    title = "Confirm",
    message = "Are you sure?",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
  } = {}) {
    this.#finish(false);
    this.title = title;
    this.message = message;
    this.confirmLabel = confirmLabel;
    this.cancelLabel = cancelLabel;
    await this.updateComplete;

    this.renderRoot.querySelector("dialog")?.showModal();
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  #confirm = () => {
    this.#finish(true);
  };

  #cancel = (event) => {
    event?.preventDefault();
    this.#finish(false);
  };

  #closeFromBackdrop = (event) => {
    if (event.target === event.currentTarget) this.#finish(false);
  };

  #finish(confirmed) {
    const dialog = this.renderRoot?.querySelector("dialog");
    if (dialog?.open) dialog.close();

    this.resolve?.(confirmed);
    this.resolve = null;
  }
}

customElements.define("confirm-dialog", ConfirmDialog);
