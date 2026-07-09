import "../../components/blocks/image/image-block.js";
import "../../components/toolbars/controls/block-style-color.js";
import "../../components/toolbars/controls/block-style-selector.js";
import "../../components/toolbars/controls/border-radius-control.js";
import "../../components/toolbars/controls/format-disabled.js";
import "../../components/toolbars/controls/format-image-link-target.js";
import "../../components/toolbars/controls/format-image-link.js";
import "../../components/toolbars/controls/format-image-object-fit.js";
import { registerBlock } from "../../registries/block-registry.js";
import { registerCommand } from "../../registries/command-registry.js";
import { FEATURES } from "../../registries/formatter-registry.js";

registerBlock({
  type: "image",
  tagName: "image-block",
  selector: "image-block",
  text: false,
  formattable: true,
  capabilities: [
    FEATURES.align,
    FEATURES.imageUpload,
    FEATURES.objectFit,
    FEATURES.backgroundColor,
    FEATURES.border,
    FEATURES.borderRadius,
    FEATURES.link,
    FEATURES.linkTarget,
    FEATURES.disabled,
  ],
});

for (const definition of [
  { command: "borderRadius", feature: FEATURES.borderRadius },
  { command: "objectFit", feature: FEATURES.objectFit },
  { command: "blockStyle", feature: FEATURES.backgroundColor },
  { command: "imageLink", feature: FEATURES.link },
  { command: "imageLinkTarget", feature: FEATURES.linkTarget },
  { command: "disabled", feature: FEATURES.disabled },
]) {
  registerCommand(definition);
}
