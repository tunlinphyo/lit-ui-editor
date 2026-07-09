import { expect, test, vi } from "vitest";
import { registerGroup } from "../registries/group-registry.js";
import { CURRENT_PAGE_VERSION } from "../schema/page-normalize.js";
import { deserializeEditor, serializeEditor } from "./editor-serializer.js";

registerGroup({
  type: "serializer-test",
  tagName: "serializer-test-group",
  selector: "serializer-test-group",
});

test("serializes editor JSON without empty nested formatter objects", () => {
  const group = document.createElement("serializer-test-group");
  group.toJSON = () => ({
    id: "group-1",
    type: "serializer-test",
    hashId: "",
    style: {
      backgroundColor: "",
      marks: {
        color: "",
      },
      value: "",
    },
    blocks: [
      {
        id: "block-1",
        type: "p",
        textAlign: "",
        value: "",
        children: [
          {
            text: "Clean",
            marks: {
              color: "",
            },
          },
        ],
      },
      {
        id: "",
        type: "",
      },
    ],
  });

  const editor = createEditorWithGroups(group);

  expect(serializeEditor(editor)).toEqual({
    version: CURRENT_PAGE_VERSION,
    groups: [
      {
        id: "group-1",
        type: "serializer-test",
        style: {
          value: "",
        },
        blocks: [
          {
            id: "block-1",
            type: "p",
            value: "",
            children: [{ text: "Clean" }],
          },
        ],
      },
    ],
  });
});

test("deserializes snapshots, initializes matching groups, and removes stale groups", () => {
  const keepGroup = document.createElement("serializer-test-group");
  keepGroup.setAttribute("group-id", "keep");
  keepGroup.init = vi.fn();
  keepGroup.blocks = [];

  const staleGroup = document.createElement("serializer-test-group");
  staleGroup.setAttribute("group-id", "stale");
  staleGroup.init = vi.fn();
  staleGroup.blocks = [];

  const groupOrder = document.createElement("group-order");
  groupOrder.init = vi.fn();
  groupOrder.append(keepGroup, staleGroup);

  const editor = createEditorWithGroupOrder(groupOrder);
  const pageData = {
    version: CURRENT_PAGE_VERSION,
    groups: [
      {
        id: "keep",
        type: "serializer-test",
        sort: 2,
        style: {},
        blocks: [],
      },
    ],
  };

  deserializeEditor(editor, pageData);

  expect(groupOrder.init).toHaveBeenCalledWith([
    expect.objectContaining({ id: "keep", type: "serializer-test" }),
  ]);
  expect(keepGroup.init).toHaveBeenCalledWith(
    expect.objectContaining({ id: "keep", type: "serializer-test" }),
  );
  expect(staleGroup.isConnected).toBe(false);
});

function createEditorWithGroups(...groups) {
  const groupOrder = document.createElement("group-order");
  groupOrder.append(...groups);
  return createEditorWithGroupOrder(groupOrder);
}

function createEditorWithGroupOrder(groupOrder) {
  return {
    renderRoot: {
      querySelector: (selector) => (selector === "group-order" ? groupOrder : null),
      querySelectorAll: () => [],
    },
  };
}
