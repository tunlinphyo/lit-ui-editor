import { CONTENT_BLOCK_SELECTOR, getPageGroupSelector } from "./editor-selectors.js";
import { CURRENT_PAGE_VERSION, normalizePageGroups } from "../schema/page-normalize.js";

export function deserializeEditor(editor, pageData = {}) {
  const groupsData = normalizePageGroups(pageData);
  const groupOrder = editor.renderRoot.querySelector("group-order");

  groupOrder?.init(groupsData);
  removeGroupsOutsideSnapshot(groupOrder, groupsData);

  const groupsById = new Map(
    getPageGroups(editor).map((group) => [group.getAttribute("group-id"), group]),
  );
  const blocksById = new Map(getContentBlocks(editor).map((block) => [block.blockId, block]));

  for (const data of groupsData) {
    if (Array.isArray(data.blocks)) {
      groupsById.get(data.id)?.init(data);
    } else {
      blocksById.get(data.id)?.init(data);
    }
  }

  return editor;
}

export function serializeEditor(editor) {
  return removeEmptyValues({
    version: CURRENT_PAGE_VERSION,
    groups: getPageGroups(editor).map((group) => group.toJSON()),
  });
}

function removeEmptyValues(value) {
  if (Array.isArray(value)) {
    return value.map(removeEmptyValues).filter(hasValue);
  }
  if (!value || typeof value !== "object") return value;

  const entries = Object.entries(value)
    .map(([key, child]) => [key, removeEmptyValues(child)])
    .filter(([key, child]) => hasValue(child, key));

  return Object.fromEntries(entries);
}

function hasValue(value, key) {
  if (key === "value" && value === "") return true;
  if (value === "" || value === null || value === undefined) return false;
  return !isEmptyPlainObject(value);
}

function isEmptyPlainObject(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype &&
    Object.keys(value).length === 0
  );
}

function getContentBlocks(editor) {
  const ungroupedBlocks = [...editor.renderRoot.querySelectorAll(CONTENT_BLOCK_SELECTOR)];
  const groupedBlocks = getPageGroups(editor).flatMap((group) => group.blocks);

  return [...ungroupedBlocks, ...groupedBlocks];
}

function getPageGroups(editor) {
  const groupOrder = editor.renderRoot.querySelector("group-order");
  if (!groupOrder) return [];

  const selector = getPageGroupSelector();
  if (!selector) return [];

  return [...groupOrder.children].filter((group) => group.matches(selector));
}

function removeGroupsOutsideSnapshot(groupOrder, groupsData) {
  if (!groupOrder) return;

  const snapshotIds = new Set(groupsData.map((group) => group.id));
  for (const group of groupOrder.querySelectorAll(":scope > [group-id]")) {
    if (!snapshotIds.has(group.getAttribute("group-id"))) group.remove();
  }
}
