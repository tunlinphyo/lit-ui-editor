import { LitElement } from "lit";

export class GroupPickerBase extends LitElement {
  static properties = {
    picker: { type: String, reflect: true },
    selectedType: { state: true },
  };

  constructor() {
    super();
    this.picker = "";
    this.selectedType = "";
  }

  async open() {
    this.selectedType = "";
    await this.updateComplete;
    this.renderRoot.querySelector("dialog")?.showModal();
  }

  close = () => {
    this.renderRoot.querySelector("dialog")?.close();
  };

  selectGroup = (event) => {
    this.selectedType = event.currentTarget.value;
  };

  submitSelection = (event) => {
    event.preventDefault();
    if (!this.selectedType) return;

    this.dispatchEvent(
      new CustomEvent("group-select", {
        bubbles: true,
        detail: { type: this.selectedType },
      }),
    );
    this.close();
  };

  closeFromBackdrop = (event) => {
    if (event.target === event.currentTarget) this.close();
  };
}
