import { FORMATTABLE_MEDIA_SELECTOR } from "./editor-selectors.js";
import { getCommandFeature } from "../registries/command-registry.js";
import { isFeatureEnabled } from "../registries/formatter-registry.js";

export function applyFormatCommand(activeBlock, detail, notifyToolbar) {
  if (!canApplyCommand(activeBlock, detail)) return;

  const alignment = detail.command.match(/^align(Left|Center|Right|Justify)$/)?.[1].toLowerCase();

  if (alignment) {
    if (activeBlock?.matches(FORMATTABLE_MEDIA_SELECTOR)) {
      activeBlock.align = alignment;
      notifyBlockFormat(activeBlock, notifyToolbar);
    } else {
      activeBlock?.align?.(alignment);
    }
    return;
  }

  if (detail.command === "fontFamily") {
    activeBlock?.setFontFamily?.(detail.value);
    return;
  }

  if (detail.command === "borderRadius") {
    if (!activeBlock?.setBorderRadius?.(detail.value)) return;
    notifyBlockFormat(activeBlock, notifyToolbar);
    return;
  }

  if (detail.command === "objectFit") {
    if (!activeBlock?.setObjectFit?.(detail.value)) return;
    notifyBlockFormat(activeBlock, notifyToolbar);
    return;
  }

  if (detail.command === "blockStyle") {
    if (!activeBlock?.setBlockStyle?.(detail.property, detail.value)) return;
    notifyBlockFormat(activeBlock, notifyToolbar);
    return;
  }

  if (detail.command === "buttonIconPlacement") {
    if (!activeBlock?.setButtonIconPlacement?.(detail.value)) return;
    notifyBlockFormat(activeBlock, notifyToolbar);
    return;
  }

  if (detail.command === "buttonLink") {
    if (!activeBlock?.setButtonLink?.(detail.value)) return;
    notifyBlockFormat(activeBlock, notifyToolbar);
    return;
  }

  if (detail.command === "buttonLinkTarget") {
    if (!activeBlock?.setButtonLinkTarget?.(detail.value)) return;
    notifyBlockFormat(activeBlock, notifyToolbar);
    return;
  }

  if (detail.command === "imageLink") {
    if (!activeBlock?.setImageLink?.(detail.value)) return;
    notifyBlockFormat(activeBlock, notifyToolbar);
    return;
  }

  if (detail.command === "imageLinkTarget") {
    if (!activeBlock?.setImageLinkTarget?.(detail.value)) return;
    notifyBlockFormat(activeBlock, notifyToolbar);
    return;
  }

  if (detail.command === "iconLink") {
    if (!activeBlock?.setIconLink?.(detail.value)) return;
    notifyBlockFormat(activeBlock, notifyToolbar);
    return;
  }

  if (detail.command === "iconLinkTarget") {
    if (!activeBlock?.setIconLinkTarget?.(detail.value)) return;
    notifyBlockFormat(activeBlock, notifyToolbar);
    return;
  }

  if (detail.command === "disabled") {
    const disabled = !activeBlock?.getSelectionFormat?.().disabled;
    if (!activeBlock?.setDisabled?.(disabled)) return;
    notifyBlockFormat(activeBlock, notifyToolbar);
    return;
  }

  if (detail.command === "tableHeaderRow") {
    if (!activeBlock?.setHeaderRow?.(detail.value)) return;
    notifyBlockFormat(activeBlock, notifyToolbar);
    return;
  }

  if (detail.command === "tableHeaderColumn") {
    if (!activeBlock?.setHeaderColumn?.(detail.value)) return;
    notifyBlockFormat(activeBlock, notifyToolbar);
    return;
  }

  if (detail.command === "tableStripedRows") {
    if (!activeBlock?.setStripedRows?.(detail.value)) return;
    notifyBlockFormat(activeBlock, notifyToolbar);
    return;
  }

  if (!activeBlock?.formatSelection?.(detail.command, detail.value)) return;
  if (activeBlock.matches(FORMATTABLE_MEDIA_SELECTOR))
    notifyBlockFormat(activeBlock, notifyToolbar);
}

function canApplyCommand(activeBlock, detail) {
  const feature = getCommandFeature(detail);
  if (!feature) return true;

  return isFeatureEnabled(activeBlock?.getSelectionFormat?.(), feature);
}

function notifyBlockFormat(block, notifyToolbar) {
  notifyToolbar(block.getSelectionFormat());
}
