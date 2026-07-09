import { html } from "lit";
import { html as staticHtml, unsafeStatic } from "lit/static-html.js";
import { listGroupDefinitions } from "../../registries/group-registry.js";
import { GroupPickerBase } from "./base/group-picker-base.js";
import { groupPickerDialogStyles } from "./group-picker-dialog.styles.js";

export class GroupPickerDialog extends GroupPickerBase {
  static groupTypes = null;
  static styles = groupPickerDialogStyles;

  static define(tagName) {
    customElements.define(tagName, this);
    return this;
  }

  get groups() {
    const groupTypes = this.constructor.groupTypes;
    const allowedTypes = groupTypes ? new Set(groupTypes) : null;
    const groups = listGroupDefinitions().filter(
      (definition) =>
        definition.addable !== false &&
        (!allowedTypes || allowedTypes.has(definition.type)) &&
        matchesPicker(definition, this.picker),
    );

    if (!groupTypes) return groups;

    const groupsByType = new Map(groups.map((group) => [group.type, group]));
    return Array.from(groupTypes, (type) => groupsByType.get(type)).filter(Boolean);
  }

  render() {
    return html`
      <dialog @click=${this.closeFromBackdrop}>
        <form @submit=${this.submitSelection}>
          <header>
            <h2>Add Section</h2>
          </header>
          <fieldset>
            <!-- <legend>Select a Section</legend> -->
            ${this.groups.map(
              (definition, index) => html`
                <label class="group-option">
                  <input
                    type="radio"
                    name="groupType"
                    value=${definition.type}
                    ?autofocus=${index === 0}
                    .checked=${this.selectedType === definition.type}
                    @change=${this.selectGroup}
                  />
                  <span class="option-name">${definition.label ?? definition.type}</span>
                  ${renderLayoutDesign(definition.type)}
                </label>
              `,
            )}
          </fieldset>
          <footer>
            <button type="button" @click=${this.close}>Cancel</button>
            <button class="primary" type="submit" ?disabled=${!this.selectedType}>Add</button>
          </footer>
        </form>
      </dialog>
    `;
  }
}

GroupPickerDialog.define("group-picker-dialog");

export function registerGroupPicker(tagName, groupTypes) {
  if (!tagName?.includes("-")) {
    throw new TypeError("Group picker tag name must contain a hyphen");
  }
  if (!Array.isArray(groupTypes)) {
    throw new TypeError("Group picker types must be an array");
  }

  const existing = customElements.get(tagName);
  if (existing) return existing;

  const configuredGroupTypes = [...groupTypes];
  class ConfiguredGroupPickerDialog extends GroupPickerDialog {
    static groupTypes = configuredGroupTypes;
  }

  return ConfiguredGroupPickerDialog.define(tagName);
}

const DEFAULT_PICKER = "content";

function matchesPicker(definition, picker) {
  if (!picker) return true;

  const pickers = Array.isArray(definition.picker)
    ? definition.picker
    : [definition.picker ?? DEFAULT_PICKER];
  return pickers.includes(picker);
}

function renderLayoutDesign(type) {
  const tagName = unsafeStatic(`layout-${type}`);
  return staticHtml`<${tagName}></${tagName}>`;
}
