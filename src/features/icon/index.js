import "../../components/blocks/icon/icon-block.js";
import "../../components/toolbars/controls/block-style-color.js";
import "../../components/toolbars/controls/block-style-selector.js";
import "../../components/toolbars/controls/border-radius-control.js";
import "../../components/toolbars/controls/format-icon-background-color.js";
import "../../components/toolbars/controls/format-icon-link-target.js";
import "../../components/toolbars/controls/format-icon-link.js";
import { registerBlock } from "../../registries/block-registry.js";
import { registerCommand } from "../../registries/command-registry.js";
import { FEATURES } from "../../registries/formatter-registry.js";

registerBlock({
  type: "icon",
  tagName: "icon-block",
  selector: "icon-block",
  text: false,
  formattable: true,
  capabilities: [
    FEATURES.fontSize,
    FEATURES.color,
    FEATURES.backgroundColor,
    FEATURES.border,
    FEATURES.borderRadius,
    FEATURES.link,
    FEATURES.linkTarget,
    FEATURES.disabled,
  ],
});

registerCommand({ command: "borderRadius", feature: FEATURES.borderRadius });
registerCommand({ command: "iconLink", feature: FEATURES.link });
registerCommand({ command: "iconLinkTarget", feature: FEATURES.linkTarget });
registerCommand({ command: "disabled", feature: FEATURES.disabled });
