import { css } from "lit";

export const editorOutputButtonStyles = css`
  :host {
    display: inline-flex;
  }

  button {
    padding: 0.625rem 1rem;
    color: var(--text-white);
    background-color: var(--brand-500);
    border: 1px solid var(--border-600);
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 600;
  }

  button:hover {
    background-color: var(--ui-editor-primary);
    border-color: var(var(--ui-editor-primary));
  }

  button:focus-visible {
    outline: 2px solid var(--ui-editor-highlight);
    outline-offset: 2px;
  }
`;
