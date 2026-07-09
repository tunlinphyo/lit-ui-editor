import { LitElement, html } from "lit";
import { DEFAULT_TEXT_COLOR } from "../../../utils/colors.js";
import { FEATURES, isFeatureEnabled } from "../../../registries/formatter-registry.js";
import { formatToolbarStyles } from "./format-toolbar.styles.js";

const FORMATTERS = [
  "element-type-selector",
  "format-font-family",
  "format-font-size",
  "format-bold",
  "format-italic",
  "format-underline",
  "format-ordered-list",
  "format-unordered-list",
  "format-align-left",
  "format-align-center",
  "format-align-right",
  "format-align-justify",
  "format-highlight",
  "format-mark-style",
  "format-link",
  "format-link-target",
  "format-text-color",
  "format-text-color-palette",
  "format-icon-background-color",
  "format-icon-link",
  "format-icon-link-target",
  "icon-border-width",
  "icon-border-color",
  "icon-border-style",
  "icon-border-position",
  "icon-border-radius",
  "image-background-color",
  "image-border-width",
  "image-border-color",
  "image-border-style",
  "image-border-position",
  "image-border-radius",
  "format-image-object-fit",
  "format-image-link",
  "format-image-link-target",
  "format-disabled",
  "format-button-icon-placement",
  "format-button-link",
  "format-button-link-target",
  "button-background-color",
  "button-border-width",
  "button-border-color",
  "button-border-style",
  "button-border-position",
  "button-border-radius",
  "format-table-headers",
  "table-header-background-color",
  "table-body-background-color",
  "table-stripe-background-color",
  "table-border-width",
  "table-border-color",
  "table-border-style",
  "table-border-position",
];

const TEXT_FORMATTERS = [
  "element-type-selector",
  "format-font-family",
  "format-font-size",
  "format-bold",
  "format-italic",
  "format-underline",
  "format-ordered-list",
  "format-unordered-list",
  "format-highlight",
  "format-mark-style",
  "format-link",
  "format-link-target",
  "format-text-color",
  "format-text-color-palette",
];

const INLINE_FORMATTERS = [
  ["format-font-size", "fontSizeApplied"],
  ["format-bold", "bold"],
  ["format-italic", "italic"],
  ["format-underline", "underline"],
  ["format-highlight", "highlight"],
  ["format-link", "link"],
  ["format-text-color", "colorApplied"],
  ["format-text-color-palette", "colorApplied"],
];

const ICON_FORMATTERS = [
  "format-font-size",
  "format-icon-link",
  "format-icon-link-target",
  "format-disabled",
  "format-text-color",
  "format-text-color-palette",
  "format-icon-background-color",
  "icon-border-width",
  "icon-border-color",
  "icon-border-style",
  "icon-border-position",
  "icon-border-radius",
];

const FORMATTER_FEATURES = {
  "element-type-selector": FEATURES.type,
  "format-font-family": FEATURES.fontFamily,
  "format-font-size": FEATURES.fontSize,
  "format-bold": FEATURES.bold,
  "format-italic": FEATURES.italic,
  "format-underline": FEATURES.underline,
  "format-ordered-list": FEATURES.orderedList,
  "format-unordered-list": FEATURES.unorderedList,
  "format-align-left": FEATURES.align,
  "format-align-center": FEATURES.align,
  "format-align-right": FEATURES.align,
  "format-align-justify": FEATURES.align,
  "format-highlight": FEATURES.backgroundColor,
  "format-mark-style": FEATURES.backgroundColor,
  "format-link": FEATURES.link,
  "format-link-target": FEATURES.linkTarget,
  "format-text-color": FEATURES.color,
  "format-text-color-palette": FEATURES.color,
  "format-icon-background-color": FEATURES.backgroundColor,
  "format-icon-link": FEATURES.link,
  "format-icon-link-target": FEATURES.linkTarget,
  "icon-border-width": FEATURES.border,
  "icon-border-color": FEATURES.border,
  "icon-border-style": FEATURES.border,
  "icon-border-position": FEATURES.border,
  "icon-border-radius": FEATURES.borderRadius,
  "image-background-color": FEATURES.backgroundColor,
  "image-border-width": FEATURES.border,
  "image-border-color": FEATURES.border,
  "image-border-style": FEATURES.border,
  "image-border-position": FEATURES.border,
  "image-border-radius": FEATURES.borderRadius,
  "format-image-object-fit": FEATURES.objectFit,
  "format-image-link": FEATURES.link,
  "format-image-link-target": FEATURES.linkTarget,
  "format-disabled": FEATURES.disabled,
  "format-button-icon-placement": FEATURES.icon,
  "format-button-link": FEATURES.link,
  "format-button-link-target": FEATURES.linkTarget,
  "button-background-color": FEATURES.backgroundColor,
  "button-border-width": FEATURES.border,
  "button-border-color": FEATURES.border,
  "button-border-style": FEATURES.border,
  "button-border-position": FEATURES.border,
  "button-border-radius": FEATURES.borderRadius,
  "format-table-headers": FEATURES.tableHeaders,
  "table-header-background-color": FEATURES.backgroundColor,
  "table-body-background-color": FEATURES.backgroundColor,
  "table-stripe-background-color": FEATURES.backgroundColor,
  "table-border-width": FEATURES.border,
  "table-border-color": FEATURES.border,
  "table-border-style": FEATURES.border,
  "table-border-position": FEATURES.border,
};

export class FormatToolbar extends LitElement {
  static properties = {
    title: { type: String },
  };

  constructor() {
    super();
    this.title = "Text";
  }

  static styles = formatToolbarStyles;

  render() {
    return html`
      <div id="text" class="tools">
        <h2>${this.title}</h2>
        <element-type-selector></element-type-selector>
        <format-font-family></format-font-family>
        <format-text-color-palette></format-text-color-palette>
        <div class="format-group">
          <format-bold></format-bold>
          <format-italic></format-italic>
          <format-underline></format-underline>
          <format-font-size></format-font-size>
        </div>
        <div class="format-group-aligns">
          <format-align-left applied></format-align-left>
          <format-align-center></format-align-center>
          <format-align-right></format-align-right>
          <format-align-justify></format-align-justify>
        </div>
        <div class="format-group">
          <format-ordered-list></format-ordered-list>
          <format-unordered-list></format-unordered-list>
          <format-link></format-link>
          <format-link-target></format-link-target>
        </div>
        <div class="format-highlight-group">
          <format-highlight></format-highlight>
          <format-mark-style></format-mark-style>
          <format-icon-background-color></format-icon-background-color>
        </div>
      </div>

      <div id="icon" hidden class="tools">
        <h2>Icon</h2>
        <div class="format-link-group">
          <format-icon-link></format-icon-link>
          <format-disabled></format-disabled>
          <format-icon-link-target></format-icon-link-target>
        </div>
        <format-text-color-palette></format-text-color-palette>
        <div class="format-font-group">
          <format-icon-background-color></format-icon-background-color>
          <format-font-size></format-font-size>
        </div>
        <div class="group-label">Border</div>
        <div class="format-border-group">
          <icon-border-style></icon-border-style>
          <icon-border-color></icon-border-color>
          <icon-border-width></icon-border-width>
        </div>
        <icon-border-position></icon-border-position>
        <icon-border-radius></icon-border-radius>
      </div>

      <div id="button" hidden class="tools">
        <h2>Button</h2>
        <format-button-icon-placement></format-button-icon-placement>
        <div class="format-link-group">
          <format-button-link></format-button-link>
          <format-disabled></format-disabled>
          <format-button-link-target></format-button-link-target>
        </div>
        <format-text-color-palette></format-text-color-palette>
        <button-background-color></button-background-color>
        <div class="group-label">Border</div>
        <div class="format-border-group">
          <button-border-style></button-border-style>
          <button-border-color></button-border-color>
          <button-border-width></button-border-width>
        </div>
        <button-border-position></button-border-position>
        <button-border-radius></button-border-radius>
      </div>

      <div id="image" hidden class="tools">
        <h2>Image</h2>
        <div class="format-link-group">
          <format-image-link></format-image-link>
          <format-disabled></format-disabled>
          <format-image-link-target></format-image-link-target>
        </div>
        <image-background-color></image-background-color>
        <format-image-object-fit></format-image-object-fit>
        <div class="group-label">Border</div>
        <div class="format-border-group">
          <image-border-style></image-border-style>
          <image-border-color></image-border-color>
          <image-border-width></image-border-width>
        </div>
        <image-border-position></image-border-position>
        <image-border-radius></image-border-radius>
      </div>

      <div id="table" hidden class="tools">
        <h2>Table</h2>
        <format-table-headers></format-table-headers>
        <table-header-background-color></table-header-background-color>
        <table-body-background-color></table-body-background-color>
        <table-stripe-background-color hidden></table-stripe-background-color>
        <div class="group-label">Border</div>
        <div class="format-border-group">
          <table-border-style></table-border-style>
          <table-border-color></table-border-color>
          <table-border-width></table-border-width>
        </div>
        <table-border-position></table-border-position>
      </div>
    `;
  }

  firstUpdated() {
    for (const selector of FORMATTERS) this.#setDisabled(selector, true);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("selection-format-change", this.#selectionFormatChange);
  }

  disconnectedCallback() {
    this.removeEventListener("selection-format-change", this.#selectionFormatChange);
    super.disconnectedCallback();
  }

  #selectionFormatChange = (event) => {
    const format = event.detail;
    const imageSelected = format?.type === "image";
    const buttonSelected = format?.type === "button";
    const iconSelected = format?.type === "icon";
    const tableSelected = format?.type === "table";
    const nonTextSelected = imageSelected || buttonSelected || iconSelected || tableSelected;
    const backgroundColorSelected = iconSelected || format?.highlight;

    this.renderRoot.querySelector("#text")?.toggleAttribute("hidden", nonTextSelected);
    this.renderRoot.querySelector("#icon")?.toggleAttribute("hidden", !iconSelected);
    this.renderRoot.querySelector("#button")?.toggleAttribute("hidden", !buttonSelected);
    this.renderRoot.querySelector("#image")?.toggleAttribute("hidden", !imageSelected);
    this.renderRoot.querySelector("#table")?.toggleAttribute("hidden", !tableSelected);

    this.#setValue("element-type-selector", nonTextSelected ? "p" : (format?.type ?? "p"));
    this.#setValue(
      "format-font-family",
      format?.fontFamily || (format?.type === "p" ? "var(--font-body)" : "var(--font-heading)"),
    );
    this.#setValue("format-font-size", format?.fontSize ?? "");
    this.#setApplied("format-bold", format?.bold ?? false);
    this.#setApplied("format-italic", format?.italic ?? false);
    this.#setApplied("format-underline", format?.underline ?? false);
    this.#setApplied("format-ordered-list", format?.orderedList ?? false);
    this.#setApplied("format-unordered-list", format?.unorderedList ?? false);
    this.#setApplied("format-align-left", !format?.align || format.align === "left");
    this.#setApplied("format-align-center", format?.align === "center");
    this.#setApplied("format-align-right", format?.align === "right");
    this.#setApplied("format-align-justify", format?.align === "justify");
    this.#setApplied("format-highlight", format?.highlight ?? false);
    this.#setValue("format-mark-style", format?.markClass ?? "");
    this.#setApplied("format-link", Boolean(format?.link));
    this.#setValue("format-link", format?.link ?? "");
    this.#setValue("format-link-target", format?.target ?? "_self");
    this.#setApplied("format-icon-link", iconSelected && Boolean(format?.link));
    this.#setValue("format-icon-link", iconSelected ? (format?.link ?? "") : "");
    this.#setValue("format-icon-link-target", format?.target ?? "_self");
    this.#setApplied("format-button-link", buttonSelected && Boolean(format?.link));
    this.#setValue("format-button-link", buttonSelected ? (format?.link ?? "") : "");
    this.#setValue(
      "format-button-link-target",
      buttonSelected ? (format?.target ?? "_self") : "_self",
    );
    this.#setApplied("format-image-link", imageSelected && Boolean(format?.link));
    this.#setValue("format-image-link", imageSelected ? (format?.link ?? "") : "");
    this.#setValue("format-image-link-target", format?.target ?? "_self");
    this.#setValue("format-text-color", toHex(format?.color, DEFAULT_TEXT_COLOR));
    this.#setValue("format-text-color-palette", toHex(format?.color, DEFAULT_TEXT_COLOR));
    this.#setValue("format-icon-background-color", format?.backgroundColor ?? "");
    this.#setValue("icon-border-width", format?.borderWidth ?? "");
    this.#setValue("icon-border-color", format?.borderColor ?? "");
    this.#setValue("icon-border-style", format?.borderStyle ?? "");
    this.#setValue("icon-border-position", format?.borderPosition ?? "");
    this.#setValue("icon-border-radius", format?.borderRadius ?? "");
    this.#setValue("image-background-color", format?.backgroundColor ?? "");
    this.#setValue("image-border-width", format?.borderWidth ?? "");
    this.#setValue("image-border-color", format?.borderColor ?? "");
    this.#setValue("image-border-style", format?.borderStyle ?? "");
    this.#setValue("image-border-position", format?.borderPosition ?? "");
    this.#setValue("image-border-radius", format?.borderRadius ?? "");
    this.#setValue("format-image-object-fit", format?.objectFit ?? "none");
    this.#setValue("format-button-icon-placement", format?.buttonIconPlacement ?? "none");
    this.#setValue("button-background-color", format?.backgroundColor ?? "");
    this.#setValue("button-border-width", format?.borderWidth ?? "");
    this.#setValue("button-border-color", format?.borderColor ?? "");
    this.#setValue("button-border-style", format?.borderStyle ?? "");
    this.#setValue("button-border-position", format?.borderPosition ?? "");
    this.#setValue("button-border-radius", format?.borderRadius ?? "");
    this.#setApplied("format-disabled", Boolean(format?.disabled));
    this.#setProperty("format-table-headers", "headerRow", Boolean(format?.headerRow));
    this.#setProperty("format-table-headers", "headerColumn", Boolean(format?.headerColumn));
    this.#setProperty("format-table-headers", "stripedRows", Boolean(format?.stripedRows));
    this.#setValue("table-header-background-color", format?.headerBackgroundColor ?? "");
    this.#setValue("table-body-background-color", format?.bodyBackgroundColor ?? "");
    this.#setValue("table-stripe-background-color", format?.stripeBackgroundColor ?? "");
    this.#setValue("table-border-width", format?.borderWidth ?? "");
    this.#setValue("table-border-color", format?.borderColor ?? "");
    this.#setValue("table-border-style", format?.borderStyle ?? "");
    this.#setValue("table-border-position", format?.borderPosition ?? "");

    for (const selector of FORMATTERS) this.#setDisabled(selector, !format);

    for (const selector of TEXT_FORMATTERS) {
      this.#setDisabled(selector, !format || nonTextSelected);
    }

    for (const [selector, property] of INLINE_FORMATTERS) {
      const appliesToBlock =
        (selector === "format-bold" || selector === "format-font-size") &&
        (format?.type !== "p" || format?.contentModel === "inline");
      this.#setDisabled(
        selector,
        !format ||
          nonTextSelected ||
          (format.collapsed !== false && !format[property] && !appliesToBlock),
      );
    }

    this.#setDisabled(
      "format-text-color-palette",
      !format || (buttonSelected ? false : nonTextSelected || format.collapsed !== false),
    );
    this.#setDisabled("format-icon-background-color", !backgroundColorSelected);
    this.#setDisabled("icon-border-width", !iconSelected || !format?.borderStyle);
    this.#setDisabled("icon-border-color", !iconSelected || !format?.borderStyle);
    this.#setDisabled("icon-border-style", !iconSelected);
    this.#setDisabled("icon-border-position", !iconSelected || !hasBorder(format));
    this.#setDisabled("icon-border-radius", !iconSelected);
    this.#setDisabled("format-mark-style", !format || nonTextSelected || !format.highlight);
    this.#setDisabled("format-link-target", nonTextSelected || !format?.link);
    this.#setDisabled("format-icon-link", !iconSelected);
    this.#setDisabled("format-icon-link-target", !iconSelected || !format?.link);
    this.#setDisabled("image-background-color", !imageSelected);
    this.#setDisabled("image-border-width", !imageSelected || !format?.borderStyle);
    this.#setDisabled("image-border-color", !imageSelected || !format?.borderStyle);
    this.#setDisabled("image-border-style", !imageSelected);
    this.#setDisabled("image-border-position", !imageSelected || !hasBorder(format));
    this.#setDisabled("image-border-radius", !imageSelected);
    this.#setDisabled("format-image-object-fit", !imageSelected);
    this.#setDisabled("format-button-icon-placement", !buttonSelected);
    this.#setDisabled("format-button-link", !buttonSelected);
    this.#setDisabled("format-button-link-target", !buttonSelected || !format?.link);
    this.#setDisabled("button-background-color", !buttonSelected);
    this.#setDisabled("button-border-width", !buttonSelected || !format?.borderStyle);
    this.#setDisabled("button-border-color", !buttonSelected || !format?.borderStyle);
    this.#setDisabled("button-border-style", !buttonSelected);
    this.#setDisabled("button-border-position", !buttonSelected || !hasBorder(format));
    this.#setDisabled("button-border-radius", !buttonSelected);
    this.#setDisabled("format-image-link", !imageSelected);
    this.#setDisabled("format-image-link-target", !imageSelected || !format?.link);
    this.#setDisabled("format-disabled", !buttonSelected && !imageSelected && !iconSelected);
    this.#setDisabled("format-table-headers", !tableSelected);
    this.#setDisabled("table-header-background-color", !tableSelected);
    this.#setDisabled("table-body-background-color", !tableSelected);
    this.#setDisabled("table-stripe-background-color", !tableSelected || !format?.stripedRows);
    this.#setDisabled("table-border-width", !tableSelected || !format?.borderStyle);
    this.#setDisabled("table-border-color", !tableSelected || !format?.borderStyle);
    this.#setDisabled("table-border-style", !tableSelected);
    this.#setDisabled("table-border-position", !tableSelected || !hasBorder(format));

    if (iconSelected) {
      for (const selector of FORMATTERS) this.#setDisabled(selector, true);
      for (const selector of ICON_FORMATTERS) {
        this.#setDisabled(selector, false);
      }
      this.#setDisabled("icon-border-width", !format?.borderStyle);
      this.#setDisabled("icon-border-color", !format?.borderStyle);
      this.#setDisabled("icon-border-position", !hasBorder(format));
      this.#setDisabled("format-icon-link-target", !format?.link);
    }

    this.#applyCapabilities(format);
    this.#setHidden("table-stripe-background-color", !tableSelected || !format?.stripedRows);
  };

  #setApplied(selector, applied) {
    for (const formatter of this.renderRoot.querySelectorAll(selector)) formatter.applied = applied;
  }

  #setValue(selector, value) {
    for (const formatter of this.renderRoot.querySelectorAll(selector)) formatter.value = value;
  }

  #setProperty(selector, property, value) {
    for (const formatter of this.renderRoot.querySelectorAll(selector)) {
      formatter[property] = value;
    }
  }

  #setDisabled(selector, disabled) {
    for (const formatter of this.renderRoot.querySelectorAll(selector)) {
      formatter.disabled = disabled;
    }
  }

  #setHidden(selector, hidden) {
    for (const formatter of this.renderRoot.querySelectorAll(selector)) formatter.hidden = hidden;
  }

  #applyCapabilities(format) {
    for (const [selector, feature] of Object.entries(FORMATTER_FEATURES)) {
      const disabled = Boolean(format) && !isFeatureEnabled(format, feature);
      this.#setHidden(selector, false);
      if (disabled) this.#setDisabled(selector, true);
    }
  }
}

function toHex(color, fallback) {
  if (/^var\(/i.test(color?.trim())) return color.trim();
  if (/^#[\da-f]{6}$/i.test(color)) return color.toLowerCase();

  const values = color?.match(/\d+/g);
  if (!values || values.length < 3) return fallback;

  return `#${values
    .slice(0, 3)
    .map((value) => Number(value).toString(16).padStart(2, "0"))
    .join("")}`;
}

function hasBorder(format) {
  if (!format) return false;
  return Boolean(format.borderWidth) && format.borderStyle !== "";
}

customElements.define("format-toolbar", FormatToolbar);
