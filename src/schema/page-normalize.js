import { DEFAULT_PAGE, createDefaultGroupStyle, createDefaultPage } from "./page-defaults.js";
import { assertValidPage } from "./page-validators.js";

export const CURRENT_PAGE_VERSION = 1;

export function normalizePage(input = DEFAULT_PAGE) {
  assertValidPage(createValidationPage(input));
  const page = createDefaultPage(input);

  return {
    version: page.version,
    groups: page.groups.map(normalizeGroup).sort(bySort),
  };
}

export function normalizePageGroups(input = DEFAULT_PAGE) {
  return normalizePage(input).groups;
}

function normalizeGroup(group = {}) {
  const blocks = Array.isArray(group.blocks) ? group.blocks : [];

  return {
    ...group,
    hashId: group.hashId ?? "",
    sort: group.sort ?? 0,
    style: createDefaultGroupStyle(group.style),
    blocks: blocks.map(normalizeBlock),
  };
}

function createValidationPage(input) {
  if (!isObject(input) || !Array.isArray(input.groups)) return input;

  return {
    ...input,
    groups: input.groups.map(createValidationGroup),
  };
}

function createValidationGroup(group) {
  if (!isObject(group)) return group;

  return {
    ...group,
    hashId: group.hashId ?? "",
    sort: group.sort ?? 0,
    style: Object.hasOwn(group, "style") ? group.style : createDefaultGroupStyle(),
  };
}

function normalizeBlock(block = {}) {
  if (block.type !== "navs") return block;
  return normalizeNavsBlock(block);
}

function normalizeNavsBlock(block) {
  return {
    ...block,
    id: "navs",
    type: "navs",
    children: normalizeNavChildren(block.children),
  };
}

function normalizeNavChildren(children = []) {
  if (!Array.isArray(children)) return [];

  return [...children].sort(bySort).map((child, sort) => ({
    ...child,
    sort,
  }));
}

function bySort(a = {}, b = {}) {
  return (a.sort ?? 0) - (b.sort ?? 0);
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
