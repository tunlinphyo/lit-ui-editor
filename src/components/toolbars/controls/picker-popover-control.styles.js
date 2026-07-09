import { css, unsafeCSS } from "lit";

const hasSelector = unsafeCSS(":has(+ [popover]:popover-open)");

export const pickerPopoverControlStyles = css`
  :host {
    display: block;
    width: 100%;
    flex: 1;
  }

  button {
    box-sizing: border-box;
    width: 100%;
    padding: 0.35rem 0.5rem;
    border: 1px solid var(--gray-200);
    border-radius: 0.5rem;
    background: var(--white, white);
    color: inherit;
    cursor: pointer;
    text-align: left;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .trigger {
    anchor-name: --picker-trigger;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.25rem;
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .trigger::after {
    content: "";
    width: 0.5rem;
    height: 0.3rem;
    background-color: var(--gray-400);
    mask: center / contain no-repeat
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 5'%3E%3Cpath d='M0 0h10L5 5z'/%3E%3C/svg%3E");
  }

  .trigger${hasSelector}::after {
    rotate: 180deg;
  }

  [popover] {
    position-anchor: --picker-trigger;
    position-area: bottom;
    min-width: anchor-size(width);
    margin: 4px;
    padding: 4px;
    border: none;
    border-radius: 0.5rem;
    background: var(--white, white);
    box-shadow: rgba(0, 0, 0, 0.16) 0 1px 4px;
  }

  .options {
    display: grid;
    gap: 0.1rem;
  }

  .options button {
    border-color: var(--gray-50);
    border-radius: 0.2rem;
  }

  .options button:first-child {
    border-radius: 0.35rem 0.35rem 0.2rem 0.2rem;
  }
  .options button:last-child {
    border-radius: 0.2rem 0.2rem 0.35rem 0.35rem;
  }

  .options button:hover,
  .options button[aria-pressed="true"] {
    background: var(--ui-editor-highlight);
    color: white;
  }

  .border-style-preview {
    display: block;
    flex: 1 1 auto;
    width: 100%;
    height: 0;
    margin-block: 0.35rem;
    border-top: 3px var(--border-style, solid) currentColor;
  }
`;
