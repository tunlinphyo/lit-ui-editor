import { css } from "lit";

export const borderRadiusControlStyles = css`
  :host {
    display: grid;
    gap: 0.5rem;
    width: 100%;
    font-size: 0.75rem;
  }

  .title {
    display: block;
  }

  label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.35rem;
  }

  .all-corners {
    display: grid;
    grid-template-columns: 1fr auto;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
  }

  .heading {
    justify-content: space-between;
  }

  .mode input {
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

  .mode input::before {
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

  .mode input:checked {
    border-color: var(--ui-editor-highlight);
    background: var(--ui-editor-highlight);
  }

  .mode input:checked::before {
    transform: translate(calc(1rem - 1px), -50%);
  }

  .mode input:focus-visible {
    outline: 2px solid var(--ui-editor-highlight);
    outline-offset: 2px;
  }

  .corners {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.35rem;
  }

  label:not(.mode) {
    display: grid;
    gap: 0.2rem;
    justify-content: stretch;
  }

  border-radius-picker {
    flex: 1;
    width: 100%;
    min-width: 0;
  }

  .all-corners border-radius-picker {
    width: 6rem;
  }
`;
