import { css } from "lit";

export const textBlockStyles = css`
  :host {
    display: block;
  }

  h1,
  h2,
  h3 {
    margin-block: var(--predefined-margin, 0.5rem);
  }

  .text-bold {
    font-weight: 700;
  }

  .text-italic {
    font-style: italic;
  }

  .text-underline {
    text-decoration: underline;
  }

  .editor {
    box-sizing: border-box;
    outline: none;
    white-space: pre-wrap;
    overflow-wrap: break-word;
  }

  .editor a {
    color: var(--ui-editor-link-text-color);
  }

  :host(:not([disabled])) .editor:focus,
  :host(:not([disabled])[active]) .editor,
  :host(:not([disabled])[has-format-selection]) .editor {
    outline: 2px solid var(--ui-editor-highlight);
    outline-offset: 2px;
  }

  .editor[data-empty]:not([data-paragraph-mode])::after {
    content: attr(data-placeholder);
    color: #888;
    pointer-events: none;
  }

  .editor[data-empty][data-paragraph-mode] > p:only-child::after {
    content: var(--placeholder);
    color: #888;
    pointer-events: none;
  }

  .editor[data-empty] > br:only-child,
  .editor[data-empty][data-paragraph-mode] > p:only-child > br:only-child {
    display: none;
  }

  [data-link-selection] {
    text-decoration: underline;
  }

  :host([disabled]) .editor {
    opacity: 0.6;
    cursor: not-allowed;
    user-select: none;
  }

  :host([type="p"]) p {
    margin-block: var(--predefined-margin, 0.5rem);
  }
`;
