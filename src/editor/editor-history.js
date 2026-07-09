const DEFAULT_HISTORY_LIMIT = 100;

export class EditorHistory {
  constructor({ capture, restore, onChange, limit = DEFAULT_HISTORY_LIMIT }) {
    this.captureSnapshot = capture;
    this.restoreSnapshot = restore;
    this.onChange = onChange;
    this.limit = limit;
    this.snapshots = [];
    this.future = [];
    this.restoring = false;
    this.captureTimer = null;
  }

  reset(snapshot = this.captureSnapshot()) {
    this.#clearScheduledCapture();
    this.snapshots = [cloneSnapshot(snapshot)];
    this.future = [];
    this.#notifyChange();
  }

  capture() {
    if (this.restoring) return false;

    const snapshot = cloneSnapshot(this.captureSnapshot());
    const current = this.snapshots.at(-1);
    if (current && snapshotsMatch(current, snapshot)) return false;

    this.snapshots.push(snapshot);
    if (this.snapshots.length > this.limit) this.snapshots.shift();
    this.future = [];
    this.#notifyChange();
    return true;
  }

  captureSoon(delay = 0) {
    if (this.restoring) return;

    this.#clearScheduledCapture();
    this.captureTimer = window.setTimeout(() => {
      this.captureTimer = null;
      this.capture();
    }, delay);
  }

  undo() {
    if (!this.canUndo) return false;

    this.#clearScheduledCapture();
    const current = this.snapshots.pop();
    this.future.push(cloneSnapshot(current));
    this.#restore(this.snapshots.at(-1));
    this.#notifyChange();
    return true;
  }

  redo() {
    if (!this.canRedo) return false;

    this.#clearScheduledCapture();
    const snapshot = this.future.pop();
    this.snapshots.push(cloneSnapshot(snapshot));
    this.#restore(snapshot);
    this.#notifyChange();
    return true;
  }

  get canUndo() {
    return this.snapshots.length > 1;
  }

  get canRedo() {
    return this.future.length > 0;
  }

  #restore(snapshot) {
    this.restoring = true;
    try {
      this.restoreSnapshot(cloneSnapshot(snapshot));
    } finally {
      this.restoring = false;
    }
  }

  #clearScheduledCapture() {
    if (!this.captureTimer) return;

    window.clearTimeout(this.captureTimer);
    this.captureTimer = null;
  }

  #notifyChange() {
    this.onChange?.({ canUndo: this.canUndo, canRedo: this.canRedo });
  }
}

function cloneSnapshot(snapshot) {
  if (typeof structuredClone === "function") return structuredClone(snapshot);

  return JSON.parse(JSON.stringify(snapshot));
}

function snapshotsMatch(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}
