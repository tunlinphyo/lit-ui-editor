import { css } from "lit";

// todo fix below todo
export const groupStyleSelectorStyles = css`
  label {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr auto;
    justify-content: space-between;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
  }

  select {
    box-sizing: border-box;
    width: 100%;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--gray-200);
    border-radius: 0.5rem;
    background: var(--white);
    color: inherit;
    cursor: pointer;
    font: inherit;
  }

  select:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  button {
    box-sizing: border-box;
    border: 1px solid var(--gray-200);
    border-radius: 0.5rem;
    background: var(--white);
    color: inherit;
    cursor: pointer;
    font: inherit;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .border-style-group {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr auto;
    justify-content: space-between;
    align-items: center;
    /* gap: 0.25rem; */
    font-size: 0.75rem;
  }

  .border-style-trigger {
    anchor-name: --border-style-trigger;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    width: 72px;
    height: 26px;
    padding: 0 0.5rem;
  }

  .border-style-trigger::after {
    content: "";
    flex: 0 0 auto;
    width: 0.35rem;
    height: 0.35rem;
    border-right: 1px solid currentColor;
    border-bottom: 1px solid currentColor;
    transform: translateY(-25%) rotate(45deg);
  }

  .border-style-preview {
    display: block;
    flex: 1 1 auto;
    width: 100%;
    height: 0;
    border-top: 3px var(--border-style, solid) currentColor;
  }

  .border-style-none {
    display: block;
    flex: 1 1 auto;
    width: 100%;
    font-size: 0.75rem;
    line-height: 1;
    text-align: center;
  }

  [popover] {
    position-anchor: --border-style-trigger;
    position-area: bottom;
    border: none;
    border-radius: 4px;
    gap: 4px;
    margin: 4px 0 0;
    padding: 4px;
    box-shadow: rgba(0, 0, 0, 0.16) 0 1px 4px;
  }

  [popover]:popover-open {
    display: grid;
  }

  .border-style-option {
    width: 92px;
    height: 26px;
    padding: 0 0.75rem;
  }

  .border-style-option[aria-pressed="true"] {
    outline: 2px solid var(--ui-editor-highlight);
    outline-offset: 0;
  }

  .border-position-group {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.2rem;
    width: 100%;
    padding: 0.2rem;
    border-radius: 0.5rem;
    background: var(--gray-100);
  }

  .border-position-option {
    display: grid;
    place-items: center;
    min-width: 0;
    height: 24px;
    padding: 0;
    border: none;
    background: transparent;
  }

  .border-position-option[aria-pressed="true"] {
    background: var(--ui-editor-highlight);
    color: var(--white);
  }

  .border-position-icon {
    box-sizing: border-box;
    display: block;
    width: 18px;
    height: 12px;
    border: 2px solid currentColor;
    /* background:
      linear-gradient(currentColor 0 0) center 5px / 10px 1px no-repeat,
      linear-gradient(currentColor 0 0) center 8px / 8px 1px no-repeat; */
  }

  .border-position-option[data-position="top"] .border-position-icon {
    border-width: 2px 1px 1px;
    border-color: var(--gray-300);
    border-top-color: currentColor;
  }

  .border-position-option[data-position="right"] .border-position-icon {
    border-width: 1px 2px 1px 1px;
    border-color: var(--gray-300);
    border-right-color: currentColor;
  }

  .border-position-option[data-position="bottom"] .border-position-icon {
    border-width: 1px 1px 2px;
    border-color: var(--gray-300);
    border-bottom-color: currentColor;
  }

  .border-position-option[data-position="left"] .border-position-icon {
    border-width: 1px 1px 1px 2px;
    border-color: var(--gray-300);
    border-left-color: currentColor;
  }
`;
