const listDefinitions = new Map();

export function registerList(definition) {
  if (!definition?.type) throw new TypeError("List definition requires a type");
  listDefinitions.set(definition.type, Object.freeze({ ...definition }));
}

export function getListDefinition(type) {
  return listDefinitions.get(type) ?? null;
}

export function listListDefinitions() {
  return [...listDefinitions.values()];
}

export function getListSelector() {
  return listListDefinitions()
    .map((definition) => definition.selector)
    .join(", ");
}
