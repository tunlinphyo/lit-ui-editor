import { css } from "lit";
import { dialogButtonStyles } from "./dialog-button.styles.js";

export const confirmDialogStyles = [
  dialogButtonStyles,
  css`
    dialog {
      width: min(24rem, calc(100vw - 2rem));
      padding: 1rem;
      border: 1px solid #999;
      border-radius: 0.5rem;
    }

    dialog::backdrop {
      background: rgb(0 0 0 / 0.35);
    }

    h2 {
      margin-block: 0 0.5rem;
    }

    p {
      margin-block: 0 1rem;
    }

    menu {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin: 0;
      padding: 0;
    }
  `,
];
