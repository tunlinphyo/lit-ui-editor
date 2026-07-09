import { parseFeatures } from "../../../registries/formatter-registry.js";

export function resolveSupportedFeatures(configuredFeatures, supportedFeatures) {
  const configured = parseFeatures(configuredFeatures);
  if (configured == null) return [...supportedFeatures];

  const supported = new Set(supportedFeatures);
  return configured.filter((feature) => supported.has(feature));
}
