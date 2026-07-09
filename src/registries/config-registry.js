import { defaultConfigOptions } from "../default/configs/index.js";

const configOptions = new Map();

export function registerConfig(config) {
  for (const [key, options] of Object.entries(config)) {
    configOptions.set(key, options);
  }
}

export function resolveConfigOptions(key, fallback = []) {
  return configOptions.get(key) ?? defaultConfigOptions[key] ?? fallback;
}
