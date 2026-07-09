import { css } from "lit";
import { dialogButtonStyles } from "./dialog-button.styles.js";

export const hashDialogStyles = [
  dialogButtonStyles,
  css`
    dialog {
      width: min(28rem, calc(100vw - 2rem));
      padding: 0;
      border: 1px solid var(--gray-200);
      border-radius: 0.75rem;
      color: inherit;
    }

    dialog::backdrop {
      background: rgb(0 0 0 / 0.35);
    }

    form {
      display: grid;
      gap: 1rem;
      padding: 1.25rem;
    }

    h2 {
      margin: 0;
      font-size: 1.125rem;
    }

    label {
      font-size: 0.75rem;
      font-weight: 600;
    }

    menu {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin: 0;
      padding: 0;
    }

    .field {
      margin-top: -0.5rem;
    }

    .hash-input {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      gap: 0.25rem;
      padding-inline: 0.75rem;
      border: 1px solid var(--gray-300);
      border-radius: 0.5rem;
    }

    .hash-input input {
      min-width: 0;
      padding: 0.5rem 0;
      border: 0;
      outline: 0;
    }

    .hash-input:focus-within {
      outline: 1px solid var(--ui-editor-highlight);
      border-color: var(--ui-editor-highlight);
    }
  `,
];
