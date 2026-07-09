import { applyFormatCommand } from "./editor-commands.js";
import {
  FORMATTABLE_MEDIA_SELECTOR,
  NON_TEXT_BLOCK_SELECTOR,
  getPageGroupSelector,
} from "./editor-selectors.js";
import { EditorHistory } from "./editor-history.js";
import { deserializeEditor, serializeEditor } from "./editor-serializer.js";
import { findSelectionTargets, isComposedDescendant } from "./editor-selection.js";

const PRESERVE_SELECTION_CONTROLS = new Set([
  "format-bold",
  "format-italic",
  "format-underline",
  "format-ordered-list",
  "format-unordered-list",
  "format-align-left",
  "format-align-center",
  "format-align-right",
  "format-align-justify",
  "format-highlight",
]);

export class EditorController {
  constructor(editor) {
    this.editor = editor;
    this.activeBlock = null;
    this.activeGroup = null;
    this.activeBlockGroup = null;
    this.copiedGroupStyles = null;
    this.history = new EditorHistory({
      capture: () => serializeEditor(this.editor),
      restore: (snapshot) => this.#restoreSnapshot(snapshot),
      onChange: (state) => {
        this.editor.dispatchEvent(new CustomEvent("history-state-change", { detail: state }));
      },
    });
  }

  connect() {
    this.editor.addEventListener("selection-format-change", this.#selectionFormatChange);
    this.editor.addEventListener("format-command", this.#formatCommand);
    this.editor.addEventListener("element-type-change", this.#elementTypeChange);
    this.editor.addEventListener("group-format-command", this.#groupFormatCommand);
    this.editor.addEventListener("group-style-change", this.#groupStyleChange);
    this.editor.addEventListener("block-group-command", this.#blockGroupCommand);
    this.editor.addEventListener("block-group-change", this.#blockGroupChange);
    this.editor.addEventListener("restore-selection", this.#restoreSelection);
    this.editor.addEventListener("editor-change", this.#editorChange);
    this.editor.addEventListener("image-change", this.#editorChange);
    this.editor.addEventListener("button-icon-change", this.#editorChange);
    this.editor.addEventListener("icon-change", this.#editorChange);
    this.editor.addEventListener("input", this.#input);
    this.editor.addEventListener("keydown", this.#keydown);
    this.editor.addEventListener("mousedown", this.#mousedown);
    this.editor.addEventListener("focusin", this.#focusin);
  }

  disconnect() {
    this.editor.removeEventListener("selection-format-change", this.#selectionFormatChange);
    this.editor.removeEventListener("format-command", this.#formatCommand);
    this.editor.removeEventListener("element-type-change", this.#elementTypeChange);
    this.editor.removeEventListener("group-format-command", this.#groupFormatCommand);
    this.editor.removeEventListener("group-style-change", this.#groupStyleChange);
    this.editor.removeEventListener("block-group-command", this.#blockGroupCommand);
    this.editor.removeEventListener("block-group-change", this.#blockGroupChange);
    this.editor.removeEventListener("restore-selection", this.#restoreSelection);
    this.editor.removeEventListener("editor-change", this.#editorChange);
    this.editor.removeEventListener("image-change", this.#editorChange);
    this.editor.removeEventListener("button-icon-change", this.#editorChange);
    this.editor.removeEventListener("icon-change", this.#editorChange);
    this.editor.removeEventListener("input", this.#input);
    this.editor.removeEventListener("keydown", this.#keydown);
    this.editor.removeEventListener("mousedown", this.#mousedown);
    this.editor.removeEventListener("focusin", this.#focusin);
  }

  init(pageData = {}) {
    deserializeEditor(this.editor, pageData);
    requestAnimationFrame(() => this.history.reset());
    return this.editor;
  }

  toJSON() {
    return serializeEditor(this.editor);
  }

  undo() {
    return this.history.undo();
  }

  redo() {
    return this.history.redo();
  }

  get canUndo() {
    return this.history.canUndo;
  }

  get canRedo() {
    return this.history.canRedo;
  }

  async showToast(message, duration = 2000) {
    await this.editor.updateComplete;
    return this.editor.renderRoot.querySelector("editor-toast")?.showToast(message, duration);
  }

  #selectionFormatChange = (event) => {
    const { group, blockGroup, textBlock: block } = findSelectionTargets(event);
    if (!block) return;

    if (group) this.#setActiveGroup(group, blockGroup, block);
    this.#setActiveBlock(block);
    this.#notifyToolbar(event.detail);
  };

  #formatCommand = (event) => {
    applyFormatCommand(this.activeBlock, event.detail, (format) => this.#notifyToolbar(format));
    this.history.capture();
  };

  #elementTypeChange = (event) => {
    this.activeBlock?.setType?.(event.detail.type);
    this.history.capture();
  };

  #groupFormatCommand = (event) => {
    if (!this.activeGroup) return;

    if (event.detail.command === "groupLink") {
      if (!this.activeGroup.setGroupLink?.(event.detail.value)) return;
    } else if (event.detail.command === "groupLinkTarget") {
      if (!this.activeGroup.setGroupLinkTarget?.(event.detail.value)) return;
    } else if (event.detail.command === "groupDisabled") {
      const disabled = !this.activeGroup.getGroupFormat?.().disabled;
      if (!this.activeGroup.setGroupDisabled?.(disabled)) return;
    } else {
      return;
    }

    this.#notifyGroupToolbar(
      this.activeGroup.getGroupFormat(),
      this.activeBlockGroup,
      this.activeBlock,
    );
    this.history.capture();
  };

  #groupStyleChange = (event) => {
    if (!this.activeGroup?.setGroupStyle?.(event.detail.property, event.detail.value)) return;
    this.#notifyGroupToolbar(
      this.activeGroup.getGroupFormat(),
      this.activeBlockGroup,
      this.activeBlock,
    );
    this.history.capture();
  };

  #blockGroupCommand = (event) => {
    if (!this.activeBlockGroup) return;
    if (event.detail.action === "copy-styles") {
      const selectionTarget = this.activeBlock ?? this.activeGroup;
      const item = this.activeBlockGroup.getItemForBlock?.(selectionTarget);
      const styles = this.activeBlockGroup.copyItemStyles?.(selectionTarget);
      if (!item || !styles) return;

      this.copiedGroupStyles = {
        list: this.activeBlockGroup,
        item,
        styles,
      };
      void this.showToast("Styles copied");
      this.#notifyGroupToolbar(
        this.activeGroup?.getGroupFormat(),
        this.activeBlockGroup,
        this.activeBlock,
      );
      return;
    }
    if (event.detail.action === "paste-styles") {
      void this.#pasteGroupStyles();
      return;
    }
    if (event.detail.action === "sort") {
      if (!this.activeBlockGroup.reorderBlocks?.(event.detail.ids, this.activeBlock)) return;
      this.#notifyGroupToolbar(
        this.activeGroup?.getGroupFormat(),
        this.activeBlockGroup,
        this.activeBlock,
      );
      this.history.capture();
      return;
    }

    const adding = event.detail.action === "add";
    const selectionTarget = this.activeBlock ?? this.activeGroup;
    const nextBlock = adding
      ? this.activeBlockGroup.addBlock(selectionTarget)
      : this.activeBlockGroup.deleteBlock(selectionTarget);

    if (!nextBlock && adding) return;
    this.#setActiveBlockGroupItem(nextBlock);
    this.#notifyToolbar(nextBlock?.getSelectionFormat?.() ?? null);
    this.#notifyGroupToolbar(this.activeGroup?.getGroupFormat(), this.activeBlockGroup, nextBlock);
    this.history.capture();
    requestAnimationFrame(() => {
      if (isPageGroup(nextBlock)) {
        void nextBlock.focusFirstBlock?.();
        return;
      }

      nextBlock?.renderRoot.querySelector(".text")?.focus({ preventScroll: true });
    });
  };

  #blockGroupChange = (event) => {
    this.activeBlockGroup = event.detail.group;
    if (event.detail.activeBlock) this.#setActiveBlockGroupItem(event.detail.activeBlock);
    this.#notifyGroupToolbar(
      this.activeGroup?.getGroupFormat(),
      this.activeBlockGroup,
      this.activeBlock,
    );
    this.history.capture();
  };

  #restoreSelection = () => {
    requestAnimationFrame(() => this.activeBlock?.restoreSelection?.());
  };

  #editorChange = () => {
    this.history.captureSoon();
  };

  #input = (event) => {
    const { group, blockGroup, contentBlock } = findSelectionTargets(event);
    if (!contentBlock) return;

    this.history.captureSoon(500);
    if (group && blockGroup) {
      this.#notifyGroupToolbar(group.getGroupFormat(), blockGroup, contentBlock);
    }
  };

  #keydown = (event) => {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return;

    const restored = event.shiftKey ? this.redo() : this.undo();
    if (!restored) return;

    event.preventDefault();
  };

  #mousedown = (event) => {
    const { group, blockGroup, contentBlock: block } = findSelectionTargets(event);
    if (group) this.#setActiveGroup(group, blockGroup, block);
    if (block) {
      this.#setActiveBlock(block);
      if (block.matches(FORMATTABLE_MEDIA_SELECTOR)) {
        this.#notifyToolbar(block.getSelectionFormat());
      }
    }

    if (!event.composedPath().some((element) => element.localName === "format-toolbar")) return;

    this.activeBlock?.captureSelection?.({ preserve: true });
    if (
      event.composedPath().some((element) => PRESERVE_SELECTION_CONTROLS.has(element.localName))
    ) {
      event.preventDefault();
    }
  };

  #focusin = (event) => {
    const { group, blockGroup, contentBlock: block } = findSelectionTargets(event);
    if (group) this.#setActiveGroup(group, blockGroup, block);
    if (!block) return;

    this.#setActiveBlock(block);
    if (block.matches(FORMATTABLE_MEDIA_SELECTOR)) {
      this.#notifyToolbar(block.getSelectionFormat());
    }
  };

  #notifyToolbar(format) {
    this.editor.renderRoot.querySelector("format-toolbar")?.dispatchEvent(
      new CustomEvent("selection-format-change", {
        detail: format,
      }),
    );
  }

  #setActiveBlock(block) {
    if (block === this.activeBlock) return;

    this.activeBlock?.clearSelection?.();
    if (block?.matches(NON_TEXT_BLOCK_SELECTOR)) {
      document.getSelection()?.removeAllRanges();
    }
    this.activeBlock?.removeAttribute("active");
    this.activeBlock = block;
    this.activeBlock?.setAttribute("active", "");
  }

  #setActiveBlockGroupItem(item) {
    if (isPageGroup(item)) {
      this.#setActiveGroup(item, this.activeBlockGroup);
      return;
    }

    this.#setActiveBlock(item);
  }

  #setActiveGroup(group, blockGroup = null, block = null) {
    if (group === this.activeGroup) {
      this.activeBlockGroup = blockGroup;
      this.#notifyGroupToolbar(group.getGroupFormat(), blockGroup, block);
      return;
    }

    if (this.activeBlock && !isComposedDescendant(group, this.activeBlock)) {
      this.#clearActiveBlockFocus();
    }

    this.activeGroup?.removeAttribute("active");
    this.activeGroup = group;
    this.activeBlockGroup = blockGroup;
    this.activeGroup?.setAttribute("active", "");
    this.#notifyGroupToolbar(group.getGroupFormat(), blockGroup, block);
  }

  #clearActiveBlockFocus() {
    const block = this.activeBlock;
    if (!block) return;

    block.clearSelection?.();
    blurComposedDescendant(block);
    clearComposedSelection(block);
    block.removeAttribute("active");
    this.activeBlock = null;
    this.#notifyToolbar(null);
  }

  #notifyGroupToolbar(format, blockGroup = null, block = null) {
    const selectionTarget = block ?? this.activeGroup;
    const blockGroupFormat = blockGroup?.getFormat?.(selectionTarget) ?? null;
    const activeItem = blockGroup?.getItemForBlock?.(selectionTarget);
    if (blockGroupFormat && activeItem) {
      blockGroupFormat.styleAction =
        this.copiedGroupStyles?.list === blockGroup && this.copiedGroupStyles.item !== activeItem
          ? "paste"
          : "copy";
    }

    this.editor.renderRoot.querySelector("group-format-toolbar")?.dispatchEvent(
      new CustomEvent("group-format-change", {
        detail: format ? { ...format, blockGroup: blockGroupFormat } : null,
      }),
    );
  }

  async #pasteGroupStyles() {
    const copied = this.copiedGroupStyles;
    const selectionTarget = this.activeBlock ?? this.activeGroup;
    const targetItem = this.activeBlockGroup?.getItemForBlock?.(selectionTarget);
    if (
      !copied ||
      copied.list !== this.activeBlockGroup ||
      !targetItem ||
      targetItem === copied.item
    ) {
      return;
    }
    if (!(await this.activeBlockGroup.pasteItemStyles?.(targetItem, copied.styles))) return;

    this.copiedGroupStyles = null;
    void this.showToast("Styles pasted");
    this.#notifyToolbar(this.activeBlock?.getSelectionFormat?.() ?? null);
    this.#notifyGroupToolbar(
      this.activeGroup?.getGroupFormat(),
      this.activeBlockGroup,
      this.activeBlock,
    );
    this.history.capture();
  }

  #restoreSnapshot(snapshot) {
    this.activeBlock?.removeAttribute("active");
    this.activeGroup?.removeAttribute("active");
    this.activeBlock = null;
    this.activeGroup = null;
    this.activeBlockGroup = null;

    deserializeEditor(this.editor, snapshot);
    this.#notifyToolbar(null);
    this.#notifyGroupToolbar(null);
  }
}

function blurComposedDescendant(block) {
  let activeElement = document.activeElement;

  while (activeElement?.shadowRoot?.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement;
  }

  if (activeElement && isComposedDescendant(block, activeElement)) activeElement.blur();
}

function clearComposedSelection(block) {
  const selection = block.renderRoot?.getSelection?.() ?? document.getSelection();
  if (
    selection &&
    (isComposedDescendant(block, selection.anchorNode) ||
      isComposedDescendant(block, selection.focusNode))
  ) {
    selection.removeAllRanges();
  }
}

function isPageGroup(element) {
  const selector = getPageGroupSelector();
  return Boolean(selector && element?.matches?.(selector));
}
