const blockDefinitions = new Map();

export function registerBlock(definition) {
  if (!definition?.type) throw new TypeError("Block definition requires a type");
  blockDefinitions.set(definition.type, Object.freeze({ ...definition }));
}

export function getBlockDefinition(type) {
  return blockDefinitions.get(type) ?? null;
}

export function isBlockTypeRegistered(type) {
  return [...blockDefinitions.values()].some(
    (definition) => definition.type === type || definition.schemaTypes?.includes(type),
  );
}

export function listBlockDefinitions() {
  return [...blockDefinitions.values()];
}

export function getBlockSelector({
  textOnly = false,
  nonTextOnly = false,
  formattableOnly = false,
} = {}) {
  return listBlockDefinitions()
    .filter((definition) => {
      if (textOnly && definition.text !== true) return false;
      if (nonTextOnly && definition.text === true) return false;
      if (formattableOnly && definition.formattable === false) return false;
      return true;
    })
    .map((definition) => definition.selector)
    .join(", ");
}
