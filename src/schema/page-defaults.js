export const DEFAULT_GROUP_STYLE = {
  backgroundColor: "",
  borderWidth: "",
  borderColor: "",
  borderStyle: "",
  borderPosition: "",
  borderRadius: "",
};

export const DEFAULT_PAGE = {
  version: 1,
  groups: [],
};

export function createDefaultGroupStyle(style = {}) {
  return {
    ...DEFAULT_GROUP_STYLE,
    ...style,
  };
}

export function createDefaultPage(page = {}) {
  return {
    ...DEFAULT_PAGE,
    ...page,
    groups: Array.isArray(page.groups) ? page.groups : DEFAULT_PAGE.groups,
  };
}
