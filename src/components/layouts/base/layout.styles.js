import { css } from "lit";

export const layoutStyles = css`
  :host {
    display: block;
    width: 100%;
    pointer-events: none;
  }

  .canvas {
    box-sizing: border-box;
    display: grid;
    gap: 0.4rem;
    width: 100%;
    min-height: 6rem;
    padding: 0.6rem;
    overflow: hidden;
    border: 1px solid #b8b8b8;
    border-radius: 0.5rem;
    background: #ffffff;
  }

  .row,
  .cols,
  .columns,
  .cards,
  .split {
    display: flex;
    gap: 0.4rem;
  }

  .cols {
    flex-direction: column;
  }

  .grow {
    flex: 1 0 auto;
  }

  .row {
    align-items: center;

    &.center {
      justify-content: center;
    }
  }

  .custom-row {
    width: 70%;
    padding: 1rem;
    border: 1px dashed #b8b8b8;
    background-color: #f4f4f4;
    border-radius: 0.5rem;
  }

  .row.baseline {
    flex: 1 0 auto;
    align-items: baseline;
  }

  .spacer {
    flex: 1;
  }

  .columns > *,
  .cards > *,
  .split > * {
    flex: 1;
  }

  .stack {
    display: grid;
    gap: 0.3rem;
  }

  .center {
    place-items: center;
    align-content: center;
  }

  .line,
  .title,
  .media,
  .card,
  .circle,
  .button,
  .logo {
    display: block;
    background: #b8b8b8;
  }

  .line {
    width: 100%;
    height: 0.3rem;
    border-radius: 100vh;
  }

  .line.short {
    width: 55%;
  }

  .line.medium {
    width: 75%;
  }

  .title {
    width: 45%;
    height: 0.55rem;
    border-radius: 100vh;
    background: #8f8f8f;

    &.center {
      margin: 0 auto;
    }
  }

  .media {
    min-height: 3.8rem;
    border-radius: 0.3rem;
    background: #cdcdcd;
  }

  .image {
    width: var(--width);
    height: var(--height);
    border-radius: 0.3rem;
    background: #cdcdcd;
  }

  .card {
    min-height: 3.4rem;
    padding: 0.5rem;
    border: 1px solid #aaa;
    border-radius: 0.3rem;
    background: #dedede;
  }

  .table-preview {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    overflow: hidden;
    border: 1px solid #aaa;
    border-radius: 0.3rem;
  }

  .table-cell {
    min-height: 1rem;
    border-inline-end: 1px solid #aaa;
    border-block-end: 1px solid #aaa;
    background: #dedede;
  }

  .table-cell:nth-child(3n) {
    border-inline-end: 0;
  }

  .table-cell:nth-last-child(-n + 3) {
    border-block-end: 0;
  }

  .table-cell:nth-child(-n + 3) {
    background: #b8b8b8;
  }

  .circle {
    flex: 0 0 auto;
    width: var(--size, 1.1rem);
    height: var(--size, 1.1rem);
    border-radius: 50%;
  }

  .logo {
    flex: 0 0 auto;
    width: 2rem;
    height: 2rem;
    border-radius: 0.2rem;
    background: #8f8f8f;
  }

  .button {
    width: 2.8rem;
    height: 1.2rem;
    border-radius: 100vh;
    background: #9f9f9f;
  }

  .nav-button {
    display: flex;
    gap: 0.1rem;
    align-items: center;
    justify-content: center;

    &::before,
    &::after {
      display: block;
      content: "";
    }

    &::before {
      width: 1rem;
      height: 1rem;
      border-radius: 100%;
      background-color: #b8b8b8;
    }

    &::after {
      width: 2rem;
      height: 0.3rem;
      border-radius: 0.2rem;
      background-color: #b8b8b8;
    }
  }
`;
