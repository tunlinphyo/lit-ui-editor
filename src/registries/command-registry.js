import { FEATURES } from "./formatter-registry.js";

const commandDefinitions = new Map();

export function registerCommand(definition) {
  if (!definition?.command) throw new TypeError("Command definition requires a command");
  commandDefinitions.set(definition.command, Object.freeze({ ...definition }));
}

export function getCommandDefinition(command) {
  return commandDefinitions.get(command) ?? null;
}

export function getCommandFeature(detail = {}) {
  if (detail.command?.match(/^align(Left|Center|Right|Justify)$/)) return FEATURES.align;
  if (detail.command === "blockStyle") return getBlockStyleFeature(detail.property);
  return getCommandDefinition(detail.command)?.feature ?? null;
}

export function listCommandDefinitions() {
  return [...commandDefinitions.values()];
}

function getBlockStyleFeature(property) {
  if (property === "backgroundColor") return FEATURES.backgroundColor;
  if (["borderWidth", "borderColor", "borderStyle", "borderPosition"].includes(property)) {
    return FEATURES.border;
  }
  return getCommandDefinition("blockStyle")?.feature ?? null;
}
