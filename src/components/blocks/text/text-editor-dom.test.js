import { afterEach, expect, test } from "vitest";
import {
  captureEditorState,
  initializeEditor,
  insertEditorLineBreak,
  normalizeEditorInput,
  restoreEditorState,
} from "./text-editor-dom.js";

afterEach(() => {
  document.body.replaceChildren();
  document.getSelection()?.removeAllRanges();
});

test("initializes an empty paragraph editor with its placeholder and paragraph presentation", () => {
  const editor = createEditor();

  initializeEditor(editor, {
    value: "<br>",
    type: "p",
    placeholder: 'Write "something"',
    textAlign: "center",
    fontWeight: "700",
    fontSize: "24px",
    fontFamily: "",
  });

  expect(editor.innerHTML).toBe("<p></p>");
  expect(editor.hasAttribute("data-empty")).toBe(true);
  expect(editor.hasAttribute("data-paragraph-mode")).toBe(true);
  expect(editor.style.getPropertyValue("--placeholder")).toBe('"Write \\"something\\""');
  expect(editor.style.textAlign).toBe("center");
  expect(editor.style.fontWeight).toBe("700");
  expect(editor.style.fontSize).toBe("");
  expect(editor.style.fontFamily).toBe("var(--font-body)");
});

test("initializes a heading without paragraph-only placeholder or font-size restrictions", () => {
  const editor = createEditor();
  editor.style.setProperty("--placeholder", '"old"');

  initializeEditor(editor, {
    value: "Heading",
    type: "h2",
    placeholder: "Ignored",
    textAlign: "left",
    fontWeight: "",
    fontSize: "32px",
    fontFamily: "Inter",
  });

  expect(editor.innerHTML).toBe("Heading");
  expect(editor.hasAttribute("data-empty")).toBe(false);
  expect(editor.hasAttribute("data-paragraph-mode")).toBe(false);
  expect(editor.style.getPropertyValue("--placeholder")).toBe("");
  expect(editor.style.fontSize).toBe("32px");
  expect(editor.style.fontFamily).toBe("Inter");
});

test("normalizes an emptied paragraph editor and places its caret in the replacement paragraph", () => {
  const editor = createEditor("<div><br></div>");

  expect(normalizeEditorInput(editor, true)).toBe(true);
  expect(editor.innerHTML).toBe("<p></p>");
  expect(editor.hasAttribute("data-empty")).toBe(true);

  const range = document.getSelection().getRangeAt(0);
  expect(range.startContainer).toBe(editor.firstElementChild);
  expect(range.collapsed).toBe(true);
});

test("inserts a padding break at the end of an inline editor but not before remaining content", () => {
  const editor = createEditor("Hello");
  const selection = document.getSelection();
  const range = document.createRange();
  range.setStart(editor.firstChild, 5);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);

  expect(insertEditorLineBreak(selection, editor)).toBe(true);
  expect(editor.innerHTML).toBe('Hello<br><br data-editor-padding-break="">');
  expect(selection.getRangeAt(0).collapsed).toBe(true);

  editor.innerHTML = "HelloWorld";
  range.setStart(editor.firstChild, 5);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);

  insertEditorLineBreak(selection, editor);
  expect(editor.innerHTML).toBe("Hello<br>World");
});

test("captures and restores an editor state with a selected range", () => {
  const editor = createEditor("<p>Hello world</p>");
  const selection = document.getSelection();
  const range = document.createRange();
  range.setStart(editor.firstChild.firstChild, 0);
  range.setEnd(editor.firstChild.firstChild, 5);
  selection.removeAllRanges();
  selection.addRange(range);

  const state = captureEditorState(editor, range);
  expect(state.value).toContain("data-text-selection-start");
  expect(state.value).toContain("data-text-selection-end");
  expect(editor.innerHTML).toBe("<p>Hello world</p>");

  restoreEditorState(editor, {
    ...state,
    type: "p",
    paragraphMode: true,
  });

  expect(editor.querySelector("[data-text-selection-start]")).toBeNull();
  expect(editor.querySelector("[data-text-selection-end]")).toBeNull();
  expect(document.getSelection().rangeCount).toBe(1);
});

function createEditor(html = "") {
  const editor = document.createElement("div");
  editor.contentEditable = "true";
  editor.innerHTML = html;
  document.body.append(editor);
  return editor;
}
