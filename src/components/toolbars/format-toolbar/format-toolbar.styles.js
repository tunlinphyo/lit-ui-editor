import { css } from "lit";

export const formatToolbarStyles = css`
  :host,
  .tools:not([hidden]) {
    width: 100%;
    display: grid;
    gap: 0.5rem;
  }

  .tools h2 {
    text-align: center;
    font-size: 1.1rem;
    font-weight: normal;
    margin: 0;
  }

  .format-group {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 0.25rem;
  }

  .format-group-aligns {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    align-items: center;
    gap: 0.25rem;
    background-color: var(--gray-200);
    padding: 0.1rem;
    border-radius: 0.6rem;
  }

  .group-label {
    font-size: 0.75rem;
    margin-top: -0.25rem;
    margin-bottom: -0.25rem;
  }

  .format-link-group {
    width: 100%;
    display: grid;
    grid-template-columns: auto auto 1fr;
    gap: 0.2rem;
    align-items: center;
  }

  .format-font-group {
    width: 100%;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.2rem;
    align-items: center;
  }

  .format-highlight-group {
    width: 100%;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.2rem;
    align-items: center;
  }

  .format-border-group {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 0.2rem;
    align-items: center;
  }
`;
