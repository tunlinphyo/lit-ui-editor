export const FEATURES = {
  type: "type",
  fontFamily: "fontFamily",
  fontSize: "fontSize",
  color: "color",
  backgroundColor: "backgroundColor",
  bold: "bold",
  italic: "italic",
  underline: "underline",
  orderedList: "orderedList",
  unorderedList: "unorderedList",
  align: "align",
  link: "link",
  linkTarget: "linkTarget",
  icon: "icon",
  imageUpload: "imageUpload",
  objectFit: "objectFit",
  border: "border",
  borderRadius: "borderRadius",
  disabled: "disabled",
  tableHeaders: "tableHeaders",
};

const DEFAULT_FEATURES = {
  text: [
    FEATURES.type,
    FEATURES.fontFamily,
    FEATURES.fontSize,
    FEATURES.color,
    FEATURES.bold,
    FEATURES.italic,
    FEATURES.underline,
    FEATURES.orderedList,
    FEATURES.unorderedList,
    FEATURES.align,
    FEATURES.backgroundColor,
    FEATURES.link,
    FEATURES.linkTarget,
  ],
  button: [
    FEATURES.align,
    FEATURES.icon,
    FEATURES.color,
    FEATURES.backgroundColor,
    FEATURES.border,
    FEATURES.borderRadius,
    FEATURES.link,
    FEATURES.linkTarget,
    FEATURES.disabled,
  ],
  image: [
    FEATURES.align,
    FEATURES.imageUpload,
    FEATURES.objectFit,
    FEATURES.backgroundColor,
    FEATURES.border,
    FEATURES.borderRadius,
    FEATURES.link,
    FEATURES.linkTarget,
    FEATURES.disabled,
  ],
  icon: [
    FEATURES.fontSize,
    FEATURES.color,
    FEATURES.backgroundColor,
    FEATURES.border,
    FEATURES.borderRadius,
    FEATURES.link,
    FEATURES.linkTarget,
    FEATURES.disabled,
  ],
  table: [FEATURES.tableHeaders, FEATURES.backgroundColor, FEATURES.border],
};

export function getCapabilities(type, features) {
  const featureList = parseFeatures(features) ?? DEFAULT_FEATURES[type] ?? [];
  const capabilities = {};

  for (const feature of Object.values(FEATURES)) capabilities[feature] = false;
  for (const feature of featureList) capabilities[feature] = true;

  return capabilities;
}

export function parseFeatures(features) {
  if (Array.isArray(features)) return features;
  if (typeof features !== "string") return null;
  if (!features.trim()) return [];

  return features
    .split(",")
    .map((feature) => feature.trim())
    .filter(Boolean);
}

export function toFeatureAttribute(features) {
  return Array.isArray(features) ? features.join(",") : (features ?? "");
}

export function featureData(features) {
  const value = toFeatureAttribute(features);
  return value ? { features: value } : {};
}

export function isFeatureEnabled(format, feature) {
  return format?.capabilities?.[feature] !== false;
}
