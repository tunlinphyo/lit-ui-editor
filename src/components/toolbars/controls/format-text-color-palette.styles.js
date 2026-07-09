import { css } from "lit";

export const formatTextColorPaletteStyles = css`
  button {
    background: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    height: 26px;
  }

  .label-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
  }

  button:disabled {
    opacity: 0.3;
  }

  .trigger {
    anchor-name: --color-trigger;
    display: grid;
    grid-template-columns: 42px auto;
    border: 1px solid var(--gray-200);
    place-content: center;
    padding: 0;
    overflow: hidden;
  }

  .selected-color {
    display: block;
    width: 100%;
    height: 100%;
    border-right: 1px solid var(--gray-200);
  }

  .color-wheel-icon {
    display: block;
    width: 24px;
    height: 24px;
    flex: 0 0 auto;
  }

  .trigger:disabled .color-wheel-icon {
    filter: grayscale(1);
  }

  [popover] {
    position-anchor: --color-trigger;
    position-area: bottom;
    border: none;
    border-radius: 4px;
    grid-template-columns: repeat(10, 32px);
    gap: 4px;
    margin: 4px 0 0;
    max-height: min(70vh, 360px);
    overflow: auto;
    padding: 4px;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  }

  [popover]:popover-open {
    display: grid;
  }

  .color {
    background: var(--color);
    border: 1px solid #ccc;
  }

  .color[aria-pressed="true"] {
    outline: 2px solid var(--ui-editor-highlight);
    outline-offset: 0;
  }

  .spacer {
    width: 32px;
    height: 26px;
  }

  .unset {
    position: relative;
    background:
      linear-gradient(to bottom right, transparent 46%, red 47% 53%, transparent 54%), white;
    border: 1px solid #ccc;
  }
`;
