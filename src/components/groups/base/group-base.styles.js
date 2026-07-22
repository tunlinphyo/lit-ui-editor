import { css, unsafeCSS } from "lit";
import defaultButtonStyles from "../../../default/styles/buttons.css?inline";

export const groupBaseStyles = css`
  :host {
    display: block;
    padding: 0;
    position: relative;
  }

  [data-group-box] {
    background-color: Canvas;
  }

  :host([active]) [data-group-box] {
    outline: 2px solid var(--ui-editor-primary);
    outline-offset: 2px;
  }

  form label {
    font-size: 0.75rem;
  }

  .hash-id-label {
    position: absolute;
    z-index: 5;
    top: 0;
    left: 0;
    width: fit-content;
    margin: 0;
    padding: 0.25rem 0.75rem;
    color: var(--gray-900);
    font-size: 1.25rem;
    font-weight: 600;
    pointer-events: none;
    opacity: 0.5;
  }

  .sort-controls {
    display: flex;
    justify-content: center;
    pointer-events: none;
    position: relative;
    height: 1.25rem;
  }

  .button-group {
    position: absolute;
    bottom: 0;
    left: 50%;
    translate: -50% 0;
    pointer-events: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem;
    background-color: oklch(from var(--gray-200) l c h / 0.5);
    backdrop-filter: blur(3px);
    border-radius: 100vh;
  }

  .button-group button {
    width: 1.75rem;
    height: 1.75rem;
    display: grid;
    place-content: center;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background-color: Canvas;
  }

  .button-group button:not(:disabled):is(:hover, :focus-visible) {
    outline: 2px solid var(--ui-editor-highlight);
    outline-offset: 0;
  }

  /* :host(:hover) .sort-controls,
    :host(:focus-within) .sort-controls {
      opacity: 1;
      pointer-events: auto;
    } */

  ${unsafeCSS(defaultButtonStyles)}
`;
