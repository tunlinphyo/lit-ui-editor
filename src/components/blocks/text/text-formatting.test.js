import { expect, test } from "vite-plus/test";
import {
  applySelectionCommand,
  normalizeMarkClass,
  removeEmptyInlineElement,
} from "./text-formatting.js";
import { needsParagraphWrapping } from "./text-utils.js";

function createElement({ text = "", renderedElement = null } = {}) {
  let removed = false;

  return {
    element: {
      textContent: text,
      querySelector: () => renderedElement,
      remove: () => {
        removed = true;
      },
    },
    wasRemoved: () => removed,
  };
}

test("removes a formatting wrapper that contains only empty text nodes", () => {
  const wrapper = createElement();

  removeEmptyInlineElement(wrapper.element);

  expect(wrapper.wasRemoved()).toBe(true);
});

test("preserves formatting wrappers containing whitespace or rendered elements", () => {
  const whitespaceWrapper = createElement({ text: " " });
  const lineBreakWrapper = createElement({ renderedElement: {} });

  removeEmptyInlineElement(whitespaceWrapper.element);
  removeEmptyInlineElement(lineBreakWrapper.element);

  expect(whitespaceWrapper.wasRemoved()).toBe(false);
  expect(lineBreakWrapper.wasRemoved()).toBe(false);
});

test("does not rebuild valid paragraph and list children after a list command", () => {
  const editor = {
    childNodes: [
      { nodeType: 1, tagName: "P" },
      { nodeType: 1, tagName: "UL" },
      { nodeType: 1, tagName: "OL" },
    ],
  };

  expect(needsParagraphWrapping(editor)).toBe(false);
});

test("repairs direct text or inline children after a list command", () => {
  const directTextEditor = {
    childNodes: [{ nodeType: 3, textContent: "List item" }],
  };
  const inlineElementEditor = {
    childNodes: [{ nodeType: 1, tagName: "SPAN" }],
  };

  expect(needsParagraphWrapping(directTextEditor)).toBe(true);
  expect(needsParagraphWrapping(inlineElementEditor)).toBe(true);
});

test("accepts one safe configured mark class", () => {
  expect(normalizeMarkClass("mark-primary")).toBe("mark-primary");
  expect(normalizeMarkClass("mark-primary unsafe")).toBe("");
});

test("applies font size after applying text color", () => {
  const { editor, range, selection } = createEditorSelection("Text");

  const colored = applySelectionCommand({
    command: "foreColor",
    value: "#2563eb",
    editor,
    type: "p",
    paragraphMode: true,
    range,
    selection,
  });

  applySelectionCommand({
    command: "fontSize",
    value: "24px",
    editor,
    type: "p",
    paragraphMode: true,
    range: colored.range,
    selection,
  });

  expect(editor.innerHTML).toContain("text-color");
  expect(editor.innerHTML).toContain("color: rgb(37, 99, 235)");
  expect(editor.innerHTML).toContain("font-size: 24px");
});

test("applies text color after applying font size", () => {
  const { editor, range, selection } = createEditorSelection("Text");

  const sized = applySelectionCommand({
    command: "fontSize",
    value: "24px",
    editor,
    type: "p",
    paragraphMode: true,
    range,
    selection,
  });

  applySelectionCommand({
    command: "foreColor",
    value: "#2563eb",
    editor,
    type: "p",
    paragraphMode: true,
    range: sized.range,
    selection,
  });

  expect(editor.innerHTML).toContain("text-color");
  expect(editor.innerHTML).toContain("color: rgb(37, 99, 235)");
  expect(editor.innerHTML).toContain("font-size: 24px");
});

function createEditorSelection(text) {
  const editor = document.createElement("div");
  const textNode = document.createTextNode(text);
  editor.append(textNode);
  document.body.append(editor);

  const range = document.createRange();
  range.setStart(textNode, 0);
  range.setEnd(textNode, text.length);

  const selection = document.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  return { editor, range, selection };
}
