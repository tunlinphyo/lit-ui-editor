const groupDefinitions = new Map();

export function registerGroup(definition) {
  if (!definition?.type) throw new TypeError("Group definition requires a type");
  groupDefinitions.set(definition.type, Object.freeze({ ...definition }));
}

export function getGroupDefinition(type) {
  return groupDefinitions.get(type) ?? null;
}

export function listGroupDefinitions() {
  return [...groupDefinitions.values()];
}

export function getGroupSelector() {
  return listGroupDefinitions()
    .map((definition) => definition.selector)
    .join(", ");
}
