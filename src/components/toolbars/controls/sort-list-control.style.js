import { css } from "lit";

export const sortListControlStyles = css`
  dialog {
    width: min(32rem, calc(100vw - 2rem));
    max-height: calc(100vh - 2rem);
    padding: 0;
    border: 1px solid var(--gray-200);
    border-radius: 0.5rem;
    color: inherit;
  }

  dialog::backdrop {
    background: rgb(0 0 0 / 0.35);
  }

  form {
    padding: 1rem;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  button {
    width: 1.75rem;
    height: 1.75rem;
    min-width: 1.75rem;
    font-size: 1rem;
    border-radius: 100%;
  }

  header button {
    background-color: var(--gray-50);
    border: 0;
  }

  button .material-symbol {
    font-size: 1.25rem;
  }

  .sort-button {
    border-radius: 0.5rem;
    height: 26px;
    min-width: 32px;
  }

  .sort-button .material-symbol {
    font-size: 1rem;
  }

  ol {
    display: grid;
    gap: 0.5rem;
    max-height: min(32rem, 70vh);
    margin: 1rem 0 0;
    padding: 0;
    overflow-y: auto;
    list-style: none;
  }

  li {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border: 1px solid var(--gray-200);
    border-radius: 0.5rem;
    background: white;
  }

  li[aria-current="true"] {
    border-color: var(--ui-editor-highlight);
  }

  li[draggable="true"] {
    cursor: grab;
  }

  li[draggable="true"]:active {
    cursor: grabbing;
  }

  .handle {
    color: var(--gray-500, #737373);
    font-weight: 700;
  }

  li button {
    border: 0;
  }

  button:not(:disabled):is(:hover, :focus-visible) {
    outline: 2px solid var(--ui-editor-highlight);
    outline-offset: 1px;
  }

  li button:not(:disabled):is(:hover, :focus-visible) {
    outline-offset: -2px;
  }
`;
