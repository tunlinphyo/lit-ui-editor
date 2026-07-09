import { LitElement, html } from "lit";
import {
  materialSymbolStyles,
  renderMaterialIcon,
} from "../../icon-picker/material-icon-picker.js";
import "../inline-text/inline-text-block.js";
import { getCapabilities } from "../../../registries/formatter-registry.js";
import {
  clampIndex,
  createCell,
  createCellValue,
  createCells,
  DEFAULT_COLUMNS,
  DEFAULT_ROWS,
  normalizeCell,
  normalizeCells,
} from "./table-block.helpers.js";
import { tableBlockStyles } from "./table-block.styles.js";
import { renderTableSelectionPopover } from "./table-selection-popover.js";

export class TableBlock extends LitElement {
  static properties = {
    blockId: { type: String, attribute: "block-id", reflect: true },
    cells: { state: true },
    headerRow: { type: Boolean, attribute: "header-row", reflect: true },
    headerColumn: { type: Boolean, attribute: "header-column", reflect: true },
    headerBackgroundColor: {
      type: String,
      attribute: "header-background-color",
      reflect: true,
    },
    bodyBackgroundColor: {
      type: String,
      attribute: "body-background-color",
      reflect: true,
    },
    stripedRows: { type: Boolean, attribute: "striped-rows", reflect: true },
    stripeBackgroundColor: {
      type: String,
      attribute: "stripe-background-color",
      reflect: true,
    },
    borderWidth: { type: String, attribute: "border-width", reflect: true },
    borderColor: { type: String, attribute: "border-color", reflect: true },
    borderStyle: { type: String, attribute: "border-style", reflect: true },
    borderPosition: { type: String, attribute: "border-position", reflect: true },
    disabled: { type: Boolean, reflect: true },
    selectedAxis: { type: String, attribute: "selected-axis", reflect: true },
    selectedIndex: { state: true },
  };

  static styles = [tableBlockStyles, materialSymbolStyles];

  constructor() {
    super();
    this.blockId = "";
    this.cells = createCells(DEFAULT_ROWS, DEFAULT_COLUMNS);
    this.headerRow = true;
    this.headerColumn = false;
    this.headerBackgroundColor = "";
    this.bodyBackgroundColor = "";
    this.stripedRows = false;
    this.stripeBackgroundColor = null;
    this.borderWidth = "1px";
    this.borderColor = "";
    this.borderStyle = "solid";
    this.borderPosition = "horizontal vertical";
    this.disabled = false;
    this.selectedAxis = "";
    this.selectedIndex = -1;
  }

  init(options = {}) {
    const {
      id = "",
      cells = options.rows,
      headerRow = true,
      headerColumn = false,
      headerBackgroundColor = "",
      bodyBackgroundColor = "",
      stripedRows = false,
      stripeBackgroundColor = "",
      borderWidth = "1px",
      borderColor = "",
      borderStyle = "solid",
      borderPosition = "horizontal vertical",
      disabled = false,
    } = options;

    this.blockId = id;
    this.cells = normalizeCells(cells);
    this.headerRow = Boolean(headerRow);
    this.headerColumn = Boolean(headerColumn);
    this.headerBackgroundColor = String(headerBackgroundColor || "");
    this.bodyBackgroundColor = String(bodyBackgroundColor || "");
    this.stripedRows = Boolean(stripedRows);
    this.stripeBackgroundColor = this.stripedRows ? String(stripeBackgroundColor || "") : null;
    this.borderWidth = String(borderWidth || "");
    this.borderColor = String(borderColor || "");
    this.borderStyle = String(borderStyle || "");
    this.borderPosition = normalizeTableBorderPosition(borderPosition);
    this.disabled = Boolean(disabled);
    this.selectedAxis = "";
    this.selectedIndex = -1;
    return this;
  }

  toJSON() {
    return {
      id: this.blockId,
      type: "table",
      cells: this.#readCells(),
      headerRow: this.headerRow,
      headerColumn: this.headerColumn,
      headerBackgroundColor: this.headerBackgroundColor,
      bodyBackgroundColor: this.bodyBackgroundColor,
      stripedRows: this.stripedRows,
      stripeBackgroundColor: this.stripeBackgroundColor,
      borderWidth: this.borderWidth,
      borderColor: this.borderColor,
      borderStyle: this.borderStyle,
      borderPosition: this.borderPosition,
      disabled: this.disabled,
    };
  }

  getSelectionFormat() {
    return {
      type: "table",
      headerRow: this.headerRow,
      headerColumn: this.headerColumn,
      headerBackgroundColor: this.headerBackgroundColor,
      bodyBackgroundColor: this.bodyBackgroundColor,
      stripedRows: this.stripedRows,
      stripeBackgroundColor: this.stripeBackgroundColor,
      borderWidth: this.borderWidth,
      borderColor: this.borderColor,
      borderStyle: this.borderStyle,
      borderPosition: this.borderPosition,
      capabilities: getCapabilities("table"),
    };
  }

  addRow(index = this.cells.length) {
    const cells = this.#readCells();
    const insertionIndex = clampIndex(index, cells.length, true);
    cells.splice(insertionIndex, 0, Array.from({ length: cells[0].length }, createCell));
    this.cells = cells;
    this.selectedAxis = "row";
    this.selectedIndex = insertionIndex;
    this.#notifyChange();
    return true;
  }

  removeRow(index = this.cells.length - 1) {
    if (this.cells.length <= 1) return false;

    const cells = this.#readCells();
    const removalIndex = clampIndex(index, cells.length);
    cells.splice(removalIndex, 1);
    this.cells = cells;
    if (this.selectedAxis === "row") {
      this.selectedIndex = Math.min(removalIndex, cells.length - 1);
    }
    this.#notifyChange();
    return true;
  }

  addColumn(index = this.cells[0].length) {
    const cells = this.#readCells();
    const insertionIndex = clampIndex(index, cells[0].length, true);
    this.cells = cells.map((row) => {
      const nextRow = [...row];
      nextRow.splice(insertionIndex, 0, createCell());
      return nextRow;
    });
    this.selectedAxis = "column";
    this.selectedIndex = insertionIndex;
    this.#notifyChange();
    return true;
  }

  removeColumn(index = this.cells[0].length - 1) {
    if (this.cells[0].length <= 1) return false;

    const cells = this.#readCells();
    const removalIndex = clampIndex(index, cells[0].length);
    this.cells = cells.map((row) => row.filter((_, columnIndex) => columnIndex !== removalIndex));
    if (this.selectedAxis === "column") {
      this.selectedIndex = Math.min(removalIndex, this.cells[0].length - 1);
    }
    this.#notifyChange();
    return true;
  }

  setHeaderRow(enabled) {
    this.cells = this.#readCells();
    this.headerRow = Boolean(enabled);
    this.#notifyChange();
    return true;
  }

  setHeaderColumn(enabled) {
    this.cells = this.#readCells();
    this.headerColumn = Boolean(enabled);
    this.#notifyChange();
    return true;
  }

  setStripedRows(enabled) {
    this.cells = this.#readCells();
    this.stripedRows = Boolean(enabled);
    this.stripeBackgroundColor = this.stripedRows ? (this.stripeBackgroundColor ?? "") : null;
    this.#notifyChange();
    return true;
  }

  setBlockStyle(property, value) {
    if (
      ![
        "headerBackgroundColor",
        "bodyBackgroundColor",
        "stripeBackgroundColor",
        "borderWidth",
        "borderColor",
        "borderStyle",
        "borderPosition",
      ].includes(property)
    ) {
      return false;
    }
    if (property === "borderPosition" && !isValidTableBorderPosition(value)) return false;
    const nextValue = property === "borderPosition" ? normalizeTableBorderPosition(value) : value;

    this.cells = this.#readCells();
    this[property] = nextValue;
    if (property === "borderColor" && !value) {
      this.borderWidth = "";
      this.borderStyle = "";
    }
    if (property === "borderStyle" && (!value || value === "none")) {
      this.borderWidth = "";
      this.borderColor = "";
      this.borderPosition = "";
    }
    if (property === "borderWidth" && value && !this.borderStyle) this.borderStyle = "solid";
    if (property === "borderStyle" && value && value !== "none" && !this.borderWidth) {
      this.borderWidth = "1px";
    }
    this.#notifyChange();
    return true;
  }

  updated(changedProperties) {
    if (changedProperties.has("disabled") && this.disabled) {
      this.#clearSelection();
    }
  }

  render() {
    return html`
      ${renderTableSelectionPopover({
        axis: this.selectedAxis,
        index: this.selectedIndex,
        rowCount: this.cells.length,
        columnCount: this.cells[0].length,
        onAdd: this.#addAxis,
        onRemove: this.#removeAxis,
        onClose: this.#clearSelection,
        onToggle: this.#onPopoverToggle,
      })}
      <div class="table-scroll">
        ${!this.disabled
          ? html`
              <button
                class="table-selector"
                type="button"
                title="Select whole table"
                aria-label="Select whole table"
                aria-pressed=${this.selectedAxis === "table"}
                @click=${this.#selectTable}
              >
                ${renderMaterialIcon("table_view")}
              </button>
            `
          : null}
        <table
          data-border-position=${this.borderPosition}
          ?data-striped=${this.stripedRows}
          style=${`
            --table-header-background: ${this.headerBackgroundColor};
            --table-body-background: ${this.bodyBackgroundColor};
            --table-stripe-background: ${this.stripeBackgroundColor || this.bodyBackgroundColor};
            --table-border-width: ${this.borderWidth || "0"};
            --table-border-color: ${this.borderColor};
            --table-border-style: ${this.borderStyle || "none"};
          `}
        >
          ${this.headerRow
            ? html`<thead>
                ${this.#renderRow(this.cells[0], 0)}
              </thead>`
            : null}
          <tbody>
            ${this.cells
              .slice(this.headerRow ? 1 : 0)
              .map((row, index) => this.#renderRow(row, index + (this.headerRow ? 1 : 0)))}
          </tbody>
        </table>
      </div>
    `;
  }

  #renderRow(row, rowIndex) {
    return html`
      <tr>
        ${row.map((cell, columnIndex) => this.#renderCell(cell, rowIndex, columnIndex))}
      </tr>
    `;
  }

  #renderCell(cell, rowIndex, columnIndex) {
    const selected =
      (this.selectedAxis === "row" && this.selectedIndex === rowIndex) ||
      (this.selectedAxis === "column" && this.selectedIndex === columnIndex);
    const className = selected ? "selected" : "";
    const editor = html`
      <div class="cell-content">
        ${!this.disabled && rowIndex === 0
          ? html`
              <button
                class="axis-selector column-selector"
                type="button"
                aria-label=${`Select column ${columnIndex + 1}`}
                aria-controls="table-axis-actions"
                aria-expanded=${this.selectedAxis === "column" &&
                this.selectedIndex === columnIndex}
                aria-haspopup="dialog"
                aria-pressed=${this.selectedAxis === "column" && this.selectedIndex === columnIndex}
                @click=${() => this.#selectAxis("column", columnIndex)}
              >
                ${columnIndex + 1}
              </button>
            `
          : null}
        ${!this.disabled && columnIndex === 0
          ? html`
              <button
                class="axis-selector row-selector"
                type="button"
                aria-label=${`Select row ${rowIndex + 1}`}
                aria-controls="table-axis-actions"
                aria-expanded=${this.selectedAxis === "row" && this.selectedIndex === rowIndex}
                aria-haspopup="dialog"
                aria-pressed=${this.selectedAxis === "row" && this.selectedIndex === rowIndex}
                @click=${() => this.#selectAxis("row", rowIndex)}
              >
                ${rowIndex + 1}
              </button>
            `
          : null}
        <inline-text
          class="cell-editor"
          block-id=${`cell-${rowIndex}-${columnIndex}`}
          type="p"
          placeholder="Text"
          .textChildren=${cell.children}
          .textAlign=${cell.textAlign}
          .fontSize=${cell.fontSize}
          .fontFamily=${cell.fontFamily}
          ?disabled=${this.disabled}
          predefined-margin="0"
          features="fontFamily,fontSize,color,bold,italic,underline,align,link"
        ></inline-text>
      </div>
    `;

    if (this.headerRow && rowIndex === 0) {
      return html`<th class=${className} scope="col">${editor}</th>`;
    }
    if (this.headerColumn && columnIndex === 0) {
      return html`<th class=${className} scope="row">${editor}</th>`;
    }
    return html`<td class=${className}>${editor}</td>`;
  }

  #addAxis = (axis, index) => (axis === "row" ? this.addRow(index) : this.addColumn(index));

  #removeAxis = (axis, index) =>
    axis === "row" ? this.removeRow(index) : this.removeColumn(index);

  async #selectAxis(axis, index) {
    if (this.selectedAxis === axis && this.selectedIndex === index) {
      this.#clearSelection();
      return;
    }

    this.selectedAxis = axis;
    this.selectedIndex = index;
    await this.updateComplete;
    if (!this.#selectionPopover?.matches(":popover-open")) {
      this.#selectionPopover?.showPopover();
    }
  }

  #selectTable = () => {
    if (this.selectedAxis === "table") {
      this.#clearSelection();
      return;
    }

    if (this.#selectionPopover?.matches(":popover-open")) {
      this.#selectionPopover.hidePopover();
    }
    this.selectedAxis = "table";
    this.selectedIndex = -1;
  };

  clearSelection() {
    this.#clearSelection();
  }

  #clearSelection = () => {
    const popover = this.#selectionPopover;
    if (popover?.matches(":popover-open")) popover.hidePopover();
    this.selectedAxis = "";
    this.selectedIndex = -1;
  };

  #onPopoverToggle = (event) => {
    if (event.newState !== "closed" || !["row", "column"].includes(this.selectedAxis)) {
      return;
    }

    this.selectedAxis = "";
    this.selectedIndex = -1;
  };

  get #selectionPopover() {
    return this.renderRoot.querySelector("#table-axis-actions");
  }

  #readCells() {
    const editors = [...this.renderRoot.querySelectorAll(".cell-editor")];
    if (editors.length !== this.cells.flat().length) {
      return this.cells.map((row) => row.map(normalizeCell));
    }

    const values = editors.map((editor) => {
      return createCellValue(editor.toJSON());
    });
    let offset = 0;
    return this.cells.map((row) => {
      const nextRow = values.slice(offset, offset + row.length);
      offset += row.length;
      return nextRow;
    });
  }

  #notifyChange() {
    this.dispatchEvent(
      new CustomEvent("editor-change", {
        bubbles: true,
        composed: true,
      }),
    );
  }
}

customElements.define("table-block", TableBlock);

const TABLE_BORDER_POSITIONS = ["horizontal", "vertical", "border_outer"];

function normalizeTableBorderPosition(value) {
  const selected = new Set(
    String(value ?? "")
      .split(/\s+/)
      .filter(Boolean),
  );
  return TABLE_BORDER_POSITIONS.filter((position) => selected.has(position)).join(" ");
}

function isValidTableBorderPosition(value) {
  return String(value ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .every((position) => TABLE_BORDER_POSITIONS.includes(position));
}
