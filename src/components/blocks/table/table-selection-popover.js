import { html } from "lit";
import { renderMaterialIcon } from "../../icon-picker/material-icon-picker.js";

export function renderTableSelectionPopover({
  axis,
  index,
  rowCount,
  columnCount,
  columnWidth,
  onAdd,
  onRemove,
  onSetColumnWidth,
  onClose,
  onToggle,
}) {
  const hasSelection = ["row", "column"].includes(axis);
  const isRow = axis === "row";
  const axisLabel = isRow ? "Row" : "Column";
  const count = isRow ? rowCount : columnCount;
  const label = `${axisLabel} ${index + 1}`;

  return html`
    <div
      id="table-axis-actions"
      class="selection-popup"
      popover
      role="dialog"
      aria-label=${hasSelection ? `${label} actions` : "Table actions"}
      @toggle=${onToggle}
    >
      ${hasSelection
        ? html`
            <header class="popup-header">
              <h4>${label}</h4>
              <button
                class="close"
                type="button"
                title="Close actions"
                aria-label="Close actions"
                @click=${onClose}
              >
                ${renderMaterialIcon("close")}
              </button>
            </header>
            ${!isRow
              ? html`
                  <label class="column-width-field">
                    <span>Width</span>
                    <input
                      type="text"
                      inputmode="decimal"
                      placeholder="Auto"
                      aria-label=${`Width for ${label}`}
                      .value=${columnWidth}
                      @change=${(event) => onSetColumnWidth(index, event.target.value)}
                    />
                  </label>
                `
              : null}
            <button type="button" @click=${() => onAdd(axis, index)}>
              Add ${isRow ? "Row Above" : "Column Before"}
            </button>
            <button type="button" @click=${() => onAdd(axis, index + 1)}>
              Add ${isRow ? "Row Below" : "Column After"}
            </button>
            <button
              class="delete"
              type="button"
              title=${`Delete ${axis}`}
              aria-label=${`Delete ${axis}`}
              ?disabled=${count <= 1}
              @click=${() => onRemove(axis, index)}
            >
              Delete ${axis}
            </button>
          `
        : null}
    </div>
  `;
}
