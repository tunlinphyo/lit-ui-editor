import { FormatColor } from "./format-color.js";
import { DEFAULT_TEXT_COLOR } from "../../../utils/colors.js";

export class FormatTextColor extends FormatColor {
  command = "foreColor";
  label = "Color";

  constructor() {
    super();
    this.value = DEFAULT_TEXT_COLOR;
  }
}

customElements.define("format-text-color", FormatTextColor);
