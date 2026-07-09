import { css } from "lit";

export const formatTableHeadersStyles = css`
  :host {
    display: block;
  }

  fieldset {
    display: grid;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    border: 0;
  }

  legend {
    margin-block-end: 0.5rem;
    font-weight: 600;
  }

  label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    min-height: 1.5rem;
    cursor: pointer;
    font-size: 0.75rem;
  }

  fieldset:disabled {
    opacity: 0.5;
  }

  fieldset:disabled label {
    cursor: not-allowed;
  }

  input {
    position: relative;
    box-sizing: border-box;
    flex: 0 0 auto;
    width: 2.25rem;
    height: 1.25rem;
    margin: 0;
    appearance: none;
    border: 1px solid var(--gray-300);
    border-radius: 999px;
    background: var(--gray-200);
    cursor: pointer;
    transition:
      background-color 160ms ease,
      border-color 160ms ease;
  }

  input::before {
    position: absolute;
    top: 50%;
    left: 0.1rem;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background: var(--white, white);
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.25);
    content: "";
    transform: translateY(-50%);
    transition: transform 160ms ease;
  }

  input:checked {
    border-color: var(--ui-editor-highlight);
    background: var(--ui-editor-highlight);
  }

  input:checked::before {
    transform: translate(calc(1rem - 1px), -50%);
  }

  input:focus-visible {
    outline: 2px solid var(--ui-editor-highlight);
    outline-offset: 2px;
  }

  input:disabled {
    cursor: not-allowed;
  }
`;
