import { renderMaterialIcon } from "../../icon-picker/material-icon-picker.js";
import { FormatAlign } from "./format-align";

export class FormatAlignCenter extends FormatAlign {
  command = "alignCenter";
  label = "Align center";
  icon = renderMaterialIcon("format_align_center");
}

customElements.define("format-align-center", FormatAlignCenter);
