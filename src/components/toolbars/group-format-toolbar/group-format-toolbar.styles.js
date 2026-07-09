import { css } from "lit";

export const groupFormatToolbarStyles = css`
  :host {
    width: 100%;
    display: grid;
    gap: 0.5rem;
  }

  h2 {
    text-align: center;
    font-size: 1.1rem;
    font-weight: normal;
    margin: 0;
  }

  .group-label {
    font-size: 0.75rem;
    margin-top: -0.25rem;
    margin-bottom: -0.25rem;
  }

  .format-border-group {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 0.2rem;
    align-items: center;
  }

  .format-group {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 0.25rem;
  }

  .format-group--withborder {
    border-block: 1px solid var(--gray-200);
    padding-block: 0.5rem;
    margin-block: 0.5rem;
  }
`;
