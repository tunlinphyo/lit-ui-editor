import { css } from "lit";
import { dialogButtonStyles } from "../dialogs/dialog-button.styles.js";

export const groupPickerDialogStyles = [
  dialogButtonStyles,
  css`
    dialog {
      width: min(30rem, calc(100vw - 2rem));
      max-height: min(40rem, 75vh);
      padding: 0;
      border: 1px solid var(--gray-300);
      border-radius: 0.75rem;
      color: inherit;
      background-color: var(--gray-25);
      overscroll-behavior: none;
    }

    dialog::backdrop {
      background: rgb(0 0 0 / 0.35);
    }

    form {
      box-sizing: border-box;
      width: 100%;
      padding: 0;
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr auto;
    }

    header {
      position: sticky;
      top: 0;
      background-color: var(--white);
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--gray-50);
    }

    h2 {
      margin: 0;
      font-size: 1.25rem;
    }

    fieldset {
      display: grid;
      gap: 0.5rem;
      margin: 0;
      padding: 1rem;
      border: 0;
    }

    legend {
      margin-block-end: 0.5rem;
      font-weight: 600;
    }

    .group-option {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      align-items: center;
      gap: 0.75rem;
      padding: 0;
      border-radius: 0.5rem;
      cursor: pointer;
    }

    .group-option:has(input:checked) {
      outline: 2px solid var(--ui-editor-highlight);
      outline-offset: -2px;
    }

    .group-option input {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
    }

    .group-option:has(input:focus-visible) {
      outline: 2px solid var(--ui-editor-highlight);
      outline-offset: 2px;
    }

    .group-option .option-name {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    footer {
      position: sticky;
      bottom: 0;
      background-color: var(--white);
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-top: 1px solid var(--gray-50);
    }
  `,
];
