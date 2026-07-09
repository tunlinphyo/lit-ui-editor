import { css } from "lit";

export const dialogButtonStyles = css`
  button {
    padding: 0.35rem 0.75rem;
    border: 0;
    border-radius: 0.5rem;
    cursor: pointer;
    background: var(--gray-100);
    color: inherit;
    font-size: 0.9rem;
  }

  button:not(:disabled):is(:hover, :focus-visible) {
    background: var(--gray-200);
    outline: 2px solid var(--ui-editor-highlight);
    outline-offset: 0;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  button.primary,
  button[type="submit"] {
    background: var(--ui-editor-primary);
    color: white;
  }

  button.primary:not(:disabled):is(:hover, :focus-visible),
  button[type="submit"]:not(:disabled):is(:hover, :focus-visible) {
    background: color-mix(in srgb, var(--ui-editor-primary), black 10%);
  }
`;
