import { materialSymbolStyles } from "../../icon-picker/material-icon-picker.js";
import { LinkPopoverControl } from "./link-popover-control.js";
import { formatLinkStyles } from "./format-link.styles.js";

export class FormatButtonLink extends LinkPopoverControl {
  static styles = [formatLinkStyles, materialSymbolStyles];
  static command = "buttonLink";
  static subject = "button";
}

customElements.define("format-button-link", FormatButtonLink);
