import { expect, test } from "vite-plus/test";
import { deserializeTextChildren, serializeHtml, serializeTextChildren } from "./text-utils.js";

test("removes empty list-adjacent and trailing editor paragraphs", () => {
  const value = "<p>First</p><p></p><ol><li>One</li><li>Two</li></ol><p>Last</p><p></p>";

  expect(serializeHtml(value)).toBe("<p>First</p><ol><li>One</li><li>Two</li></ol><p>Last</p>");
});

test("removes empty paragraphs immediately after lists", () => {
  const value = "<ul><li>One</li></ul><p></p><p>Next</p>";

  expect(serializeHtml(value)).toBe("<ul><li>One</li></ul><p>Next</p>");
});

test("preserves intentional blank lines", () => {
  const value = "<p>First</p><p><br></p><p>Second</p><p></p><p>Third</p>";

  expect(serializeHtml(value)).toBe(value);
});

test("removes trailing breaks from the final paragraph", () => {
  const value = "<p>First</p><p>Second<br></p>";

  expect(serializeHtml(value)).toBe("<p>First</p><p>Second</p>");
});

test("serializes inline text marks after a line break as separate children", () => {
  globalThis.Node ??= {
    TEXT_NODE: 3,
    ELEMENT_NODE: 1,
  };

  const editor = {
    childNodes: [
      { nodeType: Node.TEXT_NODE, textContent: "Hello\n" },
      {
        nodeType: Node.ELEMENT_NODE,
        localName: "span",
        classList: {
          contains: (className) => className === "text-color",
        },
        style: {
          color: "var(--brand-600)",
          getPropertyValue: () => "",
        },
        childNodes: [{ nodeType: Node.TEXT_NODE, textContent: "World" }],
      },
    ],
  };

  expect(serializeTextChildren(editor)).toEqual([
    { text: "Hello" },
    {
      text: "\n",
      marks: {
        br: true,
      },
    },
    {
      text: "World",
      marks: {
        color: "var(--brand-600)",
      },
    },
  ]);
});

test("ignores editor padding breaks in inline text serialization", () => {
  globalThis.Node ??= {
    TEXT_NODE: 3,
    ELEMENT_NODE: 1,
  };
  const editor = elementNode("h1", [
    textNode("Hello"),
    elementNode("br"),
    elementNode("br", [], { attributes: { "data-editor-padding-break": "" } }),
  ]);

  expect(serializeTextChildren(editor)).toEqual([{ text: "Hello" }]);
});

test("deserializes inline text line break marks", () => {
  const value = withFakeDocument(() =>
    deserializeTextChildren([
      { text: "Hello" },
      { text: "\n", marks: { br: true } },
      { text: "World" },
    ]),
  );

  expect(value).toBe("Hello<br>World");
});

test("serializes rich-text lists as list children without empty list-adjacent paragraphs", () => {
  globalThis.Node ??= {
    TEXT_NODE: 3,
    ELEMENT_NODE: 1,
  };

  const editor = elementNode("div", [
    elementNode("p", [textNode("Intro")]),
    elementNode("ul", [
      elementNode("li", [textNode("One")]),
      elementNode("li", [elementNode("span", [textNode("Two")], { classes: ["text-bold"] })]),
    ]),
    elementNode("p"),
    elementNode("p", [textNode("Next")]),
    elementNode("p"),
  ]);

  expect(serializeTextChildren(editor, { paragraphMode: true })).toEqual([
    {
      type: "paragraph",
      children: [{ text: "Intro" }],
    },
    {
      type: "unordered-list",
      children: [
        {
          type: "list-item",
          children: [{ text: "One" }],
        },
        {
          type: "list-item",
          children: [{ text: "Two", marks: { bold: true } }],
        },
      ],
    },
    {
      type: "paragraph",
      children: [{ text: "Next" }],
    },
  ]);
});

test("removes leading empty rich-text paragraphs", () => {
  globalThis.Node ??= {
    TEXT_NODE: 3,
    ELEMENT_NODE: 1,
  };

  const editor = elementNode("div", [
    elementNode("p"),
    elementNode("p", [textNode("Hello")]),
    elementNode("p"),
  ]);

  expect(serializeTextChildren(editor, { paragraphMode: true })).toEqual([
    {
      type: "paragraph",
      children: [{ text: "Hello" }],
    },
  ]);
});

test("serializes rich-text font size marks", () => {
  globalThis.Node ??= {
    TEXT_NODE: 3,
    ELEMENT_NODE: 1,
  };

  const editor = elementNode("div", [
    elementNode("p", [elementNode("span", [textNode("Large")], { style: { fontSize: "24px" } })]),
  ]);

  expect(serializeTextChildren(editor, { paragraphMode: true })).toEqual([
    {
      type: "paragraph",
      children: [{ text: "Large", marks: { fontSize: "24px" } }],
    },
  ]);
});

test("deserializes rich-text list children", () => {
  const value = withFakeDocument(() =>
    deserializeTextChildren(
      [
        {
          type: "paragraph",
          children: [{ text: "Intro" }],
        },
        {
          type: "ordered-list",
          children: [
            {
              type: "list-item",
              children: [{ text: "One" }],
            },
            {
              type: "list-item",
              children: [{ text: "Two" }],
            },
          ],
        },
      ],
      { paragraphMode: true },
    ),
  );

  expect(value).toBe("<p>Intro</p><ol><li>One</li><li>Two</li></ol>");
});

test("deserializes rich-text font size marks", () => {
  const value = withFakeDocument(() =>
    deserializeTextChildren(
      [
        {
          type: "paragraph",
          children: [{ text: "Large", marks: { fontSize: "24px" } }],
        },
      ],
      { paragraphMode: true },
    ),
  );

  expect(value).toBe('<p><span style="font-size: 24px;">Large</span></p>');
});

function textNode(text) {
  return { nodeType: Node.TEXT_NODE, textContent: text };
}

function elementNode(localName, childNodes = [], options = {}) {
  return {
    nodeType: Node.ELEMENT_NODE,
    localName,
    tagName: localName.toUpperCase(),
    nodeName: localName.toUpperCase(),
    childNodes,
    children: childNodes.filter((child) => child.nodeType === Node.ELEMENT_NODE),
    classList: {
      contains: (className) => options.classes?.includes(className) ?? false,
    },
    style: {
      color: options.style?.color ?? "",
      fontSize: options.style?.fontSize ?? "",
      getPropertyValue: (name) => options.style?.[name] ?? "",
    },
    getAttribute: (name) => options.attributes?.[name] ?? null,
  };
}

function withFakeDocument(callback) {
  const originalDocument = globalThis.document;
  const originalNode = globalThis.Node;

  globalThis.Node ??= {
    TEXT_NODE: 3,
    ELEMENT_NODE: 1,
  };
  globalThis.document = createFakeDocument();

  try {
    return callback();
  } finally {
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;

    if (originalNode === undefined) delete globalThis.Node;
    else globalThis.Node = originalNode;
  }
}

function createFakeDocument() {
  return {
    createDocumentFragment: () => new FakeFragment(),
    createElement: (tagName) => new FakeElement(tagName),
    createTextNode: (text) => new FakeText(text),
  };
}

class FakeFragment {
  constructor() {
    this.childNodes = [];
    this.isFragment = true;
  }

  append(...nodes) {
    this.childNodes.push(...nodes);
  }
}

class FakeText {
  constructor(text) {
    this.text = text;
  }

  get html() {
    return escapeHtml(this.text);
  }
}

class FakeRawHtml {
  constructor(html) {
    this.html = html;
  }
}

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toLowerCase();
    this.childNodes = [];
    this.attributeMap = new Map();
    const styleMap = new Map();
    const setStyle = (name, value) => {
      if (value) styleMap.set(name, value);
      else styleMap.delete(name);

      const styleValue = Array.from(
        styleMap,
        ([styleName, styleValue]) => `${styleName}: ${styleValue};`,
      ).join(" ");
      if (styleValue) this.attributeMap.set("style", styleValue);
      else this.attributeMap.delete("style");
    };
    this.classList = {
      add: (className) => {
        const current = this.attributeMap.get("class");
        this.attributeMap.set("class", current ? `${current} ${className}` : className);
      },
    };
    this.style = {
      get color() {
        return styleMap.get("color") ?? "";
      },
      set color(value) {
        setStyle("color", value);
      },
      get fontSize() {
        return styleMap.get("font-size") ?? "";
      },
      set fontSize(value) {
        setStyle("font-size", value);
      },
      getPropertyValue: (name) => styleMap.get(name) ?? "",
      setProperty: setStyle,
    };
  }

  get attributes() {
    return { length: this.attributeMap.size };
  }

  set innerHTML(html) {
    this.childNodes = [new FakeRawHtml(html)];
  }

  get innerHTML() {
    return this.childNodes.map((child) => child.html).join("");
  }

  append(...nodes) {
    for (const node of nodes) {
      if (node?.isFragment) this.childNodes.push(...node.childNodes);
      else this.childNodes.push(node);
    }
  }

  setAttribute(name, value) {
    this.attributeMap.set(name, value);
  }

  get html() {
    if (this.tagName === "br") return "<br>";

    const attributes = Array.from(this.attributeMap, ([name, value]) => ` ${name}="${value}"`).join(
      "",
    );
    return `<${this.tagName}${attributes}>${this.innerHTML}</${this.tagName}>`;
  }
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
