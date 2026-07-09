import {
  isEmptyHtml,
  normalizeBlockContent,
  normalizeParagraphs,
  selectRange,
} from "./text-utils.js";

export function getEditorElement(renderRoot) {
  return renderRoot.querySelector(".editor");
}

export function getEditorSelection(renderRoot) {
  return renderRoot.getSelection?.() ?? document.getSelection();
}

export function initializeEditor(
  editor,
  {
    value,
    type,
    placeholder,
    textAlign,
    fontWeight,
    fontSize,
    fontFamily,
    paragraphMode = type === "p",
  },
) {
  if (paragraphMode) {
    editor.innerHTML = isEmptyHtml(value) ? "<p></p>" : value;
    updateEditorPlaceholder(editor, placeholder);
    setDefaultParagraphSeparator(editor);
  } else {
    editor.innerHTML = isEmptyHtml(value) ? "" : value;
    editor.style.removeProperty("--placeholder");
  }

  applyEditorPresentation(editor, {
    type,
    paragraphMode,
    textAlign,
    fontWeight,
    fontSize,
    fontFamily,
  });
  updateEditorEmptyState(editor, paragraphMode);
}

const EDITOR_PADDING_BREAK = "data-editor-padding-break";

export function insertEditorLineBreak(selection, editor = null) {
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
  if (!range) return false;

  range.deleteContents();

  const lineBreak = document.createElement("br");
  range.insertNode(lineBreak);
  if (editor && !hasVisibleContentAfter(lineBreak, editor)) {
    const paddingBreak = document.createElement("br");
    paddingBreak.setAttribute(EDITOR_PADDING_BREAK, "");
    lineBreak.after(paddingBreak);
  }
  range.setStartAfter(lineBreak);
  range.collapse(true);
  selectRange(selection, range);
  return true;
}

export function captureEditorState(editor, range = null) {
  const selectionMarkers = insertSelectionMarkers(editor, range);
  const value = editor.innerHTML;
  removeSelectionMarkers(selectionMarkers);

  return {
    value,
    textAlign: editor.style.textAlign,
    fontWeight: editor.style.fontWeight,
    fontSize: editor.style.fontSize,
    fontFamily: editor.style.fontFamily,
  };
}

export function restoreEditorState(
  editor,
  { value, type, paragraphMode = type === "p", textAlign, fontWeight, fontSize, fontFamily },
) {
  editor.innerHTML = normalizeBlockContent(value, paragraphMode ? "p" : "h1");
  applyEditorPresentation(editor, {
    type,
    paragraphMode,
    textAlign,
    fontWeight,
    fontSize,
    fontFamily,
  });
  updateEditorEmptyState(editor, paragraphMode);
  restoreSelectionMarkers(editor);
}

export function syncEditorFromProperties(
  editor,
  { value, type, paragraphMode = type === "p", textAlign, fontWeight, fontSize, fontFamily },
) {
  let normalizedValue = normalizeBlockContent(value, paragraphMode ? "p" : "h1");
  if (isEmptyHtml(normalizedValue)) normalizedValue = "";

  if (editor.innerHTML !== normalizedValue) editor.innerHTML = normalizedValue;
  applyEditorPresentation(editor, {
    type,
    paragraphMode,
    textAlign,
    fontWeight,
    fontSize,
    fontFamily,
  });
  updateEditorEmptyState(editor, paragraphMode);
}

export function updateEditorPlaceholder(editor, placeholder) {
  const escapedPlaceholder = (placeholder || "").replace(/"/g, '\\"');
  editor.style.setProperty("--placeholder", `"${escapedPlaceholder}"`);
}

export function updateEditorEmptyState(editor, paragraphMode) {
  editor.toggleAttribute("data-empty", isEmptyHtml(editor.innerHTML));
  editor.toggleAttribute("data-paragraph-mode", Boolean(paragraphMode));
}

export function setDefaultParagraphSeparator(editor) {
  try {
    editor?.ownerDocument?.execCommand?.("defaultParagraphSeparator", false, "p");
  } catch {
    // Legacy browser hint only; normalization still handles generated divs.
  }
}

export function normalizeEditorParagraphs(editor, paragraphMode) {
  const normalizedValue = normalizeParagraphs(editor.innerHTML, paragraphMode ? "p" : "h1");
  if (normalizedValue === editor.innerHTML) return false;

  editor.innerHTML = normalizedValue;
  return true;
}

export function normalizeEditorInput(editor, paragraphMode) {
  const html = editor.innerHTML;
  updateEditorEmptyState(editor, paragraphMode);
  if (isEmptyHtml(html)) {
    if (!paragraphMode) {
      editor.replaceChildren();
      updateEditorEmptyState(editor, paragraphMode);

      const selection = editor.getRootNode().getSelection?.() ?? document.getSelection();
      if (selection) {
        const range = document.createRange();
        range.setStart(editor, 0);
        range.collapse(true);
        selectRange(selection, range);
      }
      return true;
    }

    const existingParagraph =
      editor.childElementCount === 1 && editor.firstElementChild?.tagName === "P"
        ? editor.firstElementChild
        : null;
    const paragraph = existingParagraph ?? document.createElement("p");
    paragraph.replaceChildren();
    if (!existingParagraph) editor.replaceChildren(paragraph);

    const selection = editor.getRootNode().getSelection?.() ?? document.getSelection();
    if (selection) {
      const range = document.createRange();
      range.setStart(paragraph, 0);
      range.collapse(true);
      selectRange(selection, range);
    }
    return true;
  }

  const normalizedValue = normalizeParagraphs(html, paragraphMode ? "p" : "h1");
  if (normalizedValue === html) return false;

  const selection = editor.getRootNode().getSelection?.() ?? document.getSelection();
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
  if (!range || !editor.contains(range.commonAncestorContainer)) {
    editor.innerHTML = normalizedValue;
    return true;
  }

  const marker = document.createElement("span");
  marker.setAttribute("data-editor-caret", "");

  const caretRange = range.cloneRange();
  caretRange.collapse(false);
  caretRange.insertNode(marker);

  editor.innerHTML = normalizeParagraphs(editor.innerHTML, paragraphMode ? "p" : "h1");

  const restoredMarker = editor.querySelector("[data-editor-caret]");
  if (!restoredMarker || !selection) return true;

  const restoredRange = document.createRange();
  restoredRange.setStartBefore(restoredMarker);
  restoredRange.collapse(true);
  restoredMarker.remove();
  selectRange(selection, restoredRange);
  return true;
}

export function placeCaretInEmptyEditor(editor, selection) {
  if (!editor || !selection || editor.textContent.trim() !== "") return false;

  const range = document.createRange();
  const paragraph =
    editor.childElementCount === 1 && editor.firstElementChild?.tagName === "P"
      ? editor.firstElementChild
      : null;

  if (paragraph) range.setStart(paragraph, 0);
  else {
    range.selectNodeContents(editor);
    range.collapse(false);
  }

  range.collapse(true);
  selectRange(selection, range);
  return true;
}

function applyEditorPresentation(
  editor,
  { type, paragraphMode, textAlign, fontWeight, fontSize, fontFamily },
) {
  editor.style.textAlign = textAlign;
  editor.style.fontWeight = fontWeight;
  editor.style.fontSize = paragraphMode ? "" : fontSize;
  editor.style.fontFamily =
    fontFamily || (type === "p" ? "var(--font-body)" : "var(--font-heading)");
}

function hasVisibleContentAfter(node, root) {
  const nodeFilter = root.ownerDocument.defaultView.NodeFilter;
  const walker = document.createTreeWalker(root, nodeFilter.SHOW_ELEMENT | nodeFilter.SHOW_TEXT);
  walker.currentNode = node;

  let current = walker.nextNode();
  while (current) {
    if (current.nodeType === Node.TEXT_NODE && current.textContent) return true;
    if (current.nodeType === Node.ELEMENT_NODE && isVisibleEditorElement(current)) return true;
    current = walker.nextNode();
  }

  return false;
}

function isVisibleEditorElement(element) {
  if (element.nodeName === "BR" || element.getAttribute(EDITOR_PADDING_BREAK) != null) return false;

  return /^(AUDIO|CANVAS|EMBED|HR|IFRAME|IMG|INPUT|OBJECT|SELECT|SVG|TEXTAREA|VIDEO)$/.test(
    element.nodeName,
  );
}

const CARET_MARKER = "data-text-selection-caret";
const START_MARKER = "data-text-selection-start";
const END_MARKER = "data-text-selection-end";

function insertSelectionMarkers(editor, range) {
  if (!range || !editor.contains(range.commonAncestorContainer)) return [];

  if (range.collapsed) {
    const marker = createSelectionMarker(CARET_MARKER);
    range.cloneRange().insertNode(marker);
    return [marker];
  }

  const startRange = range.cloneRange();
  const endRange = range.cloneRange();
  const endMarker = createSelectionMarker(END_MARKER);
  endRange.collapse(false);
  endRange.insertNode(endMarker);

  const startMarker = createSelectionMarker(START_MARKER);
  startRange.collapse(true);
  startRange.insertNode(startMarker);
  return [startMarker, endMarker];
}

function createSelectionMarker(attribute) {
  const marker = document.createElement("span");
  marker.setAttribute(attribute, "");
  return marker;
}

function removeSelectionMarkers(markers) {
  for (const marker of markers) marker.remove();
}

function restoreSelectionMarkers(editor) {
  const caretMarker = editor.querySelector(`[${CARET_MARKER}]`);
  const startMarker = editor.querySelector(`[${START_MARKER}]`);
  const endMarker = editor.querySelector(`[${END_MARKER}]`);
  const selection = editor.getRootNode().getSelection?.() ?? document.getSelection();
  if (!selection || (!caretMarker && (!startMarker || !endMarker))) {
    removeSelectionMarkers([caretMarker, startMarker, endMarker].filter(Boolean));
    return false;
  }

  editor.focus({ preventScroll: true });
  const range = document.createRange();
  if (caretMarker) {
    range.setStartBefore(caretMarker);
    range.collapse(true);
    caretMarker.remove();
  } else {
    range.setStartAfter(startMarker);
    range.setEndBefore(endMarker);
    startMarker.remove();
    endMarker.remove();
  }
  selectRange(selection, range);
  return true;
}
