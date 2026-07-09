import { css } from "lit";

export const iconPickerPopoverStyles = css`
  :host {
    display: inline-block;
  }

  .input {
    anchor-name: --icon-block-trigger;
    display: inline-grid;
    width: 1em;
    height: 1em;
    padding: 0.25em;
    border: 1px solid transparent;
    color: inherit;
    cursor: pointer;
    place-items: center;
    text-decoration: none;
    vertical-align: top;
  }

  .input[data-empty] {
    border-color: var(--gray-300);
    border-style: dashed;
  }

  .input:hover,
  .input:focus-visible,
  :host([active]) .input {
    outline: 2px solid var(--ui-editor-highlight);
    outline-offset: 2px;
  }

  :host([disabled]) .input {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .input .material-symbol {
    font-size: 1em;
  }

  [popover] {
    position-anchor: --icon-block-trigger;
    position-area: bottom;
    width: max-content;
    margin: 4px;
    padding: 4px;
    border: none;
    border-radius: 0.5rem;
    box-shadow: rgba(0, 0, 0, 0.16) 0 1px 4px;
  }

  .icon-name-form {
    display: grid;
    grid-template-columns: minmax(14rem, 1fr) auto;
    gap: 0.375rem;
    margin-block-end: 0.5rem;
  }

  input {
    box-sizing: border-box;
    min-width: 0;
    height: 2rem;
    padding: 0 0.625rem;
    border: 1px solid var(--gray-300);
    border-radius: 0.375rem;
    font: inherit;
  }

  input:focus-visible {
    outline: 2px solid var(--ui-editor-highlight);
    outline-offset: 1px;
  }

  input[aria-invalid="true"] {
    border-color: var(--red-500, #dc2626);
  }

  .icon-name-form button {
    height: 2rem;
    padding: 0 0.75rem;
    border: none;
    border-radius: 0.375rem;
    background: var(--ui-editor-highlight);
    color: white;
    cursor: pointer;
    font: inherit;
  }

  .icon-name-form button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .feedback {
    grid-column: 1 / -1;
    min-height: 1rem;
    margin: 0;
    color: var(--gray-600);
    font-size: 0.75rem;
    line-height: 1rem;
  }

  .feedback.valid {
    color: var(--green-600, #15803d);
  }

  .feedback.invalid {
    color: var(--red-600, #dc2626);
  }
`;
