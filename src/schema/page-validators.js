import { INLINE_TEXT_ELEMENT_TYPES, PAGE_BLOCK_TYPES, isRichTextType } from "./page.schema.js";
import { isBlockTypeRegistered } from "../registries/block-registry.js";

export function assertValidPage(page) {
  const errors = validatePage(page);
  if (errors.length) {
    throw new TypeError(`Invalid page data:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  }

  return page;
}

export function validatePage(page) {
  const errors = [];

  if (!isObject(page)) {
    return ["page must be an object"];
  }

  if (page.version !== 1) errors.push("page.version must be 1");
  if (!Array.isArray(page.groups)) errors.push("page.groups must be an array");

  if (Array.isArray(page.groups)) {
    page.groups.forEach((group, index) => validateGroup(group, `groups[${index}]`, errors));
  }

  return errors;
}

function validateGroup(group, path, errors) {
  if (!isObject(group)) {
    errors.push(`${path} must be an object`);
    return;
  }

  requireString(group.id, `${path}.id`, errors);
  requireString(group.type, `${path}.type`, errors);
  if (group.hashId != null && typeof group.hashId !== "string") {
    errors.push(`${path}.hashId must be a string`);
  }
  requireNumber(group.sort, `${path}.sort`, errors);

  if (!isObject(group.style)) errors.push(`${path}.style must be an object`);
  if (!Array.isArray(group.blocks)) {
    errors.push(`${path}.blocks must be an array`);
    return;
  }

  group.blocks.forEach((block, index) => validateBlock(block, `${path}.blocks[${index}]`, errors));
}

function validateBlock(block, path, errors) {
  if (!isObject(block)) {
    errors.push(`${path} must be an object`);
    return;
  }

  requireString(block.id, `${path}.id`, errors);
  requireString(block.type, `${path}.type`, errors);
  if (
    typeof block.type === "string" &&
    !PAGE_BLOCK_TYPES.has(block.type) &&
    !isBlockTypeRegistered(block.type)
  ) {
    errors.push(`${path}.type is not registered: ${block.type}`);
  }

  if (block.type === "inline-text" && !INLINE_TEXT_ELEMENT_TYPES.has(block.elementType)) {
    errors.push(`${path}.elementType must be p, h1, h2, or h3`);
  }
  if (isRichTextType(block.type) && !Array.isArray(block.children)) {
    errors.push(`${path}.children must be an array`);
  }
  if (block.type === "navs") validateNavsBlock(block, path, errors);
}

function validateNavsBlock(block, path, errors) {
  if (!Array.isArray(block.children)) {
    errors.push(`${path}.children must be an array`);
    return;
  }

  block.children.forEach((child, index) => {
    const childPath = `${path}.children[${index}]`;
    validateBlock(child, childPath, errors);
    requireNumber(child.sort, `${childPath}.sort`, errors);
  });
}

function requireString(value, path, errors) {
  if (typeof value !== "string" || !value) errors.push(`${path} must be a non-empty string`);
}

function requireNumber(value, path, errors) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    errors.push(`${path} must be a finite number`);
  }
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
