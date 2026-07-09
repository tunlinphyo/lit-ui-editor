import { renderMaterialIcon } from "../../icon-picker/material-icon-picker.js";
import { FormatAlign } from "./format-align";

export class FormatAlignLeft extends FormatAlign {
  command = "alignLeft";
  label = "Align left";
  icon = renderMaterialIcon("format_align_left");
}

customElements.define("format-align-left", FormatAlignLeft);
