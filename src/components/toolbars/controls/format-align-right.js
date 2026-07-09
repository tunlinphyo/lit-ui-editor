import { renderMaterialIcon } from "../../icon-picker/material-icon-picker.js";
import { FormatAlign } from "./format-align";

export class FormatAlignRight extends FormatAlign {
  command = "alignRight";
  label = "Align right";
  icon = renderMaterialIcon("format_align_right");
}

customElements.define("format-align-right", FormatAlignRight);
