import { LitElement, html } from "lit";
import {
  getMaterialIconNames,
  materialSymbolStyles,
} from "../../icon-picker/material-icon-picker.js";
import { buttonBlockStyles } from "./button-block.styles.js";
import { getCapabilities, toFeatureAttribute } from "../../../registries/formatter-registry.js";
import "../icon/icon-block.js";

export class ButtonBlock extends LitElement {
  static properties = {
    blockId: { type: String, attribute: "block-id", reflect: true },
    text: { type: String },
    placeholder: { type: String },
    icon: { type: String, reflect: true },
    iconPosition: { type: String, attribute: "icon-position", reflect: true },
    iconFontSize: { type: String, attribute: "icon-font-size", reflect: true },
    iconColor: { type: String, attribute: "icon-color", reflect: true },
    iconBackgroundColor: {
      type: String,
      attribute: "icon-background-color",
      reflect: true,
    },
    iconBorderWidth: { type: String, attribute: "icon-border-width", reflect: true },
    iconBorderColor: { type: String, attribute: "icon-border-color", reflect: true },
    iconBorderStyle: { type: String, attribute: "icon-border-style", reflect: true },
    iconBorderPosition: { type: String, attribute: "icon-border-position", reflect: true },
    iconBorderRadius: { type: String, attribute: "icon-border-radius", reflect: true },
    iconLink: { type: String },
    iconTarget: { type: String, attribute: "icon-target", reflect: true },
    iconDisabled: { type: Boolean, attribute: "icon-disabled", reflect: true },
    color: { type: String, reflect: true },
    backgroundColor: { type: String, attribute: "background-color", reflect: true },
    borderWidth: { type: String, attribute: "border-width", reflect: true },
    borderColor: { type: String, reflect: true, attribute: "border-color" },
    borderStyle: { type: String, reflect: true, attribute: "border-style" },
    borderPosition: { type: String, reflect: true, attribute: "border-position" },
    borderRadius: { type: String, reflect: true, attribute: "border-radius" },
    link: { type: String },
    target: { type: String, reflect: true },
    align: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    features: { type: String, reflect: true },
  };

  static styles = [materialSymbolStyles, buttonBlockStyles];

  constructor() {
    super();
    this.blockId = "";
    this.text = "";
    this.placeholder = "Button";
    this.icon = "";
    this.iconPosition = "none";
    this.iconFontSize = "";
    this.iconColor = "";
    this.iconBackgroundColor = "";
    this.iconBorderWidth = "";
    this.iconBorderColor = "";
    this.iconBorderStyle = "";
    this.iconBorderPosition = "";
    this.iconBorderRadius = "";
    this.iconLink = "";
    this.iconTarget = "_self";
    this.iconDisabled = false;
    this.color = "";
    this.backgroundColor = "";
    this.borderWidth = "";
    this.borderColor = "";
    this.borderStyle = "";
    this.borderPosition = "";
    this.borderRadius = "";
    this.link = "";
    this.target = "_self";
    this.align = "left";
    this.disabled = false;
    this.features = undefined;
  }

  init(options = {}) {
    const {
      id = "",
      text = "",
      icon = "",
      iconPosition = icon ? "start" : "none",
      iconFontSize = "",
      iconColor = "",
      iconBackgroundColor = "",
      iconBorderWidth = "",
      iconBorderColor = "",
      iconBorderStyle = "",
      iconBorderPosition = "",
      iconBorderRadius = "",
      iconLink = "",
      iconTarget = "_self",
      iconDisabled = false,
      color = "",
      backgroundColor = "",
      borderWidth = "",
      borderColor = "",
      borderStyle = "",
      borderPosition = "",
      borderRadius = "",
      link = "",
      target = "_self",
      align = "left",
      disabled = false,
    } = options;

    this.blockId = id;
    this.text = text;
    this.icon = icon;
    this.iconPosition = iconPosition === "start" || iconPosition === "end" ? iconPosition : "none";
    this.iconFontSize = iconFontSize;
    this.iconColor = iconColor;
    this.iconBackgroundColor = iconBackgroundColor;
    this.iconBorderWidth = iconBorderWidth;
    this.iconBorderColor = iconBorderColor;
    this.iconBorderStyle = iconBorderStyle;
    this.iconBorderPosition = iconBorderPosition;
    this.iconBorderRadius = iconBorderRadius;
    this.iconLink = iconLink;
    this.iconTarget = iconTarget || "_self";
    this.iconDisabled = Boolean(iconDisabled);
    this.color = color;
    this.backgroundColor = backgroundColor;
    this.borderWidth = borderWidth;
    this.borderColor = borderColor;
    this.borderStyle = borderStyle;
    this.borderPosition = borderPosition;
    this.borderRadius = borderRadius;
    this.link = link;
    this.target = target || "_self";
    this.align = align;
    this.disabled = disabled;
    if (Object.hasOwn(options, "features")) {
      this.features = toFeatureAttribute(options.features);
    }
    return this;
  }

  toJSON() {
    const icon = this.#iconData;

    return {
      id: this.blockId,
      text: this.text,
      icon: icon.icon,
      iconPosition: this.iconPosition,
      iconFontSize: icon.fontSize,
      iconColor: icon.color,
      iconBackgroundColor: icon.backgroundColor,
      iconBorderWidth: icon.borderWidth,
      iconBorderColor: icon.borderColor,
      iconBorderStyle: icon.borderStyle,
      iconBorderPosition: icon.borderPosition,
      iconBorderRadius: icon.borderRadius,
      iconLink: icon.link,
      iconTarget: icon.link ? icon.target : "_self",
      iconDisabled: icon.disabled,
      color: this.color,
      backgroundColor: this.backgroundColor,
      borderWidth: this.borderWidth,
      borderColor: this.borderColor,
      borderStyle: this.borderStyle,
      borderPosition: this.borderPosition,
      borderRadius: this.borderRadius,
      link: this.link,
      target: this.link ? this.target : "_self",
      tag: this.link ? "a" : "button",
      align: this.align,
      disabled: this.disabled,
      type: "button",
    };
  }

  getSelectionFormat() {
    return {
      align: this.align,
      buttonIconPlacement: this.iconPosition,
      color: this.color,
      colorApplied: Boolean(this.color),
      backgroundColor: this.backgroundColor,
      borderWidth: this.borderWidth,
      borderColor: this.borderColor,
      borderStyle: this.borderStyle,
      borderPosition: this.borderPosition,
      borderRadius: this.borderRadius,
      link: this.link,
      target: this.target,
      disabled: this.disabled,
      type: "button",
      capabilities: getCapabilities("button", this.features),
    };
  }

  setButtonIconPlacement(placement) {
    if (placement === "none") {
      this.icon = "";
      this.iconPosition = "none";
      return true;
    }
    if (!["start", "end"].includes(placement)) return false;

    this.icon ||= getMaterialIconNames()[0] ?? "";
    this.iconPosition = placement;
    return true;
  }

  formatSelection(command, value = null) {
    if (command === "foreColor") this.color = value ?? "";
    else return false;

    return true;
  }

  setBorderRadius(borderRadius) {
    this.borderRadius = borderRadius;
    return true;
  }

  setBlockStyle(property, value) {
    if (
      !["backgroundColor", "borderWidth", "borderColor", "borderStyle", "borderPosition"].includes(
        property,
      )
    ) {
      return false;
    }

    this[property] = value;
    if (property === "borderColor" && !value) {
      this.borderWidth = "";
      this.borderStyle = "";
    }
    if (property === "borderStyle" && (!value || value === "none")) {
      this.borderWidth = "";
      this.borderColor = "";
      this.borderPosition = "";
    }
    if (property === "borderWidth" && value && !this.borderStyle) this.borderStyle = "solid";
    if (property === "borderStyle" && value && value !== "none" && !this.borderWidth) {
      this.borderWidth = "1px";
    }
    return true;
  }

  setButtonLink(link) {
    this.link = link ?? "";
    if (!this.link) this.target = "_self";
    return true;
  }

  setButtonLinkTarget(target) {
    if (!["_self", "_blank"].includes(target)) return false;
    this.target = target;
    return true;
  }

  setDisabled(disabled) {
    this.disabled = Boolean(disabled);
    return true;
  }

  render() {
    return html`
      <span
        class="button"
        part="button"
        style=${`color: ${this.color}; background-color: ${this.backgroundColor}; border-width: ${toBorderWidthValue(this.borderWidth, this.borderPosition)}; border-color: ${this.borderColor}; border-style: ${this.borderStyle}; border-radius: ${this.borderRadius};`}
      >
        ${this.iconPosition !== "none"
          ? html`
              <icon-block
                block-id=${`${this.blockId}-icon`}
                features="fontSize,color,backgroundColor,border,borderRadius,disabled"
                @icon-change=${this.#syncIcon}
                @selection-format-change=${this.#syncIconFormat}
              ></icon-block>
            `
          : null}
        <span
          class="text"
          role="textbox"
          aria-label=${this.placeholder}
          contenteditable=${this.disabled ? "false" : "plaintext-only"}
          data-placeholder=${this.placeholder}
          @keydown=${this.#keydown}
          @input=${this.#input}
        ></span>
      </span>
    `;
  }

  firstUpdated() {
    this.#syncText();
    this.#syncIconBlock();
  }

  updated(changedProperties) {
    if (changedProperties.has("text") && this.renderRoot.activeElement !== this.#textElement) {
      this.#syncText();
    }
    if (
      [
        "icon",
        "iconPosition",
        "iconFontSize",
        "iconColor",
        "iconBackgroundColor",
        "iconBorderWidth",
        "iconBorderColor",
        "iconBorderStyle",
        "iconBorderPosition",
        "iconBorderRadius",
        "iconLink",
        "iconTarget",
        "iconDisabled",
        "disabled",
      ].some((property) => changedProperties.has(property))
    ) {
      this.#syncIconBlock();
    }
  }

  #syncIcon = (event) => {
    const data = event.currentTarget.toJSON();
    this.#applyIconData(data);
    this.dispatchEvent(
      new CustomEvent("button-icon-change", {
        detail: { id: this.blockId, icon: this.icon, iconPosition: this.iconPosition },
        bubbles: true,
        composed: true,
      }),
    );
  };

  #syncIconFormat = (event) => {
    this.#applyIconData(event.currentTarget.toJSON());
  };

  #input = (event) => {
    const text = event.currentTarget.textContent ?? "";
    this.text = text.trim() ? text : "";
    if (!this.text) event.currentTarget.replaceChildren();
  };

  #keydown = (event) => {
    if (event.key !== "Enter" || event.isComposing) return;
    event.preventDefault();
  };

  #syncText() {
    if (this.#textElement) this.#textElement.textContent = this.text;
  }

  get #textElement() {
    return this.renderRoot.querySelector(".text");
  }

  get #iconElement() {
    return this.renderRoot.querySelector("icon-block");
  }

  get #iconData() {
    const data = this.#iconElement?.toJSON?.();
    if (data) return data;

    return {
      icon: this.icon,
      fontSize: this.iconFontSize,
      color: this.iconColor,
      backgroundColor: this.iconBackgroundColor,
      borderWidth: this.iconBorderWidth,
      borderColor: this.iconBorderColor,
      borderStyle: this.iconBorderStyle,
      borderPosition: this.iconBorderPosition,
      borderRadius: this.iconBorderRadius,
      link: this.iconLink,
      target: this.iconTarget,
      disabled: this.iconDisabled,
    };
  }

  #syncIconBlock() {
    const icon = this.#iconElement;
    if (!icon) return;

    icon.init({
      id: `${this.blockId}-icon`,
      icon: this.icon,
      fontSize: this.iconFontSize,
      color: this.iconColor,
      backgroundColor: this.iconBackgroundColor,
      borderWidth: this.iconBorderWidth,
      borderColor: this.iconBorderColor,
      borderStyle: this.iconBorderStyle,
      borderPosition: this.iconBorderPosition,
      borderRadius: this.iconBorderRadius,
      link: this.iconLink,
      target: this.iconTarget,
      disabled: this.iconDisabled || this.disabled,
      features: ["fontSize", "color", "backgroundColor", "border", "borderRadius", "disabled"],
    });
  }

  #applyIconData(data) {
    this.icon = data.icon ?? "";
    this.iconFontSize = data.fontSize ?? "";
    this.iconColor = data.color ?? "";
    this.iconBackgroundColor = data.backgroundColor ?? "";
    this.iconBorderWidth = data.borderWidth ?? "";
    this.iconBorderColor = data.borderColor ?? "";
    this.iconBorderStyle = data.borderStyle ?? "";
    this.iconBorderPosition = data.borderPosition ?? "";
    this.iconBorderRadius = data.borderRadius ?? "";
    this.iconLink = data.link ?? "";
    this.iconTarget = data.target ?? "_self";
    this.iconDisabled = Boolean(data.disabled);
  }
}

customElements.define("button-block", ButtonBlock);

function toBorderWidthValue(width, position) {
  if (!width || !position) return width;

  const selected = new Set(String(position).split(/\s+/).filter(Boolean));
  const positions = ["top", "right", "bottom", "left"];

  return positions.map((side) => (selected.has(side) ? width : "0")).join(" ");
}
