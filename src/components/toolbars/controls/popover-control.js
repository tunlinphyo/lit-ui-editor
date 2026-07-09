import { LitElement } from "lit";

export class PopoverControl extends LitElement {
  static properties = {
    disabled: { type: Boolean },
  };

  constructor() {
    super();
    this.disabled = true;
  }

  get popover() {
    return this.renderRoot.querySelector("[popover]");
  }

  updated(changedProperties) {
    if (changedProperties.has("disabled") && this.disabled) this.closePopover();
  }

  closePopover({ defer = false } = {}) {
    const close = () => {
      if (this.popover?.matches(":popover-open")) this.popover.hidePopover();
    };

    if (defer) queueMicrotask(close);
    else close();
  }

  preserveSelection = (event) => {
    event.preventDefault();
  };

  handlePopoverToggle = (event) => {
    if (event.newState === "closed") this.onPopoverClosed();
  };

  onPopoverClosed() {}

  restoreSelection() {
    this.dispatchEvent(
      new CustomEvent("restore-selection", {
        bubbles: true,
        composed: true,
      }),
    );
  }
}
