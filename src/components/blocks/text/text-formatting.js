import {
  getSelectedAncestor,
  needsParagraphWrapping,
  rangesMatch,
  selectRange,
  unwrapListsFromParagraphs,
  wrapParagraphContent,
} from "./text-utils.js";

const INLINE_COMMAND_SELECTORS = new Map([
  ["bold", ".text-bold"],
  ["italic", ".text-italic"],
  ["underline", ".text-underline"],
]);
const INLINE_COMMAND_CLASSES = new Map([
  ["bold", "text-bold"],
  ["italic", "text-italic"],
  ["underline", "text-underline"],
]);
const TEXT_COLOR_CLASS = "text-color";
const TEXT_MARK_CLASS = "text-mark";
const INLINE_FORMAT_SELECTOR = [
  ".text-bold",
  ".text-italic",
  ".text-underline",
  `.${TEXT_COLOR_CLASS}`,
  `.${TEXT_MARK_CLASS}`,
  "[style*='font-size']",
].join(", ");
const LIST_COMMANDS = new Set(["insertOrderedList", "insertUnorderedList"]);
const LIST_COMMAND_TAGS = new Map([
  ["insertOrderedList", "ol"],
  ["insertUnorderedList", "ul"],
]);
const BLOCK_CONTENT_SELECTOR = "p, ul, ol";

export function applySelectionCommand({
  command,
  value,
  editor,
  type,
  paragraphMode = type === "p",
  range,
  selection,
  onFontSizeChange,
}) {
  selectRange(selection, range);

  if (INLINE_COMMAND_SELECTORS.has(command)) {
    toggleInlineCommand(command, editor, range, selection);
  } else if (command === "linkEdit") {
    if (!prepareLinkSelection(editor, range, selection)) return { range, shouldNotify: false };
  } else if (command === "linkTarget") {
    applyLinkTarget(value, editor, range, selection);
  } else if (command === "fontSize") {
    if (paragraphMode) {
      applyFontSize(value, editor, range, selection);
    } else {
      applyBlockFontSize(value, editor, onFontSizeChange);
    }
  } else if (command === "foreColor") {
    applyTextColor(value, editor, range, selection);
  } else if (command === "backgroundColor") {
    applyHighlightBackgroundColor(value, editor, range, selection);
  } else if (command === "markStyle") {
    applyMarkStyle(value, editor, range, selection);
  } else if (command === "highlight") {
    applyHighlight(editor, range, selection);
  } else if (command === "link") {
    applyWrappedSelection(command, value, editor, range, selection);
  } else {
    executeDocumentCommand(command, editor, paragraphMode, selection);
  }

  cleanupTextFormatting(editor, selection);
  if (paragraphMode && needsParagraphWrapping(editor)) {
    mutatePreservingSelection(editor, selection, () => {
      wrapParagraphContent(editor);
    });
    cleanupTextFormatting(editor, selection);
  }
  if (paragraphMode) cleanupEmptyParagraphs(editor);

  return {
    range: getCommandResultRange(range, selection),
    shouldNotify: true,
  };
}

function getCommandResultRange(range, selection) {
  if (!selection?.rangeCount) return range?.cloneRange() ?? null;

  const selectedRange = selection.getRangeAt(0);
  if (range && !range.collapsed && selectedRange.collapsed) return range.cloneRange();
  return selectedRange.cloneRange();
}

export function describeSelectionFormat({
  editor,
  type,
  paragraphMode = type === "p",
  textAlign,
  range,
  selection,
}) {
  const align = editor?.style.textAlign || textAlign || "left";
  if (!range || !selection) return { align, type };

  const currentRange = selection.rangeCount ? selection.getRangeAt(0) : null;
  if (!rangesMatch(currentRange, range)) selectRange(selection, range);

  const findSelectedAncestor = (selector) => getSelectedAncestor(editor, range, selector);
  const fontSizeElement = paragraphMode ? findSelectedAncestor("[style*='font-size']") : editor;
  const highlightElement = findSelectedAncestor(`.${TEXT_MARK_CLASS}`);
  const highlightStyles = highlightElement ? getComputedStyle(highlightElement) : null;

  return {
    bold: Boolean(findSelectedAncestor(INLINE_COMMAND_SELECTORS.get("bold"))),
    italic: Boolean(findSelectedAncestor(INLINE_COMMAND_SELECTORS.get("italic"))),
    underline: Boolean(findSelectedAncestor(INLINE_COMMAND_SELECTORS.get("underline"))),
    orderedList: Boolean(findSelectedAncestor("ol")),
    unorderedList: Boolean(findSelectedAncestor("ul")),
    align,
    fontSize: fontSizeElement?.style.fontSize ?? "",
    fontSizeApplied: Boolean(fontSizeElement),
    fontFamily: editor?.style.fontFamily ?? "",
    type,
    collapsed: range.collapsed,
    highlight: Boolean(highlightElement),
    markClass: getMarkStyleClass(highlightElement),
    backgroundColor:
      highlightElement?.style.getPropertyValue("--mark-highlight-color").trim() ||
      highlightStyles?.getPropertyValue("--mark-highlight-color").trim() ||
      highlightStyles?.getPropertyValue("--yellow-200").trim() ||
      "",
    link: findSelectedAncestor("a")?.getAttribute("href") ?? "",
    target: findSelectedAncestor("a")?.getAttribute("target") ?? "_self",
    color: getTextColorValue(findSelectedAncestor(`.${TEXT_COLOR_CLASS}`)),
    colorApplied: Boolean(findSelectedAncestor(`.${TEXT_COLOR_CLASS}`)),
  };
}

function applyMarkStyle(value, editor, range, selection) {
  const mark = getSelectedAncestor(editor, range, `.${TEXT_MARK_CLASS}`);
  if (!mark) return;

  const className = normalizeMarkClass(value);
  removeMarkStyleClasses(mark);
  if (className) mark.classList.add(className);

  range.selectNodeContents(mark);
  selectRange(selection, range);
}

function getMarkStyleClass(element) {
  return (
    Array.from(element?.classList ?? []).find((className) => className.startsWith("mark-")) ?? ""
  );
}

export function normalizeMarkClass(value) {
  const className = String(value ?? "").trim();
  return /^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/.test(className) ? className : "";
}

function applyHighlightBackgroundColor(value, editor, range, selection) {
  const highlightElement = getSelectedAncestor(editor, range, `.${TEXT_MARK_CLASS}`);
  if (!highlightElement) return;

  highlightElement.style.setProperty("--mark-highlight-color", value);
  range.selectNodeContents(highlightElement);
  selectRange(selection, range);
}

function applyHighlight(editor, range, selection) {
  const markElement = getSelectedAncestor(editor, range, `.${TEXT_MARK_CLASS}`);

  if (range.collapsed) {
    if (markElement) removeMarkAtCaret(markElement, range);
    selectRange(selection, range);
    return;
  }

  const selectionWithinMark = markElement?.contains(range.endContainer);
  const inlineElement = markElement || getSelectedAncestor(editor, range, INLINE_FORMAT_SELECTOR);
  const selectionWithinInlineElement = inlineElement?.contains(range.endContainer);
  const fragment = range.extractContents();
  removeTextMark(fragment);

  if (selectionWithinMark) {
    insertWithoutTextMark(markElement, fragment, range);
  } else if (selectionWithinInlineElement) {
    insertWithTextMark(inlineElement, fragment, range, editor);
  } else {
    wrapFragmentWithTextMark(fragment, range, editor);
  }

  selectRange(selection, range);
}

function applyBlockFontSize(value, editor, onFontSizeChange) {
  editor.style.fontSize = value;
  onFontSizeChange(value);
}

function applyFontSize(value, editor, range, selection) {
  if (range.collapsed) return;

  const fontSizeElement = getOutermostSelectedAncestor(editor, range, "[style*='font-size']");
  const selectionWithinFontSize = fontSizeElement?.contains(range.endContainer);
  const fragment = range.extractContents();
  removeFontSize(fragment);

  if (selectionWithinFontSize) {
    insertWithFontSize(fontSizeElement, fragment, range, value);
  } else if (value) {
    if (hasBlockContent(fragment)) {
      applyFontSizeToTextNodes(fragment, value);
      insertAndSelectFragment(fragment, range);
    } else {
      const element = document.createElement("span");
      element.style.fontSize = value;
      element.append(fragment);
      range.insertNode(element);
      range.selectNodeContents(element);
    }
  } else {
    insertAndSelectFragment(fragment, range);
  }

  selectRange(selection, range);
}

function getOutermostSelectedAncestor(editor, range, selector) {
  let selectedElement = getSelectedAncestor(editor, range, selector);
  let ancestor = selectedElement?.parentElement;

  while (ancestor && ancestor !== editor) {
    if (ancestor.matches(selector) && ancestor.contains(range.endContainer)) {
      selectedElement = ancestor;
    }
    ancestor = ancestor.parentElement;
  }

  return selectedElement;
}

function applyTextColor(value, editor, range, selection) {
  const colorElement = getSelectedAncestor(editor, range, `.${TEXT_COLOR_CLASS}`);

  if (value) {
    if (range.collapsed && colorElement) {
      setTextColor(colorElement, value);
    } else if (!range.collapsed) {
      const selectionWithinColor = colorElement?.contains(range.endContainer);
      const inlineElement =
        colorElement || getSelectedAncestor(editor, range, INLINE_FORMAT_SELECTOR);
      const selectionWithinInlineElement = inlineElement?.contains(range.endContainer);
      const fragment = range.extractContents();
      removeTextColor(fragment);

      if (selectionWithinColor) {
        insertWithTextColor(inlineElement, fragment, range, value);
      } else if (selectionWithinInlineElement) {
        insertWithTextColor(inlineElement, fragment, range, value);
      } else {
        wrapFragmentWithTextColor(fragment, range, value);
      }
    }
    selectRange(selection, range);
    return;
  }

  if (range.collapsed) {
    if (colorElement) removeTextColorAtCaret(colorElement, range);
    selectRange(selection, range);
    return;
  }

  const selectionWithinColor = colorElement?.contains(range.endContainer);
  const fragment = range.extractContents();
  removeTextColor(fragment);

  if (selectionWithinColor) {
    insertWithoutTextColor(colorElement, fragment, range);
  } else {
    insertAndSelectFragment(fragment, range);
  }

  selectRange(selection, range);
}

function getTextColorValue(colorElement) {
  if (!colorElement) return "";
  return colorElement.style?.color || getComputedStyle(colorElement).color;
}

function removeFontSize(fragment) {
  for (const element of fragment.querySelectorAll("[style*='font-size']")) {
    element.style.removeProperty("font-size");
    if (!element.getAttribute("style")) element.removeAttribute("style");
  }
}

function hasBlockContent(fragment) {
  return Array.from(fragment.childNodes).some(
    (node) =>
      node.nodeType === Node.ELEMENT_NODE &&
      (node.matches(BLOCK_CONTENT_SELECTOR) || node.querySelector(BLOCK_CONTENT_SELECTOR)),
  );
}

function applyFontSizeToTextNodes(fragment, value) {
  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node;

  while ((node = walker.nextNode())) {
    if (node.textContent) textNodes.push(node);
  }

  for (const textNode of textNodes) {
    const element = document.createElement("span");
    element.style.fontSize = value;
    textNode.after(element);
    element.append(textNode);
  }
}

function removeTextColor(fragment) {
  for (const element of fragment.querySelectorAll(`.${TEXT_COLOR_CLASS}`)) {
    removeTextColorElement(element);
  }
}

function wrapFragmentWithTextColor(fragment, range, value) {
  const element = document.createElement("span");
  setTextColor(element, value);
  element.append(fragment);
  range.insertNode(element);
  range.selectNodeContents(element);
}

function insertWithTextColor(colorElement, fragment, range, value) {
  const afterRange = document.createRange();
  afterRange.setStart(range.startContainer, range.startOffset);
  afterRange.setEnd(colorElement, colorElement.childNodes.length);

  const afterElement = colorElement.cloneNode(false);
  afterElement.append(afterRange.extractContents());

  const selectedElement = colorElement.cloneNode(false);
  setTextColor(selectedElement, value);
  inheritSelectedInlineFormat(selectedElement, range, {
    stopElement: colorElement,
    excludedClasses: [TEXT_COLOR_CLASS],
    excludedStyles: ["color"],
  });
  selectedElement.append(fragment);

  const selectedFragment = document.createDocumentFragment();
  selectedFragment.append(selectedElement);
  const markers = addSelectionMarkers(selectedFragment);
  colorElement.after(selectedFragment, afterElement);

  removeEmptyInlineElement(colorElement);
  removeEmptyInlineElement(afterElement);
  selectBetweenMarkers(range, markers);
}

function setTextColor(element, value) {
  element.classList.add(TEXT_COLOR_CLASS);
  element.style.color = value;
}

function inheritSelectedInlineFormat(
  element,
  range,
  { stopElement = null, excludedClasses = [], excludedStyles = [] } = {},
) {
  let ancestor =
    range.startContainer.nodeType === Node.ELEMENT_NODE
      ? range.startContainer
      : range.startContainer.parentElement;
  const excludedClassSet = new Set(excludedClasses);
  const excludedStyleSet = new Set(excludedStyles);

  while (ancestor && ancestor !== stopElement) {
    if (ancestor.nodeType === Node.ELEMENT_NODE && ancestor.localName === "span") {
      inheritInlineFormat(element, ancestor, { excludedClassSet, excludedStyleSet });
    }
    ancestor = ancestor.parentElement;
  }
}

function inheritInlineFormat(element, source, { excludedClassSet, excludedStyleSet }) {
  for (const className of source.classList) {
    if (!excludedClassSet.has(className)) element.classList.add(className);
  }

  for (const property of Array.from(source.style)) {
    if (excludedStyleSet.has(property) || element.style.getPropertyValue(property)) continue;
    element.style.setProperty(
      property,
      source.style.getPropertyValue(property),
      source.style.getPropertyPriority(property),
    );
  }
}

function removeTextMark(fragment) {
  for (const element of fragment.querySelectorAll(`.${TEXT_MARK_CLASS}`)) {
    removeTextMarkElement(element);
  }
}

function wrapFragmentWithTextMark(fragment, range, editor) {
  const element = document.createElement("span");
  setTextMark(element, editor);
  element.append(fragment);
  range.insertNode(element);
  range.selectNodeContents(element);
}

function insertWithTextMark(inlineElement, fragment, range, editor) {
  const afterRange = document.createRange();
  afterRange.setStart(range.startContainer, range.startOffset);
  afterRange.setEnd(inlineElement, inlineElement.childNodes.length);

  const afterElement = inlineElement.cloneNode(false);
  afterElement.append(afterRange.extractContents());

  const selectedElement = inlineElement.cloneNode(false);
  setTextMark(selectedElement, editor);
  selectedElement.append(fragment);

  const selectedFragment = document.createDocumentFragment();
  selectedFragment.append(selectedElement);
  const markers = addSelectionMarkers(selectedFragment);
  inlineElement.after(selectedFragment, afterElement);

  removeEmptyInlineElement(inlineElement);
  removeEmptyInlineElement(afterElement);
  selectBetweenMarkers(range, markers);
}

function insertWithoutTextMark(markElement, fragment, range) {
  const afterRange = document.createRange();
  afterRange.setStart(range.startContainer, range.startOffset);
  afterRange.setEnd(markElement, markElement.childNodes.length);

  const afterElement = markElement.cloneNode(false);
  afterElement.append(afterRange.extractContents());

  const selectedElement = markElement.cloneNode(false);
  removeTextMarkElement(selectedElement);
  inheritSelectedInlineFormat(selectedElement, range, {
    excludedClasses: [TEXT_MARK_CLASS, ...getMarkStyleClasses(markElement)],
    excludedStyles: ["--mark-highlight-color"],
  });
  selectedElement.append(fragment);

  const selectedFragment = document.createDocumentFragment();
  if (shouldKeepTextSpan(selectedElement)) {
    selectedFragment.append(selectedElement);
  } else {
    selectedFragment.append(...selectedElement.childNodes);
  }

  const markers = addSelectionMarkers(selectedFragment);
  markElement.after(selectedFragment, afterElement);

  removeEmptyInlineElement(markElement);
  removeEmptyInlineElement(afterElement);
  selectBetweenMarkers(range, markers);
}

function removeMarkAtCaret(markElement, range) {
  const marker = document.createComment("caret");
  range.insertNode(marker);
  removeTextMarkElement(markElement);
  cleanupTextSpanElement(markElement);
  range.setStartAfter(marker);
  range.collapse(true);
  marker.remove();
}

function setTextMark(element, editor) {
  element.classList.add(TEXT_MARK_CLASS);
  const color = getComputedStyle(editor).getPropertyValue("--ui-editor-mark").trim();
  element.style.setProperty(
    "--mark-highlight-color",
    color ? "var(--ui-editor-mark)" : "rgb(255, 247, 220)",
  );
}

function removeTextMarkElement(element) {
  element.classList.remove(TEXT_MARK_CLASS);
  removeMarkStyleClasses(element);
  element.style?.removeProperty("--mark-highlight-color");
  cleanupTextSpanElement(element);
}

function removeMarkStyleClasses(element) {
  for (const className of Array.from(element.classList)) {
    if (className.startsWith("mark-")) element.classList.remove(className);
  }
}

function getMarkStyleClasses(element) {
  return Array.from(element.classList).filter((className) => className.startsWith("mark-"));
}

function insertWithFontSize(fontSizeElement, fragment, range, value) {
  const afterRange = document.createRange();
  afterRange.setStart(range.startContainer, range.startOffset);
  afterRange.setEnd(fontSizeElement, fontSizeElement.childNodes.length);

  const afterElement = fontSizeElement.cloneNode(false);
  afterElement.append(afterRange.extractContents());

  const selectedElement = fontSizeElement.cloneNode(false);
  if (value) selectedElement.style.fontSize = value;
  else selectedElement.style.removeProperty("font-size");
  if (!selectedElement.getAttribute("style")) selectedElement.removeAttribute("style");
  selectedElement.append(fragment);

  const selectedFragment = document.createDocumentFragment();
  if (selectedElement.attributes.length || selectedElement.tagName !== "SPAN") {
    selectedFragment.append(selectedElement);
  } else {
    selectedFragment.append(...selectedElement.childNodes);
  }

  const markers = addSelectionMarkers(selectedFragment);
  fontSizeElement.after(selectedFragment, afterElement);

  removeEmptyInlineElement(fontSizeElement);
  removeEmptyInlineElement(afterElement);
  selectBetweenMarkers(range, markers);
}

export function removeEmptyInlineElement(element) {
  const hasText = element.textContent.length > 0;
  const hasRenderedElement = element.querySelector(
    "audio, br, canvas, embed, hr, iframe, img, input, object, select, svg, textarea, video",
  );

  if (!hasText && !hasRenderedElement) element.remove();
}

function applyLinkTarget(value, editor, range, selection) {
  const link = getSelectedAncestor(editor, range, "a");
  if (!link) return;

  if (value && value !== "_self") link.setAttribute("target", value);
  else link.removeAttribute("target");
  range.selectNodeContents(link);
  selectRange(selection, range);
}

function insertWithoutTextColor(colorElement, fragment, range) {
  const afterRange = document.createRange();
  afterRange.setStart(range.startContainer, range.startOffset);
  afterRange.setEnd(colorElement, colorElement.childNodes.length);

  const afterElement = colorElement.cloneNode(false);
  afterElement.append(afterRange.extractContents());

  const selectedElement = colorElement.cloneNode(false);
  removeTextColorElement(selectedElement);
  inheritSelectedInlineFormat(selectedElement, range, {
    excludedClasses: [TEXT_COLOR_CLASS],
    excludedStyles: ["color"],
  });
  selectedElement.append(fragment);

  const selectedFragment = document.createDocumentFragment();
  if (shouldKeepTextSpan(selectedElement)) {
    selectedFragment.append(selectedElement);
  } else {
    selectedFragment.append(...selectedElement.childNodes);
  }

  const markers = addSelectionMarkers(selectedFragment);
  colorElement.after(selectedFragment, afterElement);

  removeEmptyInlineElement(colorElement);
  removeEmptyInlineElement(afterElement);
  selectBetweenMarkers(range, markers);
}

function removeTextColorAtCaret(colorElement, range) {
  const marker = document.createComment("caret");
  range.insertNode(marker);
  removeTextColorElement(colorElement);
  cleanupTextSpanElement(colorElement);
  range.setStartAfter(marker);
  range.collapse(true);
  marker.remove();
}

function removeTextColorElement(element) {
  element.classList.remove(TEXT_COLOR_CLASS);
  element.style?.removeProperty("color");
  cleanupTextSpanElement(element);
}

function insertAndSelectFragment(fragment, range) {
  const markers = addSelectionMarkers(fragment);
  range.insertNode(fragment);
  selectBetweenMarkers(range, markers);
}

function addSelectionMarkers(fragment) {
  const startMarker = document.createComment("selection-start");
  const endMarker = document.createComment("selection-end");
  fragment.prepend(startMarker);
  fragment.append(endMarker);
  return { startMarker, endMarker };
}

function selectBetweenMarkers(range, { startMarker, endMarker }) {
  if (!startMarker || !endMarker) return;

  const startParent = startMarker.parentNode;
  const endParent = endMarker.parentNode;
  const startOffset = getNodeIndex(startMarker);
  const endOffset = getNodeIndex(endMarker);

  startMarker.remove();
  endMarker.remove();

  if (!startParent || !endParent) return;

  range.setStart(startParent, startOffset);
  range.setEnd(endParent, startParent === endParent ? endOffset - 1 : endOffset);
}

function getNodeIndex(node) {
  return Array.prototype.indexOf.call(node.parentNode?.childNodes ?? [], node);
}

function toggleInlineCommand(command, editor, range, selection) {
  const className = INLINE_COMMAND_CLASSES.get(command);
  if (!className) return;

  const formatElement =
    range.collapsed && getSelectedAncestor(editor, range, INLINE_COMMAND_SELECTORS.get(command));

  if (formatElement) {
    removeInlineClass(formatElement, className, range);
    selectRange(selection, range);
    return;
  }

  if (!range.collapsed) {
    toggleInlineRange(command, editor, range, className);
    selectRange(selection, range);
  }
}

function toggleInlineRange(command, editor, range, className) {
  const selector = INLINE_COMMAND_SELECTORS.get(command);
  if (!selector) return;

  const formatElement = getSelectedAncestor(editor, range, selector);
  if (formatElement?.contains(range.endContainer)) {
    insertWithoutInlineClass(formatElement, range.extractContents(), range, className);
    return;
  }

  const inlineElement = getSelectedAncestor(editor, range, INLINE_FORMAT_SELECTOR);
  if (inlineElement?.contains(range.endContainer)) {
    insertWithInlineClass(inlineElement, range.extractContents(), range, className);
    return;
  }

  const fragment = range.extractContents();
  removeInlineFormat(fragment, selector);

  const element = document.createElement("span");
  element.classList.add(className);
  element.append(fragment);
  range.insertNode(element);
  range.selectNodeContents(element);
}

function removeInlineFormat(fragment, selector) {
  for (const element of fragment.querySelectorAll(selector)) {
    removeInlineFormatElement(element);
  }
}

function insertWithInlineClass(inlineElement, fragment, range, className) {
  const afterRange = document.createRange();
  afterRange.setStart(range.startContainer, range.startOffset);
  afterRange.setEnd(inlineElement, inlineElement.childNodes.length);

  const afterElement = inlineElement.cloneNode(false);
  afterElement.append(afterRange.extractContents());

  const selectedElement = inlineElement.cloneNode(false);
  selectedElement.classList.add(className);
  removeInlineFormat(fragment, `.${className}`);
  selectedElement.append(fragment);

  const selectedFragment = document.createDocumentFragment();
  selectedFragment.append(selectedElement);
  const markers = addSelectionMarkers(selectedFragment);
  inlineElement.after(selectedFragment, afterElement);

  removeEmptyInlineElement(inlineElement);
  removeEmptyInlineElement(afterElement);
  selectBetweenMarkers(range, markers);
}

function insertWithoutInlineClass(inlineElement, fragment, range, className) {
  const afterRange = document.createRange();
  afterRange.setStart(range.startContainer, range.startOffset);
  afterRange.setEnd(inlineElement, inlineElement.childNodes.length);

  const afterElement = inlineElement.cloneNode(false);
  afterElement.append(afterRange.extractContents());

  const selectedElement = inlineElement.cloneNode(false);
  selectedElement.classList.remove(className);
  inheritSelectedInlineFormat(selectedElement, range, {
    excludedClasses: [className],
  });
  removeInlineFormat(fragment, `.${className}`);
  selectedElement.append(fragment);

  const selectedFragment = document.createDocumentFragment();
  if (hasInlineFormatClass(selectedElement) || selectedElement.getAttribute("style")) {
    selectedFragment.append(selectedElement);
  } else {
    selectedFragment.append(...selectedElement.childNodes);
  }

  const markers = addSelectionMarkers(selectedFragment);
  inlineElement.after(selectedFragment, afterElement);

  removeEmptyInlineElement(inlineElement);
  removeEmptyInlineElement(afterElement);
  selectBetweenMarkers(range, markers);
}

function removeInlineClass(formatElement, className, range) {
  const marker = document.createComment("caret");
  range.insertNode(marker);
  removeInlineFormatClass(formatElement, className);
  cleanupInlineFormatElement(formatElement);
  range.setStartBefore(marker);
  range.collapse(true);
  marker.remove();
}

function removeInlineFormatElement(element) {
  for (const className of INLINE_COMMAND_CLASSES.values()) {
    element.classList.remove(className);
  }
  cleanupInlineFormatElement(element);
}

function removeInlineFormatClass(element, className) {
  element.classList.remove(className);
}

function cleanupInlineFormatElement(element) {
  cleanupTextSpanElement(element);
}

function hasInlineFormatClass(element) {
  return Array.from(INLINE_COMMAND_CLASSES.values()).some((className) =>
    element.classList.contains(className),
  );
}

function cleanupTextSpanElement(element) {
  if (element.getAttribute("style") === "") element.removeAttribute("style");
  if (element.getAttribute("class") === "") element.removeAttribute("class");
  if (element.localName === "span" && !hasInlineElementContent(element)) {
    element.remove();
    return true;
  }
  if (element.localName === "span" && isFormatterWhitespaceOnly(element)) {
    element.remove();
    return true;
  }
  if (element.localName === "span" && element.querySelector(BLOCK_CONTENT_SELECTOR)) {
    unwrapBlockChildrenFromTextSpan(element);
    return true;
  }
  if (element.localName === "span" && !shouldKeepTextSpan(element)) {
    element.replaceWith(...element.childNodes);
    return true;
  }
  if (
    element.localName === "span" &&
    !containsSelectionMarker(element) &&
    pushSpanFormatIntoChildren(element)
  ) {
    return true;
  }
  if (
    element.localName === "span" &&
    !containsSelectionMarker(element) &&
    mergeFollowingTextSpans(element)
  ) {
    return true;
  }

  return false;
}

function containsSelectionMarker(element) {
  const iterator = document.createNodeIterator(element, NodeFilter.SHOW_COMMENT);
  let node;

  while ((node = iterator.nextNode())) {
    if (node.data === "selection-start" || node.data === "selection-end") return true;
  }

  return false;
}

function pushSpanFormatIntoChildren(element) {
  if (!isPlainTextSpan(element)) return false;

  const childSpans = [];
  for (const child of element.childNodes) {
    if (child.nodeType === Node.TEXT_NODE && child.textContent.trim() === "") continue;
    if (
      child.nodeType === Node.ELEMENT_NODE &&
      child.localName === "span" &&
      isPlainTextSpan(child)
    ) {
      childSpans.push(child);
      continue;
    }
    return false;
  }
  if (!childSpans.length) return false;
  if (!childSpans.every((child) => canInheritSpanFormat(child, element))) return false;

  for (const child of childSpans) inheritSpanFormat(child, element);
  element.replaceWith(...element.childNodes);
  return true;
}

function mergeFollowingTextSpans(element) {
  if (!isPlainTextSpan(element)) return false;

  let changed = false;
  let next = element.nextSibling;

  while (next) {
    if (next.nodeType === Node.TEXT_NODE && next.textContent.trim() === "") {
      const spacer = next;
      const following = spacer.nextSibling;
      if (!canMergeTextSpans(element, following)) break;

      element.append(spacer);
      element.append(...following.childNodes);
      following.remove();
      changed = true;
      next = element.nextSibling;
      continue;
    }

    if (!canMergeTextSpans(element, next)) break;

    element.append(...next.childNodes);
    next.remove();
    changed = true;
    next = element.nextSibling;
  }

  return changed;
}

function canMergeTextSpans(first, second) {
  return (
    second?.nodeType === Node.ELEMENT_NODE &&
    second.localName === "span" &&
    isPlainTextSpan(second) &&
    getTextSpanSignature(first) === getTextSpanSignature(second)
  );
}

function isPlainTextSpan(element) {
  return Array.from(element.attributes).every(
    (attribute) => attribute.name === "class" || attribute.name === "style",
  );
}

function canInheritSpanFormat(child, parent) {
  const childMarkClass = getMarkStyleClass(child);
  const parentMarkClass = getMarkStyleClass(parent);
  if (childMarkClass && parentMarkClass && childMarkClass !== parentMarkClass) return false;

  for (const property of Array.from(parent.style)) {
    const parentValue = parent.style.getPropertyValue(property);
    const childValue = child.style.getPropertyValue(property);
    if (childValue && childValue !== parentValue) return false;
  }

  return true;
}

function inheritSpanFormat(child, parent) {
  for (const className of parent.classList) {
    child.classList.add(className);
  }

  for (const property of Array.from(parent.style)) {
    if (child.style.getPropertyValue(property)) continue;
    child.style.setProperty(
      property,
      parent.style.getPropertyValue(property),
      parent.style.getPropertyPriority(property),
    );
  }
}

function getTextSpanSignature(element) {
  const classes = Array.from(element.classList).sort().join(".");
  const styles = Array.from(element.style)
    .sort()
    .map((property) => {
      const priority = element.style.getPropertyPriority(property);
      return `${property}:${element.style.getPropertyValue(property)}:${priority}`;
    })
    .join(";");

  return `${classes}|${styles}`;
}

function hasInlineElementContent(element) {
  const hasText = element.textContent.length > 0;
  const hasRenderedElement = element.querySelector(
    "audio, br, canvas, embed, hr, iframe, img, input, object, select, svg, textarea, video",
  );

  return hasText || hasRenderedElement;
}

function isFormatterWhitespaceOnly(element) {
  if (!shouldKeepTextSpan(element)) return false;
  if (!/^\s+$/.test(element.textContent)) return false;
  if (!/[\r\n\t]/.test(element.textContent)) return false;

  return !element.querySelector(
    "audio, br, canvas, embed, hr, iframe, img, input, object, select, svg, textarea, video",
  );
}

function cleanupTextFormatting(editor, selection) {
  const cleanup = () => {
    let changed = true;
    while (changed) {
      changed = false;
      for (const element of Array.from(editor.querySelectorAll("span")).reverse()) {
        changed = cleanupTextSpanElement(element) || changed;
      }
    }
  };
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null;

  if (range?.collapsed) {
    cleanup();
  } else {
    mutatePreservingSelection(editor, selection, cleanup);
  }
}

function unwrapBlockChildrenFromTextSpan(element) {
  const blockElements = Array.from(element.querySelectorAll("p, li"));

  for (const blockElement of blockElements) {
    if (isEmptyBlockElement(blockElement)) continue;

    const wrapper = element.cloneNode(false);
    wrapper.append(...blockElement.childNodes);
    blockElement.append(wrapper);
  }

  element.replaceWith(...element.childNodes);
}

function isEmptyBlockElement(element) {
  const text = element.textContent.replace(/[\u00a0\u200b-\u200d\ufeff]/g, "").trim();
  const hasEmbeddedContent = element.querySelector(
    "audio, canvas, embed, hr, iframe, img, input, object, select, svg, textarea, video",
  );

  return text === "" && !hasEmbeddedContent;
}

function cleanupEmptyParagraphs(editor) {
  const paragraphs = Array.from(editor.children).filter((element) => element.tagName === "P");
  const hasContent = paragraphs.some((paragraph) => !isEmptyBlockElement(paragraph));
  if (!hasContent) return;

  for (const paragraph of paragraphs) {
    if (!isEmptyBlockElement(paragraph)) continue;
    if (hasExplicitParagraphBreak(paragraph) && isEmptyParagraphBetweenParagraphs(paragraph)) {
      continue;
    }
    paragraph.remove();
  }
}

function hasExplicitParagraphBreak(paragraph) {
  return Boolean(paragraph.querySelector("br"));
}

function isEmptyParagraphBetweenParagraphs(paragraph) {
  const previous = getPreviousNonEmptyBlockElement(paragraph);
  const next = getNextNonEmptyBlockElement(paragraph);
  return previous?.tagName === "P" && next?.tagName === "P";
}

function getPreviousNonEmptyBlockElement(element) {
  let previous = element.previousElementSibling;
  while (previous?.tagName === "P" && isEmptyBlockElement(previous)) {
    previous = previous.previousElementSibling;
  }
  return previous;
}

function getNextNonEmptyBlockElement(element) {
  let next = element.nextElementSibling;
  while (next?.tagName === "P" && isEmptyBlockElement(next)) {
    next = next.nextElementSibling;
  }
  return next;
}

function shouldKeepTextSpan(element) {
  return (
    hasTextFormatClass(element) ||
    Boolean(element.getAttribute("style")) ||
    Array.from(element.attributes).some((attribute) => attribute.name !== "class")
  );
}

function hasTextFormatClass(element) {
  return (
    hasInlineFormatClass(element) ||
    element.classList.contains(TEXT_COLOR_CLASS) ||
    element.classList.contains(TEXT_MARK_CLASS) ||
    Array.from(element.classList).some((className) => className.startsWith("mark-"))
  );
}

function prepareLinkSelection(editor, range, selection) {
  const link = getSelectedAncestor(editor, range, "a");

  if (link) {
    link.toggleAttribute("data-link-selection", true);
    range.selectNodeContents(link);
  } else if (range.collapsed) {
    return false;
  } else if (!getSelectedAncestor(editor, range, "[data-link-selection]")) {
    const preview = document.createElement("span");
    preview.toggleAttribute("data-link-selection", true);
    preview.append(range.extractContents());
    range.insertNode(preview);
    range.selectNodeContents(preview);
  }

  selectRange(selection, range);
  return true;
}

function applyWrappedSelection(command, value, editor, range, selection) {
  const selector = "a";
  const formatElement = getSelectedAncestor(editor, range, selector);
  const preview =
    command === "link" ? getSelectedAncestor(editor, range, "[data-link-selection]") : null;

  if (command === "link" && value && formatElement) {
    updateLink(formatElement, value, range);
  } else if (command === "link" && value && preview) {
    replaceLinkPreview(preview, value, range);
  } else if (formatElement) {
    unwrapFormatElement(formatElement, range);
  } else if (value) {
    wrapSelection(command, value, range);
  }

  selectRange(selection, range);
}

function updateLink(link, value, range) {
  link.setAttribute("href", value);
  link.removeAttribute("data-link-selection");
  range.selectNodeContents(link);
}

function replaceLinkPreview(preview, value, range) {
  const link = document.createElement("a");
  link.setAttribute("href", value);
  link.append(...preview.childNodes);
  preview.replaceWith(link);
  range.selectNodeContents(link);
}

function unwrapFormatElement(formatElement, range) {
  const firstChild = formatElement.firstChild;
  const lastChild = formatElement.lastChild;
  formatElement.replaceWith(...formatElement.childNodes);
  range.setStartBefore(firstChild);
  range.setEndAfter(lastChild);
}

function wrapSelection(command, value, range) {
  const element = document.createElement("a");
  if (command === "link") element.setAttribute("href", value);
  element.append(range.extractContents());
  range.insertNode(element);
  range.selectNodeContents(element);
}

function executeDocumentCommand(command, editor, paragraphMode, selection) {
  if (!LIST_COMMANDS.has(command)) return;

  toggleListCommand(command, editor, selection);
  if (!LIST_COMMANDS.has(command)) return;

  const needsListRepair = Boolean(editor.querySelector("p > ul, p > ol"));
  const needsParagraphRepair = paragraphMode && needsParagraphWrapping(editor);
  if (!needsListRepair && !needsParagraphRepair) return;

  mutatePreservingSelection(editor, selection, () => {
    unwrapListsFromParagraphs(editor);
    if (paragraphMode) wrapParagraphContent(editor);
  });
}

function toggleListCommand(command, editor, selection) {
  const tagName = LIST_COMMAND_TAGS.get(command);
  if (!tagName) return;

  const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
  const currentList = getSelectedAncestor(editor, range, "ol, ul");

  mutatePreservingSelection(editor, selection, () => {
    if (currentList?.localName === tagName) {
      unwrapList(currentList);
    } else if (currentList) {
      replaceListTag(currentList, tagName);
    } else {
      wrapSelectionInList(editor, range, tagName);
    }
  });
}

function replaceListTag(list, tagName) {
  const replacement = document.createElement(tagName);
  replacement.append(...list.childNodes);
  list.replaceWith(replacement);
}

function unwrapList(list) {
  const paragraphs = Array.from(list.children, (item) => {
    const paragraph = document.createElement("p");
    paragraph.append(...item.childNodes);
    return paragraph;
  });
  list.replaceWith(...paragraphs);
}

function wrapSelectionInList(editor, range, tagName) {
  const selectedNodes = getSelectedEditorChildren(editor, range);
  if (!selectedNodes.length) return;

  const list = document.createElement(tagName);
  selectedNodes[0].before(list);

  for (const node of selectedNodes) {
    if (node.nodeType === Node.ELEMENT_NODE && node.localName === "li") {
      list.append(node);
      continue;
    }

    if (
      node.nodeType === Node.ELEMENT_NODE &&
      (node.localName === "ol" || node.localName === "ul")
    ) {
      list.append(...node.childNodes);
      node.remove();
      continue;
    }

    const item = document.createElement("li");
    if (node.nodeType === Node.ELEMENT_NODE && node.localName === "p") {
      item.append(...node.childNodes);
      node.remove();
    } else {
      item.append(node);
    }
    list.append(item);
  }
}

function getSelectedEditorChildren(editor, range) {
  if (!range) return [];

  return Array.from(editor.childNodes).filter((node) => {
    if (node.nodeType === Node.COMMENT_NODE) return false;
    try {
      return range.intersectsNode(node);
    } catch {
      return false;
    }
  });
}

function mutatePreservingSelection(editor, selection, mutate) {
  const currentRange = selection?.rangeCount ? selection.getRangeAt(0) : null;
  if (!currentRange || !editor.contains(currentRange.commonAncestorContainer)) {
    mutate();
    return;
  }

  const collapsed = currentRange.collapsed;
  const startMarker = document.createComment("selection-start");
  const startRange = currentRange.cloneRange();

  let endMarker = null;
  if (!collapsed) {
    endMarker = document.createComment("selection-end");
    const endRange = currentRange.cloneRange();
    endRange.collapse(false);
    endRange.insertNode(endMarker);
  }

  startRange.collapse(true);
  startRange.insertNode(startMarker);
  mutate();

  if (!startMarker.isConnected || (!collapsed && !endMarker?.isConnected)) return;

  const restoredRange = document.createRange();
  restoredRange.setStartAfter(startMarker);
  if (collapsed) {
    restoredRange.collapse(true);
  } else {
    restoredRange.setEndBefore(endMarker);
  }

  startMarker.remove();
  endMarker?.remove();
  selectRange(selection, restoredRange);
}
