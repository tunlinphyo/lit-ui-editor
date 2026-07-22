import { html } from "lit";
import { resolveConfigOptions } from "../../../registries/config-registry.js";
import { PopoverControl } from "./popover-control.js";
import { pickerPopoverControlStyles } from "./picker-popover-control.styles.js";

export class PickerPopoverControl extends PopoverControl {
  static properties = {
    value: { type: String, reflect: true },
  };

  static options = [];
  static command = "";
  static popoverId = "picker-options";
  static title = "Options";
  static fallbackLabel = "Select";
  static reapplySelectedValue = false;
  static styles = pickerPopoverControlStyles;

  constructor() {
    super();
    this.value = "";
  }

  get options() {
    return resolveConfigOptions(this.constructor.configKey, this.constructor.options);
  }

  get selectedOption() {
    return this.options.find((option) => option.value === this.value);
  }

  render() {
    const { popoverId, title } = this.constructor;

    return html`
      <button
        class="trigger"
        type="button"
        title=${title}
        aria-label=${title}
        popovertarget=${popoverId}
        ?disabled=${this.disabled}
        @mousedown=${this.preserveSelection}
      >
        ${this.renderTriggerLabel(this.selectedOption)}
      </button>
      <div id=${popoverId} popover @toggle=${this.handlePopoverToggle}>
        <div class="options">
          ${this.options.map(
            (option) => html`
              <button
                type="button"
                data-value=${option.value}
                aria-pressed=${this.value === option.value}
                style=${option.style ?? ""}
                @mousedown=${this.preserveSelection}
                @click=${this.handleOptionClick}
              >
                ${this.renderOptionLabel(option)}
              </button>
            `,
          )}
        </div>
      </div>
    `;
  }

  renderTriggerLabel(option) {
    return option?.label ?? this.constructor.fallbackLabel;
  }

  renderOptionLabel(option) {
    return option.label;
  }

  onPopoverClosed() {
    this.restoreSelection();
  }

  handleOptionClick = (event) => {
    this.applyValue(event.currentTarget.dataset.value);
  };

  applyValue(value) {
    this.closePopover();

    if (value === this.value && !this.constructor.reapplySelectedValue) return;

    this.value = value;
    this.dispatchValueChange(value);
  }

  dispatchValueChange(value) {
    this.dispatchEvent(
      new CustomEvent("format-command", {
        detail: { command: this.constructor.command, value },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
