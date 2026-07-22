import { css } from "lit";

export const tableBlockStyles = css`
  :host {
    display: block;
  }

  :host([selected-axis="table"]) {
    outline: 2px solid var(--ui-editor-highlight);
    outline-offset: 2px;
  }

  .selection-popup {
    position-anchor: --table-axis-trigger;
    position-area: bottom;
    width: fit-content;
    gap: 0.25rem;
    margin: 0.5rem;
    padding: 0.25rem;
    border: 0;
    border-radius: 0.5rem;
    background: white;
    box-shadow: rgba(0, 0, 0, 0.16) 0 1px 4px;
  }

  .selection-popup:popover-open {
    display: grid;
  }

  .selection-popup .delete {
    color: #b42318;
  }

  .column-width-field {
    display: grid;
    grid-template-columns: 1fr 5rem;
    align-items: center;
    gap: 0.5rem;
    min-width: 10rem;
    padding: 0.35rem 0;
    font-size: 0.75rem;
  }

  .column-width-field input {
    box-sizing: border-box;
    width: 100%;
    min-height: 1.5rem;
    padding: 0.25rem 0.4rem;
    border: 1px solid var(--gray-300);
    border-radius: 0.25rem;
    font: inherit;
  }

  .selection-popup .close {
    width: 2rem;
    padding: 0;
    font-size: 1.25rem;
    border-radius: 50%;
    background-color: var(--gray-100);
    border: none;
    display: none;
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding-inline: 0.25rem;
  }

  .popup-header h4 {
    margin: 0;
    font-size: 0.75rem;
  }

  button {
    min-height: 2rem;
    padding-inline: 0.75rem;
    border: 1px solid var(--gray-300);
    border-radius: 0.35rem;
    background: white;
    color: inherit;
    cursor: pointer;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  button:not(:disabled):is(:hover, :focus-visible) {
    outline: 2px solid var(--ui-editor-highlight);
    outline-offset: 0;
  }

  .selection-popup button {
    padding: 0.35rem 0.75rem;
    min-width: 10rem;
    justify-content: space-between;
    align-items: center;
    text-align: left;
    font-size: 0.75rem;
    min-height: 1.5rem;
    border-color: var(--gray-100);
    text-transform: capitalize;
  }

  .selection-popup button:not(:disabled):is(:hover, :focus-visible) {
    background-color: var(--ui-editor-highlight);
    border-color: var(--ui-editor-highlight);
    outline: none;
    color: var(--white);
  }

  .table-scroll {
    position: relative;
    padding-block-start: 1.5rem;
    padding-inline-start: 1.5rem;
    overflow-x: auto;
  }

  .table-selector {
    position: absolute;
    top: 0.3rem;
    left: 0.3rem;
    display: grid;
    width: 1.25rem;
    min-height: 1.25rem;
    padding: 0;
    border-radius: 0.25rem;
    place-items: center;
    color: var(--gray-700);
  }

  .table-selector .material-symbol {
    font-size: 1rem;
  }

  .table-selector[aria-pressed="true"] {
    border-color: var(--ui-editor-highlight);
    background: var(--ui-editor-highlight);
    color: white;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  th,
  td {
    min-width: 8rem;
    padding: 0.625rem;
    border: 0 var(--table-border-style) var(--table-border-color);
    vertical-align: top;
    background: var(--table-body-background);
    color: inherit;
  }

  th {
    background: var(--table-header-background);
    color: var(--white);
    font-weight: 700;
    text-align: start;
  }

  :where(table[data-striped] tbody tr:nth-child(even)) > :is(th, td) {
    background: var(--table-stripe-background);
  }

  table[data-border-position~="horizontal"] tr + tr > :is(th, td),
  table[data-border-position~="horizontal"] thead + tbody tr:first-child > :is(th, td) {
    border-block-start-width: var(--table-border-width);
  }

  table[data-border-position~="vertical"] :is(th, td) + :is(th, td) {
    border-inline-start-width: var(--table-border-width);
  }

  table[data-border-position~="border_outer"] > :first-child tr:first-child > :is(th, td) {
    border-block-start-width: var(--table-border-width);
  }

  table[data-border-position~="border_outer"] > :last-child tr:last-child > :is(th, td) {
    border-block-end-width: var(--table-border-width);
  }

  table[data-border-position~="border_outer"] :is(th, td):first-child {
    border-inline-start-width: var(--table-border-width);
  }

  table[data-border-position~="border_outer"] :is(th, td):last-child {
    border-inline-end-width: var(--table-border-width);
  }

  th.selected,
  td.selected {
    background: #89dcf8;
    box-shadow: inset 0 0 0 2px var(--ui-editor-highlight);
  }

  .cell-content {
    position: relative;
  }

  .axis-selector {
    position: absolute;
    display: grid;
    width: 1.25rem;
    min-height: 1.25rem;
    padding: 0;
    border-radius: 50%;
    place-items: center;
    color: var(--gray-700);
    font-size: 0.75rem;
  }

  .axis-selector[aria-pressed="true"] {
    anchor-name: --table-axis-trigger;
    border-color: var(--ui-editor-highlight);
    background: var(--ui-editor-highlight);
    color: white;
  }

  .column-selector {
    bottom: calc(100% + 0.75rem);
    left: 50%;
    translate: -50% 0;
  }

  .row-selector {
    top: 50%;
    right: calc(100% + 0.75rem);
    translate: 0 -50%;
  }

  .cell-editor::part(editor) {
    min-height: 1.5em;
  }

  :host([disabled]) .selection-popup {
    display: none;
  }

  @media (max-width: 40rem) {
    .selection-popup {
      align-items: stretch;
      flex-direction: column;
      width: auto;
    }
  }
`;
