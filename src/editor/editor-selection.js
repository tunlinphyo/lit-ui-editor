import {
  CONTENT_BLOCK_SELECTOR,
  TEXT_BLOCK_SELECTOR,
  getBlockGroupSelector,
  getPageGroupSelector,
} from "./editor-selectors.js";

export function findSelectionTargets(event) {
  const path = event.composedPath();

  return {
    group: findInPath(path, getPageGroupSelector()),
    blockGroup: findInPath(path, getBlockGroupSelector()),
    textBlock: findInPath(path, TEXT_BLOCK_SELECTOR),
    contentBlock: findInPath(path, CONTENT_BLOCK_SELECTOR),
  };
}

export function findInPath(path, selector) {
  if (!selector) return null;
  return path.find((element) => element.matches?.(selector)) ?? null;
}

export function isComposedDescendant(ancestor, node) {
  let current = node;

  while (current) {
    if (current === ancestor) return true;

    const parent = current.parentNode;
    if (parent) {
      current = parent;
      continue;
    }

    const root = current.getRootNode?.();
    current = root?.host ?? null;
  }

  return false;
}
