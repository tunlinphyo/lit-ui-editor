import { css, html, LitElement } from "lit";
import { resolveConfigOptions } from "../../registries/config-registry.js";

// loadMaterialSymbols();

export const materialSymbolStyles = css`
  .material-symbol {
    display: inline-block;
    direction: ltr;
    font-family: "Material Symbols Outlined";
    font-size: 1.25rem;
    font-style: normal;
    font-weight: normal;
    font-feature-settings: "liga";
    letter-spacing: normal;
    line-height: 1;
    text-transform: none;
    white-space: nowrap;
    word-wrap: normal;
    -webkit-font-smoothing: antialiased;
  }
`;

const materialIconPickerStyles = css`
  :host {
    display: grid;
    grid-template-columns: repeat(10, 2.75rem);
    gap: 0.25rem;
  }

  button {
    display: inline-grid;
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: white;
    color: inherit;
    cursor: pointer;
    place-items: center;
  }

  button:hover,
  button:focus-visible,
  button[aria-pressed="true"] {
    outline: 2px solid var(--ui-editor-highlight);
    outline-offset: -1px;
  }
`;

export class MaterialIconPicker extends LitElement {
  static properties = {
    value: { type: String },
  };

  static styles = [materialSymbolStyles, materialIconPickerStyles];

  constructor() {
    super();
    this.value = "";
  }

  render() {
    return getMaterialIconNames().map(
      (name) => html`
        <button
          type="button"
          title=${toIconLabel(name)}
          aria-label=${toIconLabel(name)}
          aria-pressed=${this.value === name}
          data-value=${name}
          @click=${this.#select}
        >
          ${renderMaterialIcon(name)}
        </button>
      `,
    );
  }

  #select = (event) => {
    const icon = event.currentTarget.dataset.value;
    this.value = icon;
    this.dispatchEvent(
      new CustomEvent("icon-select", {
        detail: { icon },
        bubbles: true,
        composed: true,
      }),
    );
  };
}

customElements.define("material-icon-picker", MaterialIconPicker);

export function renderMaterialIcon(name) {
  return html`<span class="material-symbol" aria-hidden="true">${name}</span>`;
}

export function getMaterialIconNames() {
  return resolveConfigOptions("material-icons");
}

function toIconLabel(name) {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
