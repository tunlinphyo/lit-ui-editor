import { afterEach, expect, test, vi } from "vitest";
import { EditorHistory } from "./editor-history.js";

afterEach(() => {
  vi.useRealTimers();
});

test("captures snapshots, ignores duplicates, and restores undo and redo clones", () => {
  let state = { groups: [{ id: "first" }] };
  const restored = [];
  const changes = [];
  const history = new EditorHistory({
    capture: () => state,
    restore: (snapshot) => {
      restored.push(snapshot);
      state = snapshot;
    },
    onChange: (change) => changes.push(change),
  });

  history.reset();
  expect(history.capture()).toBe(false);
  state.groups[0].id = "mutated-after-reset";

  state = { groups: [{ id: "second" }] };
  expect(history.capture()).toBe(true);

  expect(history.canUndo).toBe(true);
  expect(history.undo()).toBe(true);
  expect(restored.at(-1)).toEqual({ groups: [{ id: "first" }] });

  restored.at(-1).groups[0].id = "mutated-restore";
  expect(history.redo()).toBe(true);
  expect(restored.at(-1)).toEqual({ groups: [{ id: "second" }] });
  expect(changes.at(-1)).toEqual({ canUndo: true, canRedo: false });
});

test("clears redo history after a new capture", () => {
  let state = { value: "first" };
  const history = new EditorHistory({
    capture: () => state,
    restore: (snapshot) => {
      state = snapshot;
    },
  });

  history.reset();
  state = { value: "second" };
  history.capture();
  history.undo();

  state = { value: "third" };
  history.capture();

  expect(history.canRedo).toBe(false);
  expect(history.redo()).toBe(false);
});

test("debounces scheduled captures and cancels them during undo", () => {
  vi.useFakeTimers();
  let state = { value: "first" };
  const restored = [];
  const history = new EditorHistory({
    capture: () => state,
    restore: (snapshot) => {
      restored.push(snapshot);
      state = snapshot;
    },
  });

  history.reset();
  state = { value: "second" };
  history.capture();

  state = { value: "third" };
  history.captureSoon(100);
  state = { value: "fourth" };
  history.captureSoon(100);
  history.undo();

  vi.advanceTimersByTime(100);

  expect(restored.at(-1)).toEqual({ value: "first" });
  expect(history.canRedo).toBe(true);
});

test("enforces the configured history limit", () => {
  let state = { value: 0 };
  const restored = [];
  const history = new EditorHistory({
    capture: () => state,
    restore: (snapshot) => restored.push(snapshot),
    limit: 2,
  });

  history.reset();
  state = { value: 1 };
  history.capture();
  state = { value: 2 };
  history.capture();

  expect(history.undo()).toBe(true);
  expect(restored.at(-1)).toEqual({ value: 1 });
  expect(history.undo()).toBe(false);
});
