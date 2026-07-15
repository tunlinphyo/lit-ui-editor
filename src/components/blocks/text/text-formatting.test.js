import { expect, test } from "vitest";
import {
  applySelectionCommand,
  describeSelectionFormat,
  normalizeMarkClass,
  removeEmptyInlineElement,
} from "./text-formatting.js";
import { needsParagraphWrapping, serializeTextChildren } from "./text-utils.js";

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

  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [{ text: "Text", marks: { color: "#2563eb", fontSize: "24px" } }],
    },
  ]);
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

  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [{ text: "Text", marks: { fontSize: "24px", color: "#2563eb" } }],
    },
  ]);
});

test("changes font size on part of rich text, then changes the whole text again", () => {
  const editor = createRichTextEditor("<p>Hello rich editor text</p>");
  const partial = selectText(editor, "rich");

  applyRichTextCommand(editor, partial.range, partial.selection, "fontSize", "24px");

  const wholeText = selectAllText(editor);
  applyRichTextCommand(editor, wholeText.range, wholeText.selection, "fontSize", "18px");
  const children = serializeCleanTextChildren(editor);

  expect(children).toEqual([
    {
      type: "paragraph",
      children: [{ text: "Hello rich editor text", marks: { fontSize: "18px" } }],
    },
  ]);
});

test("removes a formatter from the middle of fully formatted rich text", () => {
  const editor = createRichTextEditor("<p>Alpha beta gamma</p>");
  const wholeText = selectAllText(editor);

  applyRichTextCommand(editor, wholeText.range, wholeText.selection, "bold");

  const middle = selectText(editor, "beta");
  applyRichTextCommand(editor, middle.range, middle.selection, "bold");
  const children = serializeCleanTextChildren(editor);

  expect(children).toEqual([
    {
      type: "paragraph",
      children: [
        { text: "Alpha ", marks: { bold: true } },
        { text: "beta" },
        { text: " gamma", marks: { bold: true } },
      ],
    },
  ]);
});

test("removes text color from the middle of fully colored rich text", () => {
  const editor = createRichTextEditor("<p>Alpha beta gamma</p>");
  let selected = selectAllText(editor);
  applyRichTextCommand(editor, selected.range, selected.selection, "foreColor", "red");

  selected = selectText(editor, "beta");
  applyRichTextCommand(editor, selected.range, selected.selection, "foreColor", "");

  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [
        { text: "Alpha ", marks: { color: "red" } },
        { text: "beta" },
        { text: " gamma", marks: { color: "red" } },
      ],
    },
  ]);
});

test("removes font size from the middle of fully sized rich text", () => {
  const editor = createRichTextEditor("<p>Alpha beta gamma</p>");
  let selected = selectAllText(editor);
  applyRichTextCommand(editor, selected.range, selected.selection, "fontSize", "28px");

  selected = selectText(editor, "beta");
  applyRichTextCommand(editor, selected.range, selected.selection, "fontSize", "");

  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [
        { text: "Alpha ", marks: { fontSize: "28px" } },
        { text: "beta" },
        { text: " gamma", marks: { fontSize: "28px" } },
      ],
    },
  ]);
});

test("combines different inline formatters across different rich-text selections", () => {
  const editor = createRichTextEditor("<p>The quick brown fox jumps</p>");

  let selected = selectText(editor, "quick");
  let result = applyRichTextCommand(editor, selected.range, selected.selection, "bold");
  result = applyRichTextCommand(editor, result.range, selected.selection, "foreColor", "blue");

  selected = selectText(editor, "brown");
  result = applyRichTextCommand(editor, selected.range, selected.selection, "italic");
  applyRichTextCommand(editor, result.range, selected.selection, "fontSize", "22px");

  selected = selectAllText(editor);
  applyRichTextCommand(editor, selected.range, selected.selection, "underline");
  const children = serializeCleanTextChildren(editor);

  expect(children).toEqual([
    {
      type: "paragraph",
      children: [
        { text: "The ", marks: { underline: true } },
        { text: "quick", marks: { underline: true, bold: true, color: "blue" } },
        { text: " ", marks: { underline: true } },
        { text: "brown", marks: { underline: true, italic: true, fontSize: "22px" } },
        { text: " fox jumps", marks: { underline: true } },
      ],
    },
  ]);
});

test("toggles highlight off for only the selected part of highlighted rich text", () => {
  const editor = createRichTextEditor("<p>Alpha beta gamma</p>");
  let selected = selectAllText(editor);
  applyRichTextCommand(editor, selected.range, selected.selection, "highlight");

  selected = selectText(editor, "beta");
  applyRichTextCommand(editor, selected.range, selected.selection, "highlight");

  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [
        {
          text: "Alpha ",
          marks: { highlight: true, backgroundColor: "rgb(255, 247, 220)" },
        },
        { text: "beta" },
        {
          text: " gamma",
          marks: { highlight: true, backgroundColor: "rgb(255, 247, 220)" },
        },
      ],
    },
  ]);
});

test("applies highlight, mark style, background color, and text color to one rich-text part", () => {
  const editor = createRichTextEditor("<p>This is important content</p>");
  const selected = selectText(editor, "important");

  let result = applyRichTextCommand(editor, selected.range, selected.selection, "highlight");
  result = applyRichTextCommand(
    editor,
    result.range,
    selected.selection,
    "backgroundColor",
    "#fde68a",
  );
  result = applyRichTextCommand(
    editor,
    result.range,
    selected.selection,
    "markStyle",
    "mark-primary",
  );
  applyRichTextCommand(editor, result.range, selected.selection, "foreColor", "green");
  const children = serializeCleanTextChildren(editor);

  expect(children).toEqual([
    {
      type: "paragraph",
      children: [
        { text: "This is " },
        {
          text: "important",
          marks: {
            highlight: true,
            markStyle: "mark-primary",
            backgroundColor: "#fde68a",
            color: "green",
          },
        },
        { text: " content" },
      ],
    },
  ]);
});

test("updates and clears mark style without removing the highlight mark", () => {
  const editor = createRichTextEditor("<p>Marked text</p>");
  const selected = selectText(editor, "Marked");

  let result = applyRichTextCommand(editor, selected.range, selected.selection, "highlight");
  result = applyRichTextCommand(
    editor,
    result.range,
    selected.selection,
    "markStyle",
    "mark-primary",
  );
  applyRichTextCommand(
    editor,
    result.range,
    selected.selection,
    "markStyle",
    "mark-primary unsafe",
  );

  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [
        {
          text: "Marked",
          marks: { highlight: true, backgroundColor: "rgb(255, 247, 220)" },
        },
        { text: " text" },
      ],
    },
  ]);
});

test("ignores background color and mark style commands when no highlight is selected", () => {
  const editor = createRichTextEditor("<p>Plain text</p>");
  const selected = selectText(editor, "Plain");

  let result = applyRichTextCommand(
    editor,
    selected.range,
    selected.selection,
    "backgroundColor",
    "#fde68a",
  );
  result = applyRichTextCommand(
    editor,
    result.range,
    selected.selection,
    "markStyle",
    "mark-primary",
  );

  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [{ text: "Plain text" }],
    },
  ]);
});

test("preserves inline formatting when rich text is converted into a list", () => {
  const editor = createRichTextEditor(
    "<p>Intro paragraph</p><p>First item</p><p>Second item</p><p>Outro paragraph</p>",
  );
  let selected = selectText(editor, "Second");
  let result = applyRichTextCommand(editor, selected.range, selected.selection, "fontSize", "20px");
  applyRichTextCommand(editor, result.range, selected.selection, "foreColor", "purple");

  selected = selectTextRange(editor, "First", "Second");
  applyRichTextCommand(editor, selected.range, selected.selection, "insertUnorderedList");
  const children = serializeCleanTextChildren(editor);

  expect(children).toEqual([
    {
      type: "paragraph",
      children: [{ text: "Intro paragraph" }],
    },
    {
      type: "unordered-list",
      children: [
        {
          type: "list-item",
          children: [{ text: "First item" }],
        },
        {
          type: "list-item",
          children: [
            { text: "Second", marks: { fontSize: "20px", color: "purple" } },
            { text: " item" },
          ],
        },
      ],
    },
    {
      type: "paragraph",
      children: [{ text: "Outro paragraph" }],
    },
  ]);
});

test("switches list type and unwraps the matching list command", () => {
  const editor = createRichTextEditor("<p>One</p><p>Two</p>");
  let selected = selectAllText(editor);

  applyRichTextCommand(editor, selected.range, selected.selection, "insertUnorderedList");
  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "unordered-list",
      children: [
        { type: "list-item", children: [{ text: "One" }] },
        { type: "list-item", children: [{ text: "Two" }] },
      ],
    },
  ]);

  selected = selectText(editor, "One");
  applyRichTextCommand(editor, selected.range, selected.selection, "insertOrderedList");
  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "ordered-list",
      children: [
        { type: "list-item", children: [{ text: "One" }] },
        { type: "list-item", children: [{ text: "Two" }] },
      ],
    },
  ]);

  selected = selectText(editor, "Two");
  applyRichTextCommand(editor, selected.range, selected.selection, "insertOrderedList");
  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [{ text: "One" }],
    },
    {
      type: "paragraph",
      children: [{ text: "Two" }],
    },
  ]);
});

test("creates a link with target while keeping existing rich-text marks", () => {
  const editor = createRichTextEditor("<p>Read the docs today</p>");
  const selected = selectText(editor, "docs");

  let result = applyRichTextCommand(editor, selected.range, selected.selection, "bold");
  result = applyRichTextCommand(editor, result.range, selected.selection, "link", "/docs");
  applyRichTextCommand(editor, result.range, selected.selection, "linkTarget", "_blank");
  const children = serializeCleanTextChildren(editor);

  expect(children).toEqual([
    {
      type: "paragraph",
      children: [
        { text: "Read the " },
        { text: "docs", marks: { link: "/docs", target: "_blank", bold: true } },
        { text: " today" },
      ],
    },
  ]);
});

test("keeps a link when applying rich-text marks after link creation", () => {
  const editor = createRichTextEditor("<p>Read the docs today</p>");
  const selected = selectText(editor, "docs");

  let result = applyRichTextCommand(editor, selected.range, selected.selection, "link", "/docs");
  result = applyRichTextCommand(editor, result.range, selected.selection, "bold");
  applyRichTextCommand(editor, result.range, selected.selection, "foreColor", "#2563eb");

  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [
        { text: "Read the " },
        { text: "docs", marks: { link: "/docs", bold: true, color: "#2563eb" } },
        { text: " today" },
      ],
    },
  ]);
});

test("prepares a link preview and replaces it with a link", () => {
  const editor = createRichTextEditor("<p>Read the docs today</p>");
  const selected = selectText(editor, "docs");

  let result = applyRichTextCommand(editor, selected.range, selected.selection, "linkEdit");
  expect(result.shouldNotify).toBe(true);
  expect(editor.querySelector("[data-link-selection]")?.textContent).toBe("docs");

  result = applyRichTextCommand(editor, result.range, selected.selection, "link", "/docs");
  applyRichTextCommand(editor, result.range, selected.selection, "linkTarget", "_blank");

  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [
        { text: "Read the " },
        { text: "docs", marks: { link: "/docs", target: "_blank" } },
        { text: " today" },
      ],
    },
  ]);
});

test("does not prepare a link preview for a collapsed selection", () => {
  const editor = createRichTextEditor("<p>Read docs</p>");
  const selected = selectCaret(editor, "docs", 2);

  const result = applyRichTextCommand(editor, selected.range, selected.selection, "linkEdit");

  expect(result.shouldNotify).toBe(false);
  expect(editor.querySelector("[data-link-selection]")).toBeNull();
  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [{ text: "Read docs" }],
    },
  ]);
});

test("removes an existing link while preserving nested text marks", () => {
  const editor = createRichTextEditor(
    '<p>Read <a href="/docs" target="_blank"><span class="text-bold">docs</span></a> today</p>',
  );
  const selected = selectText(editor, "docs");

  applyRichTextCommand(editor, selected.range, selected.selection, "link", "");

  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [{ text: "Read " }, { text: "docs", marks: { bold: true } }, { text: " today" }],
    },
  ]);
});

test("removes empty spans and empty formatter marks from rich-text JSON output", () => {
  const editor = createRichTextEditor('<p>One <span></span><span class="">two</span> three</p>');
  let selected = selectText(editor, "two");
  let result = applyRichTextCommand(editor, selected.range, selected.selection, "bold");
  applyRichTextCommand(editor, result.range, selected.selection, "bold");

  selected = selectText(editor, "three");
  result = applyRichTextCommand(editor, selected.range, selected.selection, "fontSize", "24px");
  applyRichTextCommand(editor, result.range, selected.selection, "fontSize", "");

  expect(editor.querySelectorAll("span:empty")).toHaveLength(0);
  expect(editor.querySelectorAll("span:not([class]):not([style])")).toHaveLength(0);
  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [{ text: "One two three" }],
    },
  ]);
});

test("combines nested color and repeated bold spans in rich-text mode", () => {
  const editor = createRichTextEditor(
    '<p><span class="text-color" style="color: var(--brand-900);"><span class="text-bold">First</span>\n<span class="text-bold">Second</span><span class="text-bold"> Third</span></span></p>',
  );

  applyNoopCleanupCommand(editor, true);

  const span = editor.querySelector("p > span");
  expect(editor.querySelectorAll("span")).toHaveLength(1);
  expect(span.classList.contains("text-bold")).toBe(true);
  expect(span.classList.contains("text-color")).toBe(true);
  expect(span.style.color).toBe("var(--brand-900)");
  expect(span.textContent).toBe("First\nSecond Third");
  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [
        {
          text: "First",
          marks: { bold: true, color: "var(--brand-900)" },
        },
      ],
    },
    {
      type: "paragraph",
      children: [
        {
          text: "Second Third",
          marks: { bold: true, color: "var(--brand-900)" },
        },
      ],
    },
  ]);
});

test("combines nested color and repeated bold spans in inline-text mode", () => {
  const editor = createRichTextEditor(
    '<span class="text-color" style="color: var(--brand-900);"><span class="text-bold">First</span>\n<span class="text-bold">Second</span><span class="text-bold"> Third</span></span>',
  );

  applyNoopCleanupCommand(editor, false);

  const span = editor.querySelector(":scope > span");
  expect(editor.querySelectorAll("span")).toHaveLength(1);
  expect(span.classList.contains("text-bold")).toBe(true);
  expect(span.classList.contains("text-color")).toBe(true);
  expect(span.style.color).toBe("var(--brand-900)");
  expect(span.textContent).toBe("First\nSecond Third");
  expect(serializeTextChildren(editor)).toEqual([
    {
      text: "First",
      marks: { bold: true, color: "var(--brand-900)" },
    },
    {
      text: "\n",
      marks: { bold: true, color: "var(--brand-900)", br: true },
    },
    {
      text: "Second Third",
      marks: { bold: true, color: "var(--brand-900)" },
    },
  ]);
});

test("preserves bold when recoloring part of a fully bold inline-text block", () => {
  const editor = createRichTextEditor(
    "北区の毎日が、もっと“ほくほく”楽しくなる。\n北区デジタル地域通貨 ほくペイ 10月に誕生！",
  );
  let selected = selectAllText(editor);
  applyInlineTextCommand(editor, selected.range, selected.selection, "bold");

  selected = selectAllText(editor);
  applyInlineTextCommand(
    editor,
    selected.range,
    selected.selection,
    "foreColor",
    "var(--brand-900)",
  );

  selected = selectText(editor, "ほくペイ");
  applyInlineTextCommand(
    editor,
    selected.range,
    selected.selection,
    "foreColor",
    "var(--brand-600)",
  );

  expect(serializeTextChildren(editor)).toEqual([
    {
      text: "北区の毎日が、もっと“ほくほく”楽しくなる。",
      marks: { bold: true, color: "var(--brand-900)" },
    },
    {
      text: "\n",
      marks: { bold: true, color: "var(--brand-900)", br: true },
    },
    {
      text: "北区デジタル地域通貨 ",
      marks: { bold: true, color: "var(--brand-900)" },
    },
    {
      text: "ほくペイ",
      marks: { bold: true, color: "var(--brand-600)" },
    },
    {
      text: " 10月に誕生！",
      marks: { bold: true, color: "var(--brand-900)" },
    },
  ]);
});

test("preserves bold when recoloring part of a fully bold rich-text block", () => {
  const editor = createRichTextEditor(
    "<p>北区の毎日が、もっと“ほくほく”楽しくなる。</p><p>北区デジタル地域通貨 ほくペイ 10月に誕生！</p>",
  );
  let selected = selectAllText(editor);
  applyRichTextCommand(editor, selected.range, selected.selection, "bold");

  selected = selectAllText(editor);
  applyRichTextCommand(editor, selected.range, selected.selection, "foreColor", "var(--brand-900)");

  selected = selectText(editor, "ほくペイ");
  applyRichTextCommand(editor, selected.range, selected.selection, "foreColor", "var(--brand-600)");

  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [
        {
          text: "北区の毎日が、もっと“ほくほく”楽しくなる。",
          marks: { bold: true, color: "var(--brand-900)" },
        },
      ],
    },
    {
      type: "paragraph",
      children: [
        {
          text: "北区デジタル地域通貨 ",
          marks: { bold: true, color: "var(--brand-900)" },
        },
        {
          text: "ほくペイ",
          marks: { bold: true, color: "var(--brand-600)" },
        },
        {
          text: " 10月に誕生！",
          marks: { bold: true, color: "var(--brand-900)" },
        },
      ],
    },
  ]);
});

test("preserves remaining marks when removing one formatter from a partial rich-text selection", () => {
  let editor = createRichTextEditor("<p>Alpha beta gamma</p>");
  applyRichTextCommand(editor, ...Object.values(selectAllText(editor)), "bold");
  applyRichTextCommand(editor, ...Object.values(selectAllText(editor)), "foreColor", "red");
  applyRichTextCommand(editor, ...Object.values(selectText(editor, "beta")), "foreColor", "");

  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [
        { text: "Alpha ", marks: { bold: true, color: "red" } },
        { text: "beta", marks: { bold: true } },
        { text: " gamma", marks: { bold: true, color: "red" } },
      ],
    },
  ]);

  editor = createRichTextEditor("<p>Alpha beta gamma</p>");
  applyRichTextCommand(editor, ...Object.values(selectAllText(editor)), "foreColor", "red");
  applyRichTextCommand(editor, ...Object.values(selectAllText(editor)), "bold");
  applyRichTextCommand(editor, ...Object.values(selectText(editor, "beta")), "bold");

  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [
        { text: "Alpha ", marks: { color: "red", bold: true } },
        { text: "beta", marks: { color: "red" } },
        { text: " gamma", marks: { color: "red", bold: true } },
      ],
    },
  ]);

  editor = createRichTextEditor("<p>Alpha beta gamma</p>");
  applyRichTextCommand(editor, ...Object.values(selectAllText(editor)), "bold");
  applyRichTextCommand(editor, ...Object.values(selectAllText(editor)), "foreColor", "red");
  applyRichTextCommand(editor, ...Object.values(selectAllText(editor)), "highlight");
  applyRichTextCommand(editor, ...Object.values(selectText(editor, "beta")), "highlight");

  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [
        {
          text: "Alpha ",
          marks: {
            bold: true,
            color: "red",
            highlight: true,
            backgroundColor: "rgb(255, 247, 220)",
          },
        },
        { text: "beta", marks: { bold: true, color: "red" } },
        {
          text: " gamma",
          marks: {
            bold: true,
            color: "red",
            highlight: true,
            backgroundColor: "rgb(255, 247, 220)",
          },
        },
      ],
    },
  ]);
});

test("preserves remaining marks when removing one formatter from a partial inline-text selection", () => {
  let editor = createRichTextEditor("Alpha beta gamma");
  applyInlineTextCommand(editor, ...Object.values(selectAllText(editor)), "bold");
  applyInlineTextCommand(editor, ...Object.values(selectAllText(editor)), "foreColor", "red");
  applyInlineTextCommand(editor, ...Object.values(selectText(editor, "beta")), "foreColor", "");

  expect(serializeTextChildren(editor)).toEqual([
    { text: "Alpha ", marks: { bold: true, color: "red" } },
    { text: "beta", marks: { bold: true } },
    { text: " gamma", marks: { bold: true, color: "red" } },
  ]);

  editor = createRichTextEditor("Alpha beta gamma");
  applyInlineTextCommand(editor, ...Object.values(selectAllText(editor)), "foreColor", "red");
  applyInlineTextCommand(editor, ...Object.values(selectAllText(editor)), "bold");
  applyInlineTextCommand(editor, ...Object.values(selectText(editor, "beta")), "bold");

  expect(serializeTextChildren(editor)).toEqual([
    { text: "Alpha ", marks: { color: "red", bold: true } },
    { text: "beta", marks: { color: "red" } },
    { text: " gamma", marks: { color: "red", bold: true } },
  ]);
});

test("keeps paragraph structure valid when font size crosses paragraph boundaries", () => {
  const editor = createRichTextEditor(
    '<p></p><p>ほくペイアプリが公開され、利用者の方がチャージし、店舗での利用が始まります。</p><p></p><span style="font-size: var(--font-size-lg);">「30％プレミアム付ほくペイ」申込開始</span><span style="font-size: var(--font-size-lg);">「ダウンロードキャンペーン」開始</span><span style="font-size: var(--font-size-base);"><span class="text-bold text-color" style="color: var(--brand-900);"><p><br></p><p> アプリをダウンロードしアカウント登録した人に先着でポイントをプレゼント。</p></span></span><p></p>',
  );
  const selected = selectTextRange(
    editor,
    "「30％プレミアム付ほくペイ」申込開始",
    "アカウント登録した人に先着でポイントをプレゼント。",
  );

  applyRichTextCommand(
    editor,
    selected.range,
    selected.selection,
    "fontSize",
    "var(--font-size-base)",
  );

  expectValidParagraphEditorDom(editor);
  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [
        {
          text: "ほくペイアプリが公開され、利用者の方がチャージし、店舗での利用が始まります。",
        },
      ],
    },
    {
      type: "paragraph",
      children: [],
    },
    {
      type: "paragraph",
      children: [
        {
          text: "「30％プレミアム付ほくペイ」申込開始「ダウンロードキャンペーン」開始",
          marks: { fontSize: "var(--font-size-base)" },
        },
      ],
    },
    {
      type: "paragraph",
      children: [],
    },
    {
      type: "paragraph",
      children: [
        {
          text: " アプリをダウンロードしアカウント登録した人に先着でポイントをプレゼント。",
          marks: {
            bold: true,
            color: "var(--brand-900)",
            fontSize: "var(--font-size-base)",
          },
        },
      ],
    },
  ]);
});

test("preserves empty rich-text paragraphs between content paragraphs during cleanup", () => {
  const editor = createRichTextEditor(
    "<p></p><p>First</p><p></p><p><br></p><p>Second</p><p></p>",
  );

  applyNoopCleanupCommand(editor, true);

  expectValidParagraphEditorDom(editor);
  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [{ text: "First" }],
    },
    {
      type: "paragraph",
      children: [],
    },
    {
      type: "paragraph",
      children: [],
    },
    {
      type: "paragraph",
      children: [{ text: "Second" }],
    },
  ]);
});

test("updates and removes color from a collapsed caret inside colored text", () => {
  const editor = createRichTextEditor(
    '<p><span class="text-color" style="color: red;">Text</span></p>',
  );
  let selected = selectCaret(editor, "Text", 2);

  applyRichTextCommand(editor, selected.range, selected.selection, "foreColor", "blue");
  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [{ text: "Text", marks: { color: "blue" } }],
    },
  ]);

  selected = selectCaret(editor, "Text", 2);
  applyRichTextCommand(editor, selected.range, selected.selection, "foreColor", "");
  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [{ text: "Text" }],
    },
  ]);
});

test("removes inline and highlight marks from a collapsed caret inside formatted text", () => {
  const editor = createRichTextEditor(
    '<p><span class="text-bold text-mark mark-primary" style="--mark-highlight-color: #fde68a;">Text</span></p>',
  );
  let selected = selectCaret(editor, "Text", 2);

  let result = applyRichTextCommand(editor, selected.range, selected.selection, "bold");
  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [
        {
          text: "Text",
          marks: { highlight: true, markStyle: "mark-primary", backgroundColor: "#fde68a" },
        },
      ],
    },
  ]);

  applyRichTextCommand(editor, result.range, selected.selection, "highlight");
  expect(serializeCleanTextChildren(editor)).toEqual([
    {
      type: "paragraph",
      children: [{ text: "Text" }],
    },
  ]);
});

test("applies block font size in inline-text mode without wrapping children", () => {
  const editor = createRichTextEditor("Inline title");
  const selected = selectAllText(editor);
  let changedFontSize = "";

  applySelectionCommand({
    command: "fontSize",
    value: "32px",
    editor,
    type: "h1",
    paragraphMode: false,
    range: selected.range,
    selection: selected.selection,
    onFontSizeChange: (fontSize) => {
      changedFontSize = fontSize;
    },
  });

  expect(editor.style.fontSize).toBe("32px");
  expect(changedFontSize).toBe("32px");
  expect(serializeTextChildren(editor)).toEqual([{ text: "Inline title" }]);
});

test("describes the selected rich-text format for toolbar state", () => {
  const editor = createRichTextEditor("<p>Describe format</p>");
  let selected = selectText(editor, "Describe");

  let result = applyRichTextCommand(editor, selected.range, selected.selection, "bold");
  result = applyRichTextCommand(editor, result.range, selected.selection, "fontSize", "21px");
  result = applyRichTextCommand(editor, result.range, selected.selection, "foreColor", "teal");
  result = applyRichTextCommand(editor, result.range, selected.selection, "highlight");
  result = applyRichTextCommand(
    editor,
    result.range,
    selected.selection,
    "backgroundColor",
    "#fef08a",
  );
  result = applyRichTextCommand(editor, result.range, selected.selection, "link", "/format");
  applyRichTextCommand(editor, result.range, selected.selection, "linkTarget", "_blank");
  selected = selectText(editor, "Describe");

  expect(
    describeSelectionFormat({
      editor,
      type: "p",
      paragraphMode: true,
      textAlign: "center",
      range: selected.range,
      selection: selected.selection,
    }),
  ).toMatchObject({
    align: "center",
    bold: true,
    fontSize: "21px",
    fontSizeApplied: true,
    color: "teal",
    colorApplied: true,
    highlight: true,
    backgroundColor: "#fef08a",
    link: "/format",
    target: "_blank",
    collapsed: false,
  });
});

test("returns default selection format when no range is available", () => {
  const editor = createRichTextEditor("<p>Default format</p>");
  editor.style.textAlign = "right";

  expect(
    describeSelectionFormat({
      editor,
      type: "p",
      paragraphMode: true,
      textAlign: "left",
      range: null,
      selection: null,
    }),
  ).toEqual({ align: "right", type: "p" });
});

function createEditorSelection(text) {
  const editor = createRichTextEditor("");
  const textNode = document.createTextNode(text);
  editor.append(textNode);

  const range = document.createRange();
  range.setStart(textNode, 0);
  range.setEnd(textNode, text.length);

  const selection = document.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  return { editor, range, selection };
}

function createRichTextEditor(html) {
  document.body.replaceChildren();

  const editor = document.createElement("div");
  editor.innerHTML = html;
  document.body.append(editor);
  return editor;
}

function applyRichTextCommand(editor, range, selection, command, value = null) {
  return applySelectionCommand({
    command,
    value,
    editor,
    type: "p",
    paragraphMode: true,
    range,
    selection,
  });
}

function applyInlineTextCommand(editor, range, selection, command, value = null) {
  return applySelectionCommand({
    command,
    value,
    editor,
    type: "h1",
    paragraphMode: false,
    range,
    selection,
    onFontSizeChange: () => {},
  });
}

function applyNoopCleanupCommand(editor, paragraphMode) {
  const selected = selectEditorEnd(editor);

  applySelectionCommand({
    command: "backgroundColor",
    value: "#ffffff",
    editor,
    type: paragraphMode ? "p" : "h1",
    paragraphMode,
    range: selected.range,
    selection: selected.selection,
  });
}

function selectEditorEnd(editor) {
  const textNodes = getTextNodes(editor);
  const endNode = textNodes.at(-1);

  return selectRange({
    startNode: endNode,
    startOffset: endNode.textContent.length,
    endNode,
    endOffset: endNode.textContent.length,
  });
}

function serializeCleanTextChildren(editor) {
  const children = serializeTextChildren(editor, { paragraphMode: true });

  expect(children).toEqual(removeEmptyJsonValues(children));
  return children;
}

function expectValidParagraphEditorDom(editor) {
  expect(editor.querySelectorAll("span p, span ul, span ol")).toHaveLength(0);
  expect(editor.querySelectorAll(":scope > span, :scope > a")).toHaveLength(0);
  expect(Array.from(editor.querySelectorAll("span")).filter(isEmptyInlineSpan)).toHaveLength(0);
  expect(editor.querySelectorAll("span:not([class]):not([style])")).toHaveLength(0);
}

function isEmptyInlineSpan(element) {
  const hasText = element.textContent.length > 0;
  const hasRenderedElement = element.querySelector(
    "audio, br, canvas, embed, hr, iframe, img, input, object, select, svg, textarea, video",
  );

  return !hasText && !hasRenderedElement;
}

function removeEmptyJsonValues(value) {
  if (Array.isArray(value)) {
    return value
      .map(removeEmptyJsonValues)
      .filter((item) => !(typeof item?.text === "string" && item.text === ""));
  }

  if (!value || typeof value !== "object") return value;

  const result = {};
  for (const [key, item] of Object.entries(value)) {
    const cleanItem = removeEmptyJsonValues(item);
    const isEmptyObject =
      cleanItem && typeof cleanItem === "object" && !Array.isArray(cleanItem)
        ? Object.keys(cleanItem).length === 0
        : false;

    if (
      cleanItem === "" ||
      cleanItem === false ||
      cleanItem == null ||
      (key === "marks" && isEmptyObject)
    ) {
      continue;
    }

    result[key] = cleanItem;
  }

  return result;
}

function selectText(editor, text) {
  return selectTextRange(editor, text, text);
}

function selectCaret(editor, text, offset = 0) {
  const { node } = findTextNode(editor, text);

  return selectRange({
    startNode: node,
    startOffset: node.textContent.indexOf(text) + offset,
    endNode: node,
    endOffset: node.textContent.indexOf(text) + offset,
  });
}

function selectTextRange(editor, startText, endText) {
  const start = findTextNode(editor, startText);
  const end = findTextNode(editor, endText, { from: start.node });

  return selectRange({
    startNode: start.node,
    startOffset: start.node.textContent.indexOf(startText),
    endNode: end.node,
    endOffset: end.node.textContent.indexOf(endText) + endText.length,
  });
}

function selectAllText(editor) {
  const textNodes = getTextNodes(editor);
  const startNode = textNodes[0];
  const endNode = textNodes.at(-1);

  return selectRange({
    startNode,
    startOffset: 0,
    endNode,
    endOffset: endNode.textContent.length,
  });
}

function selectRange({ startNode, startOffset, endNode, endOffset }) {
  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);

  const selection = document.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  return { range, selection };
}

function findTextNode(root, text, { from = null } = {}) {
  const nodes = getTextNodes(root);
  const startIndex = from ? nodes.indexOf(from) : 0;

  for (const node of nodes.slice(Math.max(startIndex, 0))) {
    if (node.textContent.includes(text)) return { node };
  }

  throw new Error(`Text node not found for "${text}"`);
}

function getTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let node;

  while ((node = walker.nextNode())) nodes.push(node);
  return nodes;
}
