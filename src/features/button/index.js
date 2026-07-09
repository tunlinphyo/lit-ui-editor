import "../../components/blocks/button/button-block.js";
import "../../components/toolbars/controls/block-style-color.js";
import "../../components/toolbars/controls/block-style-selector.js";
import "../../components/toolbars/controls/border-radius-control.js";
import "../../components/toolbars/controls/format-button-icon-placement.js";
import "../../components/toolbars/controls/format-button-link-target.js";
import "../../components/toolbars/controls/format-button-link.js";
import "../../components/toolbars/controls/format-disabled.js";
import { registerBlock } from "../../registries/block-registry.js";
import { registerCommand } from "../../registries/command-registry.js";
import { FEATURES } from "../../registries/formatter-registry.js";

registerBlock({
  type: "button",
  tagName: "button-block",
  selector: "button-block",
  text: false,
  formattable: true,
  capabilities: [
    FEATURES.align,
    FEATURES.icon,
    FEATURES.color,
    FEATURES.backgroundColor,
    FEATURES.border,
    FEATURES.borderRadius,
    FEATURES.link,
    FEATURES.linkTarget,
    FEATURES.disabled,
  ],
});

for (const definition of [
  { command: "buttonIconPlacement", feature: FEATURES.icon },
  { command: "foreColor", feature: FEATURES.color },
  { command: "borderRadius", feature: FEATURES.borderRadius },
  { command: "buttonLink", feature: FEATURES.link },
  { command: "buttonLinkTarget", feature: FEATURES.linkTarget },
  { command: "disabled", feature: FEATURES.disabled },
]) {
  registerCommand(definition);
}
