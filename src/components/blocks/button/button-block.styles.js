import { css } from "lit";

export const buttonBlockStyles = css`
  :host {
    display: block;
  }

  :host([align="center"]) {
    text-align: center;
  }

  :host([align="right"]) {
    text-align: right;
  }

  .button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    width: auto;
    min-width: 2rem;
    height: 2.5rem;
    padding: 0 1.5rem;
    border: 2px solid transparent;
    border-radius: 999px;
    color: white;
    font-size: 14px;
    font: inherit;
    font-weight: 700;
    text-align: center;
  }

  .button:focus-within,
  :host([active]) .button {
    outline: 2px solid var(--ui-editor-highlight);
    outline-offset: 2px;
  }

  :host([icon-position="end"]) icon-block {
    order: 1;
  }

  :host([icon-position="start"]) .button {
    padding-inline-start: 0.5rem;
  }

  :host([icon-position="end"]) .button {
    padding-inline-end: 0.5rem;
  }

  .text {
    display: inline-block;
    min-width: 1ch;
    padding: 0;
    border: none;
    outline: none;
    background: transparent;
    color: inherit;
    font: inherit;
    font-weight: inherit;
    text-align: inherit;
    white-space: nowrap;
  }

  .text:empty::before {
    color: color-mix(in srgb, currentColor 55%, transparent);
    content: attr(data-placeholder);
  }

  icon-block {
    display: inline-block;
    font-size: 1em;
    line-height: 1;
  }
`;
