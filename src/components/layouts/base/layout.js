import { LitElement, html } from "lit";
import { layoutStyles } from "./layout.styles.js";

export class Layout extends LitElement {
  static type = "";
  static styles = layoutStyles;

  static define(tagName) {
    customElements.define(tagName, this);
    return this;
  }

  render() {
    const type = this.constructor.type || this.localName.replace(/^layout-/, "");

    return html`
      <div class="canvas" role="img" aria-label=${`${type} layout preview`}>
        ${this.renderDesign()}
      </div>
    `;
  }

  renderDesign() {
    throw new TypeError(`${this.constructor.name} must implement renderDesign()`);
  }
}
