import { css } from "lit";

export const iconBlockStyles = css`
  :host {
    display: block;
  }

  :host([align="center"]) {
    text-align: center;
  }

  :host([align="right"]) {
    text-align: right;
  }

  :host([active]) icon-picker-popover::part(container) {
    outline: 2px solid var(--ui-editor-highlight);
    outline-offset: 2px;
  }
`;
