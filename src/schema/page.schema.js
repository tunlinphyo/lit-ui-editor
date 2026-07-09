export const PAGE_SCHEMA = {
  version: 1,
  root: {
    version: "number",
    groups: "array",
  },
  group: {
    id: "string",
    type: "string",
    sort: "number",
    style: "object",
    blocks: "array",
  },
  groupStyle: {
    backgroundColor: "string",
    borderWidth: "string",
    borderColor: "string",
    borderStyle: "string",
    borderPosition: "string",
    borderRadius: "string",
  },
  navsBlock: {
    id: "string",
    type: "navs",
    children: "array",
  },
};

export const PAGE_BLOCK_TYPES = new Set([
  "button",
  "icon",
  "image",
  "navs",
  "news",
  "partner-navs",
  "table",
  "inline-text",
  "p",
  "h1",
  "h2",
  "h3",
]);

export const INLINE_TEXT_ELEMENT_TYPES = new Set(["p", "h1", "h2", "h3"]);

export function isRichTextType(type) {
  return ["inline-text", "p", "h1", "h2", "h3"].includes(type);
}
