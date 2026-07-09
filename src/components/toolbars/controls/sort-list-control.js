import { LitElement, html } from "lit";
import {
  materialSymbolStyles,
  renderMaterialIcon,
} from "../../icon-picker/material-icon-picker.js";
import { formatToggleStyles } from "./format-toggle.styles.js";
import { sortListControlStyles } from "./sort-list-control.style.js";

export class BlockGroupSort extends LitElement {
  static properties = {
    disabled: { type: Boolean },
    items: { state: true },
    label: { type: String },
    draggingId: { state: true },
  };

  static styles = [formatToggleStyles, sortListControlStyles, materialSymbolStyles];

  constructor() {
    super();
    this.disabled = true;
    this.items = [];
    this.label = "items";
    this.draggingId = "";
  }

  render() {
    return html`
      <button
        type="button"
        class="sort-button"
        title=${`Sort ${this.label}`}
        aria-label=${`Sort ${this.label}`}
        ?disabled=${this.disabled}
        @click=${this.#open}
      >
        ${renderMaterialIcon("swap_vert")}
      </button>
      <dialog @close=${this.#resetDrag}>
        <form method="dialog">
          <header>
            <strong>Sort ${this.label}</strong>
            <button type="submit" aria-label="Close">${renderMaterialIcon("close")}</button>
          </header>
          <ol>
            ${this.items.map(
              (item, index) => html`
                <li
                  draggable="true"
                  data-id=${item.id}
                  aria-current=${item.active ? "true" : "false"}
                  @dragstart=${this.#dragStart}
                  @dragover=${this.#dragOver}
                  @drop=${this.#drop}
                  @dragend=${this.#resetDrag}
                >
                  <span class="handle" aria-hidden="true">=</span>
                  <span>${item.label}</span>
                  <button
                    type="button"
                    title="Move up"
                    aria-label=${`Move ${item.label} up`}
                    ?disabled=${index === 0}
                    @click=${() => this.#move(index, -1)}
                  >
                    ${renderMaterialIcon("keyboard_arrow_up")}
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    aria-label=${`Move ${item.label} down`}
                    ?disabled=${index === this.items.length - 1}
                    @click=${() => this.#move(index, 1)}
                  >
                    ${renderMaterialIcon("keyboard_arrow_down")}
                  </button>
                </li>
              `,
            )}
          </ol>
        </form>
      </dialog>
    `;
  }

  setFormat(format) {
    this.disabled = !format || !format.canSort;
    this.items = format?.items ?? [];
    this.label = format?.label ?? "items";
  }

  #open = () => {
    this.renderRoot.querySelector("dialog")?.showModal();
  };

  #move(index, offset) {
    const nextIndex = index + offset;
    if (nextIndex < 0 || nextIndex >= this.items.length) return;

    const items = [...this.items];
    const [item] = items.splice(index, 1);
    items.splice(nextIndex, 0, item);
    this.#apply(items);
  }

  #dragStart = (event) => {
    this.draggingId = event.currentTarget.dataset.id;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", this.draggingId);
  };

  #dragOver = (event) => {
    if (!this.draggingId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  #drop = (event) => {
    event.preventDefault();
    const targetId = event.currentTarget.dataset.id;
    if (!this.draggingId || !targetId || this.draggingId === targetId) return;

    const items = [...this.items];
    const fromIndex = items.findIndex((item) => item.id === this.draggingId);
    const toIndex = items.findIndex((item) => item.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const [item] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, item);
    this.#apply(items);
    this.#resetDrag();
  };

  #resetDrag = () => {
    this.draggingId = "";
  };

  #apply(items) {
    this.items = items;
    this.dispatchEvent(
      new CustomEvent("block-group-command", {
        detail: { action: "sort", ids: items.map((item) => item.id) },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

customElements.define("block-group-sort", BlockGroupSort);
