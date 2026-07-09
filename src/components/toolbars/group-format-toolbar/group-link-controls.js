import { html } from "lit";
import {
  materialSymbolStyles,
  renderMaterialIcon,
} from "../../icon-picker/material-icon-picker.js";
import { FormatToggle } from "../controls/format-toggle.js";
import { formatLinkStyles } from "../controls/format-link.styles.js";
import { LinkPopoverControl } from "../controls/link-popover-control.js";
import { LinkTargetPickerControl } from "../controls/link-target-picker-control.js";

class GroupLink extends LinkPopoverControl {
  static styles = [formatLinkStyles, materialSymbolStyles];
  static subject = "group";

  dispatchValue(value) {
    this.dispatchEvent(
      new CustomEvent("group-format-command", {
        detail: { command: "groupLink", value },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

class GroupLinkTarget extends LinkTargetPickerControl {
  dispatchValueChange(value) {
    this.dispatchEvent(
      new CustomEvent("group-format-command", {
        detail: { command: "groupLinkTarget", value },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

class GroupDisabled extends FormatToggle {
  command = "groupDisabled";

  apply() {
    this.dispatchEvent(
      new CustomEvent("group-format-command", {
        detail: { command: this.command },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`<button
      type="button"
      title=${this.applied ? "Enable group" : "Disable group"}
      aria-label=${this.applied ? "Enable group" : "Disable group"}
      ?disabled=${this.disabled}
      @click=${() => this.apply()}
    >
      ${renderMaterialIcon("block")}
    </button>`;
  }
}

customElements.define("group-link", GroupLink);
customElements.define("group-link-target", GroupLinkTarget);
customElements.define("group-disabled", GroupDisabled);
