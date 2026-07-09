import { LitElement, css, html } from "lit";

export class EditorToast extends LitElement {
  static properties = {
    message: { type: String },
  };

  static styles = css`
    [popover] {
      position: fixed;
      inset: auto auto 1.5rem 50%;
      transform: translateX(-50%);
      margin: 0;
      padding: 0.5rem 1rem;
      border: 0;
      border-radius: 0.25rem;
      background: #111;
      color: white;
      box-shadow: 0 0.25rem 1rem rgb(0 0 0 / 25%);
      font: inherit;
      font-size: 0.75rem;
      font-weight: 600;
    }
  `;

  constructor() {
    super();
    this.message = "";
  }

  render() {
    return html`<div popover="manual" role="status" aria-live="polite">${this.message}</div>`;
  }

  async showToast(message, duration = 2000) {
    this.message = message;
    await this.updateComplete;

    const toast = this.renderRoot.querySelector("[popover]");
    if (!toast) return;
    if (!toast.matches(":popover-open")) toast.showPopover();

    clearTimeout(this.#hideTimer);
    this.#hideTimer = setTimeout(() => {
      if (toast.matches(":popover-open")) toast.hidePopover();
    }, duration);
  }

  disconnectedCallback() {
    clearTimeout(this.#hideTimer);
    super.disconnectedCallback();
  }

  #hideTimer;
}

customElements.define("editor-toast", EditorToast);
