import { randomUUID } from "../../../utils/ids.js";
import { getGroupDefinition } from "../../../registries/group-registry.js";
import "../../dialogs/hash-dialog.js";
import "./empty-group-picker-button.js";

export class GroupOrder extends HTMLElement {
  static get observedAttributes() {
    return ["picker", "picker-dialog"];
  }

  attributeChangedCallback() {
    this.#ensurePicker();
    this.#syncPicker();
  }

  connectedCallback() {
    this.addEventListener("move-group-request", this.#moveGroup);
    this.addEventListener("add-group-request", this.#openPicker);
    this.addEventListener("delete-group-request", this.#deleteGroup);
    this.addEventListener("hash-group-request", this.#editGroupHash);
    this.addEventListener("group-select", this.#addGroup);

    this.#ensurePicker();
    this.#ensureEmptyPickerButton();
    this.#syncPicker();
    if (!this.querySelector(":scope > confirm-dialog")) {
      this.append(document.createElement("confirm-dialog"));
    }
    if (!this.querySelector(":scope > hash-dialog")) {
      this.append(document.createElement("hash-dialog"));
    }
  }

  disconnectedCallback() {
    this.removeEventListener("move-group-request", this.#moveGroup);
    this.removeEventListener("add-group-request", this.#openPicker);
    this.removeEventListener("delete-group-request", this.#deleteGroup);
    this.removeEventListener("hash-group-request", this.#editGroupHash);
    this.removeEventListener("group-select", this.#addGroup);
  }

  init(pageData = []) {
    const groupsById = new Map(
      [...this.children]
        .filter((element) => element.hasAttribute("group-id"))
        .map((group) => [group.getAttribute("group-id"), group]),
    );

    let groupIndex = 0;
    for (const { id, type, blocks, sort } of pageData) {
      if (!Array.isArray(blocks)) continue;

      let group = groupsById.get(id);
      if (!group) {
        const definition = getGroupDefinition(type ?? id);
        const tagName = definition?.tagName;
        if (!customElements.get(tagName)) continue;

        group = document.createElement(tagName);
        group.setAttribute("group-id", id);
        group.setAttribute("group-type", definition.type);
        this.append(group);
        groupsById.set(id, group);
      }

      group.sort = sort ?? groupIndex;
      groupIndex += 1;
    }

    this.#updateOrder(this.#getGroups());
    return this;
  }

  #moveGroup = (event) => {
    const { group, offset } = event.detail;
    if (group?.parentElement !== this) return;

    const groups = this.#getGroups();
    const index = groups.indexOf(group);
    const targetIndex = index + offset;
    if (index < 0 || targetIndex < 0 || targetIndex >= groups.length) return;

    groups.splice(index, 1);
    groups.splice(targetIndex, 0, group);
    this.#updateOrder(groups);
    this.#dispatchChange();
  };

  #openPicker = (event) => {
    if (event.detail.after && event.detail.after.parentElement !== this) return;

    this.insertAfter = event.detail.after;
    this.#showPicker();
  };

  #openEmptyPicker = () => {
    this.insertAfter = null;
    this.#showPicker();
  };

  #showPicker() {
    const picker = this.#getPicker();
    this.#syncPicker();
    picker?.open();
  }

  #addGroup = (event) => {
    const { type } = event.detail;
    const definition = getGroupDefinition(type);
    if (!definition) return;

    const group = document.createElement(definition.tagName);
    group.setAttribute("group-id", randomUUID());
    group.setAttribute("group-type", definition.type);

    const groups = this.#getGroups();
    const index = groups.indexOf(this.insertAfter) + 1;
    groups.splice(index, 0, group);
    this.#updateOrder(groups);

    const defaultData = {
      ...group.constructor.defaultJson,
      style: {
        ...definition.defaultStyle,
        ...group.constructor.defaultJson?.style,
      },
    };
    group.init(defaultData);
    this.#dispatchChange();
    void group.focusFirstBlock?.();
  };

  #deleteGroup = async (event) => {
    if (event.detail.group?.parentElement !== this) return;

    const confirmed = await this.querySelector(":scope > confirm-dialog")?.open({
      title: "Delete group?",
      message: "This group and all of its content will be permanently deleted.",
      confirmLabel: "Delete group",
    });
    if (!confirmed) return;

    event.detail.group.remove();
    this.#updateOrder(this.#getGroups());
    this.#dispatchChange();
  };

  #editGroupHash = async (event) => {
    if (event.detail.group?.parentElement !== this) return;

    const value = await this.querySelector(":scope > hash-dialog")?.open({
      value: event.detail.group.hashId,
    });
    if (value === null || value === undefined) return;

    event.detail.group.setHashId(value);
    this.#dispatchChange();
  };

  #getGroups() {
    return [...this.children]
      .filter((element) => element.hasAttribute("group-id"))
      .sort((a, b) => a.sort - b.sort);
  }

  #updateOrder(groups) {
    let anchor = this.#getPicker();
    for (let index = groups.length - 1; index >= 0; index -= 1) {
      const group = groups[index];
      if (group.parentElement !== this || group.nextSibling !== anchor) {
        this.insertBefore(group, anchor);
      }
      anchor = group;
    }

    groups.forEach((group, sort) => {
      group.sort = sort;
      group.requestUpdate?.();
    });
  }

  #dispatchChange() {
    this.dispatchEvent(
      new CustomEvent("editor-change", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  #syncPicker() {
    const picker = this.#getPicker();
    if (picker) picker.picker = this.getAttribute("picker") || "";
  }

  #ensurePicker() {
    const tagName = this.#getPickerTagName();
    const currentPicker = this.#getPicker();
    if (currentPicker?.localName === tagName) return;

    currentPicker?.remove();
    const picker = document.createElement(tagName);
    picker.setAttribute("data-group-picker-dialog", "");
    this.append(picker);
  }

  #ensureEmptyPickerButton() {
    if (this.querySelector(":scope > [data-empty-group-picker]")) return;

    const button = document.createElement("empty-group-picker-button");
    const icon = document.createElement("span");
    icon.className = "material-symbol";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "add";
    button.append(icon, "Add Section");
    button.setAttribute("data-empty-group-picker", "");
    button.addEventListener("click", this.#openEmptyPicker);
    this.insertBefore(button, this.#getPicker());
  }

  #getPicker() {
    return this.querySelector(":scope > [data-group-picker-dialog]");
  }

  #getPickerTagName() {
    return this.getAttribute("picker-dialog") || "group-picker-dialog";
  }
}

customElements.define("group-order", GroupOrder);
