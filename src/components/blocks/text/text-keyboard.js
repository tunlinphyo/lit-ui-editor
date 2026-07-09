// Keyboard actions shared by paragraph-rich and inline text blocks.
export const ENTER_ACTIONS = Object.freeze({
  lineBreak: "lineBreak",
  paragraph: "paragraph",
  unsupported: "unsupported",
});

export function getEnterAction({ inlineText = false, shiftKey = false } = {}) {
  if (inlineText) {
    return shiftKey ? ENTER_ACTIONS.unsupported : ENTER_ACTIONS.lineBreak;
  }

  return ENTER_ACTIONS.paragraph;
}
