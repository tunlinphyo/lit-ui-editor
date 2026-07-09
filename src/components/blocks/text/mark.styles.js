import { css } from "lit";

export const markStyles = css`
  .text-mark {
    --mark-highlight-color: var(--ui-editor-mark);
    --mark-background-size: var(--mark-default-background-size, 100%);

    padding: var(--mark-default-padding, 0 0.25rem);
    border-radius: var(--mark-default-border-radius, 0.2rem);
    color: inherit;
    background-color: transparent;
    background-image: linear-gradient(var(--mark-highlight-color), var(--mark-highlight-color));
    background-position: bottom;
    background-repeat: no-repeat;
    background-size: var(--mark-background-size);
  }

  .text-mark.mark-primary {
    --mark-background-size: var(--mark-primary-background-size, 70%);

    padding: var(--mark-primary-padding, 0);
    border-radius: var(--mark-primary-border-radius, 0);
  }

  .text-mark.mark-secondary {
    --mark-background-size: var(--mark-secondary-background-size, 40%);

    padding: var(--mark-secondary-padding, 0);
    border-radius: var(--mark-secondary-border-radius, 0);
  }
`;
