import { LitElement, html } from "lit";
import { GROUP_FEATURES } from "../../groups/base/group-base.js";
import { groupFormatToolbarStyles } from "./group-format-toolbar.styles.js";
import "./group-link-controls.js";

const CONTROLS = [
  ["group-background-color", "backgroundColor"],
  ["group-border-width", "borderWidth"],
  ["group-border-color", "borderColor"],
  ["group-border-style", "borderStyle"],
  ["group-border-position", "borderPosition"],
  ["group-border-radius", "borderRadius"],
];

const BLOCK_GROUP_CONTROLS = ["block-group-filter"];
const CONTROL_FEATURES = {
  "group-background-color": GROUP_FEATURES.backgroundColor,
  "group-border-width": GROUP_FEATURES.border,
  "group-border-color": GROUP_FEATURES.border,
  "group-border-style": GROUP_FEATURES.border,
  "group-border-position": GROUP_FEATURES.border,
  "group-border-radius": GROUP_FEATURES.borderRadius,
  "group-link": GROUP_FEATURES.link,
  "group-link-target": GROUP_FEATURES.linkTarget,
  "group-disabled": GROUP_FEATURES.disabled,
  "block-group-filter": GROUP_FEATURES.blockGroup,
};

export class GroupFormatToolbar extends LitElement {
  static properties = {
    title: { type: String },
  };

  #currentFormat = null;

  constructor() {
    super();
    this.title = "Section";
  }

  static styles = groupFormatToolbarStyles;

  render() {
    return html`
      <editor-history-controls></editor-history-controls>
      <h2>${this.title}</h2>
      <div class="format-group">
        <group-link></group-link>
        <group-disabled></group-disabled>
        <group-link-target></group-link-target>
      </div>
      <group-background-color></group-background-color>
      <div class="group-label">Border</div>
      <div class="format-border-group">
        <group-border-style></group-border-style>
        <group-border-color></group-border-color>
        <group-border-width></group-border-width>
      </div>
      <group-border-position></group-border-position>
      <group-border-radius></group-border-radius>
      <div class="format-group format-group--withborder">
        <block-group-filter></block-group-filter>
      </div>
    `;
  }

  firstUpdated() {
    this.#syncFormat(this.#currentFormat);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("group-format-change", this.#groupFormatChange);
  }

  disconnectedCallback() {
    this.removeEventListener("group-format-change", this.#groupFormatChange);
    super.disconnectedCallback();
  }

  #groupFormatChange = (event) => {
    this.#currentFormat = event.detail;
    this.#syncFormat(this.#currentFormat);
  };

  #syncFormat(format) {
    for (const [selector, property] of CONTROLS) {
      this.#setValue(selector, format?.[property] ?? "");
      this.#setDisabled(selector, !format);
    }
    const borderDetailsDisabled = !format?.borderStyle;
    this.#setDisabled("group-border-color", borderDetailsDisabled);
    this.#setDisabled("group-border-width", borderDetailsDisabled);
    this.#setDisabled("group-border-position", !hasBorder(format));
    this.#setApplied("group-link", Boolean(format?.link));
    this.#setValue("group-link", format?.link ?? "");
    this.#setValue("group-link-target", format?.target ?? "_self");
    this.#setApplied("group-disabled", Boolean(format?.disabled));
    this.#setDisabled("group-link", !format);
    this.#setDisabled("group-disabled", !format);
    this.#setDisabled("group-link-target", !format?.link);

    for (const selector of BLOCK_GROUP_CONTROLS) {
      this.#setBlockGroupFormat(selector, format?.blockGroup ?? null);
    }

    this.#applyFeatures();
  }

  #setValue(selector, value) {
    const control = this.renderRoot.querySelector(selector);
    if (control) control.value = value;
  }

  #setDisabled(selector, disabled) {
    const control = this.renderRoot.querySelector(selector);
    if (control) control.disabled = disabled;
  }

  #setApplied(selector, applied) {
    const control = this.renderRoot.querySelector(selector);
    if (control) control.applied = applied;
  }

  #setBlockGroupFormat(selector, format) {
    const control = this.renderRoot.querySelector(selector);
    if (control) control.setFormat?.(format);
  }

  #applyFeatures = () => {
    for (const [selector, feature] of Object.entries(CONTROL_FEATURES)) {
      const enabled = this.#currentFormat?.capabilities?.[feature] === true;
      if (!enabled) this.#setDisabled(selector, true);
    }
  };
}

customElements.define("group-format-toolbar", GroupFormatToolbar);

function hasBorder(format) {
  if (!format) return false;
  return Boolean(format.borderWidth) && format.borderStyle !== "";
}
