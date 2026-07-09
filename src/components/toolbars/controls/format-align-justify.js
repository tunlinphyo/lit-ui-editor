import { renderMaterialIcon } from "../../icon-picker/material-icon-picker.js";
import { FormatAlign } from "./format-align";

export class FormatAlignJustify extends FormatAlign {
  command = "alignJustify";
  label = "Justify";
  icon = renderMaterialIcon("format_align_justify");
}

customElements.define("format-align-justify", FormatAlignJustify);
