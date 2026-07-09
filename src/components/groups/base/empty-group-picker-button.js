export class EmptyGroupPickerButton extends HTMLElement {
  connectedCallback() {
    if (!this.hasAttribute("role")) this.setAttribute("role", "button");
    if (!this.hasAttribute("tabindex")) this.tabIndex = 0;
    if (!this.textContent.trim()) this.textContent = "Add Section";

    this.addEventListener("keydown", this.#keydown);
  }

  disconnectedCallback() {
    this.removeEventListener("keydown", this.#keydown);
  }

  #keydown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    this.click();
  };
}

customElements.define("empty-group-picker-button", EmptyGroupPickerButton);
