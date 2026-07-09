import { css } from "lit";

export const formatToggleStyles = css`
  button {
    background: white;
    border: 1px solid var(--gray-200);
    border-radius: 0.5rem;
    cursor: pointer;
    height: 26px;
    min-width: 32px;

    display: grid;
    place-content: center;
    padding: 0;
  }

  button .material-symbol {
    font-size: 1rem;
  }

  button:disabled {
    opacity: 0.5;
  }

  :host([applied]) button {
    background: var(--ui-editor-highlight);
    color: white;
  }
`;
