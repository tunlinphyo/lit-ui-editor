import { LitElement, html } from "lit";
import { formatTableHeadersStyles } from "./format-table-headers.styles.js";

export class FormatTableHeaders extends LitElement {
  static properties = {
    headerRow: { type: Boolean, attribute: "header-row" },
    headerColumn: { type: Boolean, attribute: "header-column" },
    stripedRows: { type: Boolean, attribute: "striped-rows" },
    disabled: { type: Boolean },
  };

  static styles = formatTableHeadersStyles;

  constructor() {
    super();
    this.headerRow = false;
    this.headerColumn = false;
    this.stripedRows = false;
    this.disabled = true;
  }

  render() {
    return html`
      <fieldset ?disabled=${this.disabled}>
        <!-- <legend>Headers</legend> -->
        <label>
          <span>Header row</span>
          <input
            type="checkbox"
            role="switch"
            .checked=${this.headerRow}
            @change=${(event) => this.#apply("tableHeaderRow", event.currentTarget.checked)}
          />
        </label>
        <label>
          <span>Header column</span>
          <input
            type="checkbox"
            role="switch"
            .checked=${this.headerColumn}
            @change=${(event) => this.#apply("tableHeaderColumn", event.currentTarget.checked)}
          />
        </label>
        <label>
          <span>Striped rows</span>
          <input
            type="checkbox"
            role="switch"
            .checked=${this.stripedRows}
            @change=${(event) => this.#apply("tableStripedRows", event.currentTarget.checked)}
          />
        </label>
      </fieldset>
    `;
  }

  #apply(command, value) {
    this.dispatchEvent(
      new CustomEvent("format-command", {
        detail: { command, value },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

customElements.define("format-table-headers", FormatTableHeaders);
