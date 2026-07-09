import { css } from "lit";

export const formatLinkStyles = css`
  :host {
    display: inline-flex;
  }
  button,
  input {
    box-sizing: border-box;
    height: 26px;
    border: 1px solid var(--gray-200);
  }

  input {
    min-width: 15rem;
    border-radius: 0.2rem;
    padding-inline: 0.5rem;
  }

  input:focus-visible {
    outline: 1px solid var(--ui-editor-highlight);
    border-color: var(--ui-editor-highlight);
  }

  button {
    background: var(--white);
    border-radius: 0.5rem;
    cursor: pointer;
    min-width: 32px;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  button:disabled {
    opacity: 0.5;
  }

  svg {
    display: block;
    fill: none;
    margin: auto;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

  :host > button {
    anchor-name: --link-trigger;
  }

  :host([applied]) > button {
    background: var(--ui-editor-highlight);
    color: white;
  }

  [popover] {
    position-anchor: --link-trigger;
    position-area: bottom;
    border: none;
    border-radius: 4px;
    margin: 4px;
    padding: 4px;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  }

  form {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 0.25rem;
  }

  form button .material-symbol {
    font-size: 1.1rem;
  }

  .btn-save {
    color: green;
    border-radius: 0.5rem 0.2rem 0.2rem 0.5rem;
  }
  .btn-remove {
    color: red;
    border-radius: 0.2rem 0.5rem 0.5rem 0.2rem;
  }
`;
