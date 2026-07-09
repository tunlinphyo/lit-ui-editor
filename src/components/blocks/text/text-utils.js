const TEXT_ELEMENT_TYPES = ["h1", "h2", "h3", "p"];
const PARAGRAPH_CONTENT_TAGS = ["P", "UL", "OL"];
const LIST_TAGS = ["UL", "OL"];
const ELEMENT_NODE = 1;
const LIST_CHILD_TYPES = new Map([
  ["ol", "ordered-list"],
  ["ul", "unordered-list"],
]);
const LIST_ELEMENT_TYPES = new Map([
  ["ordered-list", "ol"],
  ["unordered-list", "ul"],
]);
const EDITOR_PADDING_BREAK = "data-editor-padding-break";

export function normalizeBlockType(type) {
  return TEXT_ELEMENT_TYPES.includes(type) ? type : "p";
}

export function convertBlockTypeContent(value, previousType, nextType) {
  if (previousType === "p" && nextType !== "p") {
    return normalizeHeadingLines(paragraphsToBreaks(value));
  }
  if (previousType !== "p" && nextType === "p") {
    return breaksToParagraphs(value?.replace(/\r\n?|\n/g, "<br>"));
  }

  return normalizeBlockContent(value, nextType);
}

export function normalizeBlockContent(value, type) {
  return type === "p" ? normalizeParagraphs(value, type) : normalizeHeadingLines(value);
}

export function normalizeParagraphs(value, type) {
  if (type !== "p" || !value) return value;

  const template = document.createElement("template");
  const output = document.createElement("div");
  let paragraph = null;
  template.innerHTML = value;

  for (const node of Array.from(template.content.childNodes)) {
    if (node.nodeType === Node.ELEMENT_NODE && PARAGRAPH_CONTENT_TAGS.includes(node.tagName)) {
      paragraph = null;
      output.append(node);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "DIV") {
      paragraph = null;
      const divParagraph = document.createElement("p");
      divParagraph.append(...node.childNodes);
      output.append(divParagraph);
    } else if (node.nodeName === "BR") {
      paragraph = null;
    } else {
      paragraph ??= output.appendChild(document.createElement("p"));
      paragraph.append(node);
    }
  }

  removeEditorEmptyParagraphsAroundLists(output);
  return output.innerHTML;
}

function removeEditorEmptyParagraphsAroundLists(root) {
  for (const paragraph of Array.from(root.children)) {
    if (paragraph.tagName !== "P" || !isEmptyParagraphElement(paragraph)) continue;

    const previous = getPreviousNonEmptyElement(paragraph);
    const next = getNextNonEmptyElement(paragraph);
    if (
      !previous ||
      !next ||
      LIST_TAGS.includes(previous.tagName) ||
      LIST_TAGS.includes(next.tagName)
    ) {
      paragraph.remove();
    }
  }
}

function isEmptyParagraphElement(paragraph) {
  const text = paragraph.textContent.replace(/[\u00a0\u200b-\u200d\ufeff]/g, "").trim();
  const hasCaretMarker = paragraph.querySelector("[data-editor-caret]");
  const hasEmbeddedContent = paragraph.querySelector(
    "audio, canvas, embed, hr, iframe, img, input, object, select, svg, textarea, video",
  );

  return text === "" && !hasCaretMarker && !hasEmbeddedContent;
}

function getPreviousNonEmptyElement(element) {
  let previous = element.previousElementSibling;
  while (previous?.tagName === "P" && isEmptyParagraphElement(previous)) {
    previous = previous.previousElementSibling;
  }
  return previous;
}

function getNextNonEmptyElement(element) {
  let next = element.nextElementSibling;
  while (next?.tagName === "P" && isEmptyParagraphElement(next)) {
    next = next.nextElementSibling;
  }
  return next;
}

function normalizeHeadingLines(value) {
  if (!value) return value;

  const template = document.createElement("template");
  template.innerHTML = value.replace(/\r\n?|\n/g, "\n");

  for (const paddingBreak of template.content.querySelectorAll(`[${EDITOR_PADDING_BREAK}]`)) {
    paddingBreak.remove();
  }

  for (const lineBreak of template.content.querySelectorAll("br")) {
    lineBreak.replaceWith(document.createTextNode("\n"));
  }

  return template.innerHTML;
}

function paragraphsToBreaks(value) {
  if (!value) return value;

  const template = document.createElement("template");
  const output = document.createElement("div");
  let trailingParagraphBreak = null;
  template.innerHTML = value;

  for (const node of Array.from(template.content.childNodes)) {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "P") {
      if (node.lastChild?.nodeName === "BR") node.lastChild.remove();
      output.append(...node.childNodes);
      trailingParagraphBreak = output.appendChild(document.createElement("br"));
    } else {
      trailingParagraphBreak = null;
      output.append(node);
    }
  }

  trailingParagraphBreak?.remove();
  return output.innerHTML;
}

function breaksToParagraphs(value) {
  if (!value) return value;

  const template = document.createElement("template");
  const output = document.createElement("div");
  let paragraph = null;
  let endedWithBreak = false;
  template.innerHTML = value;

  for (const node of Array.from(template.content.childNodes)) {
    if (node.nodeType === Node.ELEMENT_NODE && PARAGRAPH_CONTENT_TAGS.includes(node.tagName)) {
      paragraph = null;
      endedWithBreak = false;
      output.append(node);
    } else if (node.nodeName === "BR") {
      paragraph ??= output.appendChild(document.createElement("p"));
      paragraph = null;
      endedWithBreak = true;
    } else {
      paragraph ??= output.appendChild(document.createElement("p"));
      paragraph.append(node);
      endedWithBreak = false;
    }
  }

  if (endedWithBreak) output.appendChild(document.createElement("p"));
  return output.innerHTML;
}

export function isEmptyHtml(html) {
  if (!html) return true;

  const template = document.createElement("template");
  template.innerHTML = html;

  const text = template.content.textContent.replace(/[\u00a0\u200b-\u200d\ufeff]/g, "").trim();
  const hasEmbeddedContent = template.content.querySelector(
    "audio, canvas, embed, hr, iframe, img, input, object, select, svg, textarea, video",
  );

  return text === "" && !hasEmbeddedContent;
}

export function serializeHtml(html, trimTrailingBreaks = true) {
  let serialized = html.replace(/\r\n?|\n/g, "<br>");
  serialized = removeEmptyParagraphsAdjacentToLists(serialized);
  if (!trimTrailingBreaks) return serialized;

  serialized = serialized.replace(/(?:<br>)+$/, "");
  serialized = serialized.replace(/(?:<br>)+(?=<\/p>\s*$)/i, "");
  return removeTrailingEmptyParagraphs(serialized);
}

export function serializeTextChildren(source, { paragraphMode = false } = {}) {
  const root = typeof source === "string" ? htmlToFragment(source) : source;
  if (paragraphMode) return serializeParagraphChildren(root);

  const children = [];

  appendTextChildren(root, {}, children);
  return mergeAdjacentTextChildren(children);
}

export function deserializeTextChildren(children, { paragraphMode = false } = {}) {
  if (!Array.isArray(children)) return "";
  if (paragraphMode) return deserializeParagraphChildren(children);

  const output = document.createElement("div");
  for (const child of children) {
    if (!child || typeof child !== "object" || typeof child.text !== "string") continue;
    output.append(createMarkedTextNodes(child.text, child.marks));
  }

  return output.innerHTML;
}

function serializeParagraphChildren(root) {
  const paragraphs = [];
  let pendingNodes = [];

  for (const child of root.childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE && child.localName === "p") {
      appendPendingParagraph(paragraphs, pendingNodes);
      paragraphs.push(...createParagraphChildren(child));
      pendingNodes = [];
    } else if (child.nodeType === Node.ELEMENT_NODE && LIST_CHILD_TYPES.has(child.localName)) {
      appendPendingParagraph(paragraphs, pendingNodes);
      paragraphs.push(createListChild(child));
      pendingNodes = [];
    } else if (child.nodeName === "BR") {
      appendPendingParagraph(paragraphs, pendingNodes);
      pendingNodes = [];
    } else {
      pendingNodes.push(child);
    }
  }

  appendPendingParagraph(paragraphs, pendingNodes);
  return removeListAdjacentEmptyParagraphs(paragraphs);
}

function appendPendingParagraph(paragraphs, nodes) {
  if (!nodes.length) return;

  const fragment = document.createDocumentFragment();
  fragment.append(...nodes.map((node) => node.cloneNode(true)));
  paragraphs.push(...createParagraphChildren(fragment));
}

function createParagraphChildren(source) {
  return splitParagraphTextChildren(serializeTextChildren(source)).map((children) => ({
    type: "paragraph",
    children,
  }));
}

function createListChild(list) {
  return {
    type: LIST_CHILD_TYPES.get(list.localName),
    children: Array.from(list.children)
      .filter((item) => item.localName === "li")
      .map((item) => ({
        type: "list-item",
        children: serializeTextChildren(item),
      })),
  };
}

function removeListAdjacentEmptyParagraphs(children) {
  return children.filter((child, index) => {
    if (!isEmptyParagraphChild(child)) return true;

    const previous = children[index - 1];
    const next = children[index + 1];
    return (
      index !== 0 && index !== children.length - 1 && !isListChild(previous) && !isListChild(next)
    );
  });
}

function isEmptyParagraphChild(child) {
  return (
    child?.type === "paragraph" &&
    Array.isArray(child.children) &&
    child.children.every((textChild) => !textChild?.text?.trim())
  );
}

function isListChild(child) {
  return LIST_ELEMENT_TYPES.has(child?.type);
}

function splitParagraphTextChildren(children) {
  const paragraphs = [[]];

  for (const child of children) {
    const lines = child.text.split("\n");
    for (const [index, text] of lines.entries()) {
      if (index > 0) paragraphs.push([]);
      if (text) paragraphs.at(-1).push({ ...child, text });
    }
  }

  return paragraphs;
}

function deserializeParagraphChildren(children) {
  const output = document.createElement("div");

  for (const child of children) {
    if (!child || typeof child !== "object") continue;

    if (typeof child.text === "string") {
      const paragraphChildren = createParagraphChildren(
        createMarkedTextNodes(child.text, child.marks),
      );
      for (const paragraphChild of paragraphChildren) {
        appendParagraphElement(output, paragraphChild.children);
      }
      continue;
    }

    if (LIST_ELEMENT_TYPES.has(child.type)) {
      appendListElement(output, child);
      continue;
    }

    if (!Array.isArray(child.children)) continue;
    appendParagraphElement(output, child.children);
  }

  return output.innerHTML;
}

function appendListElement(output, child) {
  const list = document.createElement(LIST_ELEMENT_TYPES.get(child.type));

  const items = Array.isArray(child.children) ? child.children : [];
  for (const item of items) {
    if (!item || typeof item !== "object" || !Array.isArray(item.children)) continue;

    const listItem = document.createElement("li");
    listItem.innerHTML = deserializeTextChildren(item.children);
    list.append(listItem);
  }

  output.append(list);
}

function appendParagraphElement(output, children) {
  const paragraph = document.createElement("p");
  paragraph.innerHTML = deserializeTextChildren(children);
  output.append(paragraph);
}

function createMarkedTextNodes(text, marks = {}) {
  const fragment = document.createDocumentFragment();
  const textParts = text.split("\n");

  for (const [index, part] of textParts.entries()) {
    if (index > 0) fragment.append(document.createElement("br"));
    if (!part) continue;

    fragment.append(createMarkedTextNode(part, marks));
  }

  return fragment;
}

function createMarkedTextNode(text, marks = {}) {
  let node = document.createTextNode(text);
  const marksElement = createMarksElement(marks);

  if (marksElement) {
    marksElement.append(node);
    node = marksElement;
  }

  if (typeof marks.link === "string" && marks.link) {
    const link = document.createElement("a");
    link.setAttribute("href", marks.link);
    if (typeof marks.target === "string" && marks.target) link.setAttribute("target", marks.target);
    link.append(node);
    return link;
  }

  return node;
}

function createMarksElement(marks = {}) {
  const element = document.createElement("span");

  if (marks.bold) element.classList.add("text-bold");
  if (marks.italic) element.classList.add("text-italic");
  if (marks.underline) element.classList.add("text-underline");
  if (typeof marks.color === "string" && marks.color) {
    element.classList.add("text-color");
    element.style.color = marks.color;
  }
  if (typeof marks.fontSize === "string" && marks.fontSize) {
    element.style.fontSize = marks.fontSize;
  }
  if (marks.highlight) {
    element.classList.add("text-mark");
    if (typeof marks.markStyle === "string" && marks.markStyle) {
      const markStyle = normalizeTextClass(marks.markStyle);
      if (markStyle) element.classList.add(markStyle);
    }
    if (typeof marks.backgroundColor === "string" && marks.backgroundColor) {
      element.style.setProperty("--mark-highlight-color", marks.backgroundColor);
    }
  }

  return element.attributes.length ? element : null;
}

function normalizeTextClass(className) {
  return /^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/.test(className) ? className : "";
}

function htmlToFragment(html) {
  const template = document.createElement("template");
  template.innerHTML = html ?? "";
  return template.content;
}

function appendTextChildren(node, inheritedMarks, children) {
  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      appendTextWithLineBreaks(children, child.textContent, inheritedMarks);
    } else if (
      child.nodeType === Node.ELEMENT_NODE &&
      child.getAttribute?.(EDITOR_PADDING_BREAK) != null
    ) {
      continue;
    } else if (child.nodeName === "BR") {
      appendLineBreakChild(children, inheritedMarks);
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const marks = getElementMarks(child, inheritedMarks);
      appendTextChildren(child, marks, children);
      if (child.localName === "p") appendLineBreakChild(children, inheritedMarks);
    }
  }
}

function appendTextWithLineBreaks(children, text, marks) {
  const parts = text.split("\n");

  for (const [index, part] of parts.entries()) {
    if (index > 0) appendLineBreakChild(children, marks);
    appendTextChild(children, part, marks);
  }
}

function appendLineBreakChild(children, marks) {
  appendTextChild(children, "\n", { ...marks, br: true });
}

function getElementMarks(element, inheritedMarks) {
  const marks = { ...inheritedMarks };

  if (element.classList.contains("text-bold")) marks.bold = true;
  if (element.classList.contains("text-italic")) marks.italic = true;
  if (element.classList.contains("text-underline")) marks.underline = true;
  if (element.classList.contains("text-color")) marks.color = element.style.color;
  if (element.style.fontSize) marks.fontSize = element.style.fontSize;
  if (element.classList.contains("text-mark")) {
    marks.highlight = true;
    const markStyle = Array.from(element.classList).find((className) =>
      className.startsWith("mark-"),
    );
    if (markStyle) marks.markStyle = markStyle;
    if (element.style.getPropertyValue("--mark-highlight-color")) {
      marks.backgroundColor = element.style.getPropertyValue("--mark-highlight-color");
    }
  }
  if (element.localName === "a") {
    marks.link = element.getAttribute("href") ?? "";
    const target = element.getAttribute("target");
    if (target) marks.target = target;
  }

  return marks;
}

function appendTextChild(children, text, marks) {
  if (!text) return;

  const child = { text };
  if (Object.keys(marks).length) child.marks = marks;
  children.push(child);
}

function mergeAdjacentTextChildren(children) {
  const merged = [];

  for (const child of children) {
    const previous = merged.at(-1);
    if (previous && marksMatch(previous.marks, child.marks)) {
      previous.text += child.text;
    } else {
      merged.push(child);
    }
  }

  const last = merged.at(-1);
  if (last?.text === "\n") merged.pop();
  else if (last?.text.endsWith("\n")) last.text = last.text.slice(0, -1);
  return merged;
}

function marksMatch(first = null, second = null) {
  return JSON.stringify(first ?? {}) === JSON.stringify(second ?? {});
}

const EMPTY_PARAGRAPH_PATTERN = String.raw`<p(?:\s[^>]*)?>\s*</p>`;

function removeEmptyParagraphsAdjacentToLists(html) {
  const beforeList = new RegExp(`${EMPTY_PARAGRAPH_PATTERN}(?=\\s*<(?:ol|ul)\\b)`, "gi");
  const afterList = new RegExp(`(</(?:ol|ul)>)\\s*${EMPTY_PARAGRAPH_PATTERN}`, "gi");

  return html.replace(beforeList, "").replace(afterList, "$1");
}

function removeTrailingEmptyParagraphs(html) {
  const trailingParagraphs = new RegExp(`(?:${EMPTY_PARAGRAPH_PATTERN}\\s*)+$`, "gi");
  return html.replace(trailingParagraphs, "");
}

export function isSelectionInside(editor, selection) {
  return Boolean(
    selection?.rangeCount &&
    editor?.contains(selection.anchorNode) &&
    editor.contains(selection.focusNode),
  );
}

export function selectRange(selection, range) {
  selection.removeAllRanges();
  selection.addRange(range);
}

export function rangesMatch(firstRange, secondRange) {
  return Boolean(
    firstRange &&
    secondRange &&
    firstRange.startContainer === secondRange.startContainer &&
    firstRange.startOffset === secondRange.startOffset &&
    firstRange.endContainer === secondRange.endContainer &&
    firstRange.endOffset === secondRange.endOffset,
  );
}

export function getSelectedAncestor(editor, range, selector) {
  if (!editor || !range) return null;

  let element = range.startContainer;
  if (element.nodeType !== Node.ELEMENT_NODE) element = element.parentElement;

  while (element && element !== editor) {
    if (element.matches(selector)) return element;
    element = element.parentElement;
  }

  return null;
}

export function unwrapListsFromParagraphs(editor) {
  for (const list of editor.querySelectorAll("p > ul, p > ol")) {
    const paragraph = list.parentElement;
    const before = document.createElement("p");
    const after = document.createElement("p");

    while (paragraph.firstChild !== list) before.append(paragraph.firstChild);
    while (list.nextSibling) after.append(list.nextSibling);

    paragraph.replaceWith(
      ...(before.hasChildNodes() ? [before] : []),
      list,
      ...(after.hasChildNodes() ? [after] : []),
    );
  }
}

export function wrapParagraphContent(editor) {
  if (!needsParagraphWrapping(editor)) return false;

  const fragment = document.createDocumentFragment();
  let paragraph = null;

  for (const node of Array.from(editor.childNodes)) {
    if (node.nodeType === Node.ELEMENT_NODE && PARAGRAPH_CONTENT_TAGS.includes(node.tagName)) {
      paragraph = null;
      fragment.append(node);
    } else if (node.nodeName === "BR") {
      paragraph = null;
      node.remove();
    } else {
      paragraph ??= fragment.appendChild(document.createElement("p"));
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "DIV") {
        paragraph.append(...node.childNodes);
        node.remove();
      } else {
        paragraph.append(node);
      }
    }
  }

  editor.append(fragment);
  return true;
}

export function needsParagraphWrapping(editor) {
  return Array.from(editor.childNodes).some(
    (node) => node.nodeType !== ELEMENT_NODE || !PARAGRAPH_CONTENT_TAGS.includes(node.tagName),
  );
}

export function removeLinkSelectionPreview(editor, range) {
  const preview =
    getSelectedAncestor(editor, range, "[data-link-selection]") ||
    editor?.querySelector("[data-link-selection]");
  if (!preview) return;

  preview.removeAttribute("data-link-selection");
  if (preview.localName === "a") return;

  const firstChild = preview.firstChild;
  const lastChild = preview.lastChild;
  preview.replaceWith(...preview.childNodes);
  if (range) {
    range.setStartBefore(firstChild);
    range.setEndAfter(lastChild);
  }
}

export function insertPlainText(selection, text) {
  if (!selection?.rangeCount) return false;

  const range = selection.getRangeAt(0);
  const node = document.createTextNode(text);
  range.deleteContents();
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  selectRange(selection, range);
  return true;
}

export function insertPlainTextAsParagraphs(editor, selection, text) {
  const normalizedText = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\r\n?|\n/g, "\n")
    .split("\n")
    .filter((line) => line.trim())
    .join("\n");
  if (!selection?.rangeCount) return false;

  const range = selection.getRangeAt(0);
  const startElement =
    range.startContainer.nodeType === ELEMENT_NODE
      ? range.startContainer
      : range.startContainer.parentElement;
  const paragraph = startElement?.closest("p");

  if (!paragraph || !editor.contains(paragraph)) {
    if (editor.textContent.trim()) return insertPlainText(selection, normalizedText);

    editor.replaceChildren();
    const lines = normalizedText.split("\n");
    let caretContainer;

    for (const line of lines) {
      const nextParagraph = document.createElement("p");
      if (line) {
        caretContainer = document.createTextNode(line);
        nextParagraph.append(caretContainer);
      } else {
        caretContainer = nextParagraph;
      }
      editor.append(nextParagraph);
    }

    const caretRange = document.createRange();
    if (caretContainer.nodeType === ELEMENT_NODE) {
      caretRange.setStart(caretContainer, 0);
    } else {
      caretRange.setStartAfter(caretContainer);
    }
    caretRange.collapse(true);
    selectRange(selection, caretRange);
    return true;
  }

  if (!normalizedText.includes("\n")) return insertPlainText(selection, normalizedText);

  range.deleteContents();
  const trailingRange = document.createRange();
  trailingRange.setStart(range.startContainer, range.startOffset);
  trailingRange.setEnd(paragraph, paragraph.childNodes.length);
  const trailingContent = trailingRange.extractContents();

  const lines = normalizedText.split("\n");
  const firstLine = document.createTextNode(lines.shift());
  range.insertNode(firstLine);

  let currentParagraph = paragraph;
  let caretContainer = firstLine;
  for (const line of lines) {
    const nextParagraph = document.createElement("p");
    currentParagraph.after(nextParagraph);
    currentParagraph = nextParagraph;

    if (line) {
      caretContainer = document.createTextNode(line);
      currentParagraph.append(caretContainer);
    } else {
      caretContainer = currentParagraph;
    }
  }

  const caretRange = document.createRange();
  if (caretContainer.nodeType === ELEMENT_NODE) {
    caretRange.setStart(caretContainer, 0);
  } else {
    caretRange.setStartAfter(caretContainer);
  }
  caretRange.collapse(true);
  currentParagraph.append(trailingContent);
  selectRange(selection, caretRange);
  return true;
}
