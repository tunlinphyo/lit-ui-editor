import { LitElement, html } from "lit";
import {
  getMaterialIconNames,
  materialSymbolStyles,
  renderMaterialIcon,
} from "../../icon-picker/material-icon-picker.js";
import { iconPickerPopoverStyles } from "./icon-picker-popover.styles.js";

export class IconPickerPopover extends LitElement {
  static properties = {
    value: { type: String },
    href: { type: String },
    target: { type: String },
    controlStyle: { type: String, attribute: "control-style" },
    disabled: { type: Boolean, reflect: true },
    inputValue: { state: true },
  };

  static styles = [materialSymbolStyles, iconPickerPopoverStyles];

  constructor() {
    super();
    this.value = "";
    this.href = "";
    this.target = "_self";
    this.controlStyle = "";
    this.disabled = false;
    this.inputValue = "";
  }

  render() {
    const iconName = normalizeIconName(this.inputValue);
    const hasInput = Boolean(iconName);
    const isConfigured = isConfiguredMaterialIconName(iconName);
    const isValid = hasInput && isValidGoogleIconName(iconName);

    return html`
      <a
        class="input"
        href=${this.href || ""}
        target=${this.href ? this.target : "_self"}
        title="Choose icon"
        aria-label="Choose icon"
        ?data-empty=${!this.value}
        part="container"
        style=${this.controlStyle}
        @click=${this.#open}
      >
        ${renderMaterialIcon(this.value)}
      </a>
      <div id="icon-picker" popover>
        <form class="icon-name-form" @submit=${this.#submitIconName}>
          <input
            type="text"
            name="iconName"
            autocomplete="off"
            spellcheck="false"
            placeholder="icon name"
            aria-label="Material icon name"
            aria-describedby="icon-name-feedback"
            aria-invalid=${hasInput && !isValid ? "true" : "false"}
            .value=${this.inputValue}
            @input=${this.#inputIconName}
          />
          <button type="submit" ?disabled=${!isValid}>Apply</button>
          <p
            id="icon-name-feedback"
            class=${isValid ? "feedback valid" : "feedback invalid"}
            role="status"
            aria-live="polite"
          >
            ${renderIconNameFeedback(hasInput, isValid, isConfigured)}
          </p>
        </form>
        <material-icon-picker
          .value=${this.value}
          @icon-select=${this.#select}
        ></material-icon-picker>
      </div>
    `;
  }

  close() {
    this.renderRoot.querySelector("[popover]")?.hidePopover();
  }

  updated(changedProperties) {
    if (changedProperties.has("value")) this.inputValue = this.value;
  }

  #open = (event) => {
    event.preventDefault();
    if (this.disabled) return;
    this.inputValue = this.value;
    this.renderRoot.querySelector("[popover]")?.showPopover();
  };

  #inputIconName = (event) => {
    this.inputValue = event.currentTarget.value;
  };

  #submitIconName = (event) => {
    event.preventDefault();
    const icon = normalizeIconName(this.inputValue);
    if (!isValidGoogleIconName(icon)) return;
    this.#selectIcon(icon);
  };

  #select = (event) => {
    this.#selectIcon(event.detail.icon);
  };

  #selectIcon(icon) {
    this.value = icon;
    this.inputValue = icon;
    this.close();
    this.dispatchEvent(
      new CustomEvent("icon-change", {
        detail: { icon: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

customElements.define("icon-picker-popover", IconPickerPopover);

function normalizeIconName(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replaceAll(/\s+/g, "_");
}

function isConfiguredMaterialIconName(name) {
  return getMaterialIconNames().includes(name);
}

function isValidGoogleIconName(name) {
  return /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/.test(name);
}

function renderIconNameFeedback(hasInput, isValid, isConfigured) {
  if (!hasInput) return "";
  if (!isValid) return "Use lowercase letters, numbers, and underscores";
  return isConfigured ? "Icon name is in the picker list" : "Custom Google icon name";
}
