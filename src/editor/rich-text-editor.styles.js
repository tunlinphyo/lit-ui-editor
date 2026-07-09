import { css, unsafeCSS } from "lit";

const populatedGroupOrder = unsafeCSS("group-order:has(> [group-id])");

export const richTextEditorStyles = css`
  :host {
    min-height: calc(100vh - var(--header-height));
    display: grid;
    grid-template-columns: 1fr 240px;
    grid-template-rows: 1fr;
    align-items: start;
    background-color: var(--gray-50);
    box-sizing: border-box;
  }

  section {
    width: 100%;
    align-self: stretch;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    border-inline-end: 1px solid var(--gray-200);
    background-color: var(--gray-100);
    position: relative;
    padding-block-start: 1rem;
  }

  group-order {
    display: grid;
    width: 100%;
    max-width: 68rem;
    padding: 1rem;
    gap: 0.5rem;
    box-sizing: border-box;
  }

  group-order > empty-group-picker-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 12rem;
    border: 2px dashed var(--gray-300);
    border-radius: 0.75rem;
    cursor: pointer;
    background: var(--gray-50);
    color: inherit;
    font: inherit;
  }

  ${populatedGroupOrder} > empty-group-picker-button {
    display: none;
  }

  nav {
    position: sticky;
    top: var(--header-height, 0);
    padding: 0.5rem 1rem;
    max-height: calc(100vh - var(--header-height));
    overflow-y: auto;
  }

  nav hr {
    margin-block: 1rem;
  }

  header-group,
  hero-group,
  about-group,
  image-group,
  paragraph-group,
  footer-group {
    display: block;
    padding: 0;
  }
`;
