import { BlockStyleColor } from "./block-style-color.js";

export class TableHeaderBackgroundColor extends BlockStyleColor {
  label = "Header Background";
  property = "headerBackgroundColor";
}

export class TableBodyBackgroundColor extends BlockStyleColor {
  label = "Body Background";
  property = "bodyBackgroundColor";
}

export class TableStripeBackgroundColor extends BlockStyleColor {
  label = "Stripe Background";
  property = "stripeBackgroundColor";
}

export class TableBorderColor extends BlockStyleColor {
  label = "Border Color";
  property = "borderColor";

  constructor() {
    super();
    this.showLabel = false;
  }
}

customElements.define("table-header-background-color", TableHeaderBackgroundColor);
customElements.define("table-body-background-color", TableBodyBackgroundColor);
customElements.define("table-stripe-background-color", TableStripeBackgroundColor);
customElements.define("table-border-color", TableBorderColor);
