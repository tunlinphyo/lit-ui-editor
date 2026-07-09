export const DEFAULT_ROWS = 3;
export const DEFAULT_COLUMNS = 3;

export function createCells(rowCount, columnCount) {
  return Array.from({ length: rowCount }, () => Array.from({ length: columnCount }, createCell));
}

export function normalizeCells(cells) {
  if (!Array.isArray(cells) || cells.length === 0) {
    return createCells(DEFAULT_ROWS, DEFAULT_COLUMNS);
  }

  const columnCount = Math.max(1, ...cells.map((row) => (Array.isArray(row) ? row.length : 0)));
  return cells.map((row) =>
    Array.from({ length: columnCount }, (_, index) =>
      normalizeCell(Array.isArray(row) ? row[index] : null),
    ),
  );
}

export function createCell() {
  return {
    children: [],
    textAlign: "left",
    fontSize: "",
    fontFamily: "",
  };
}

export function normalizeCell(cell) {
  if (!cell || typeof cell !== "object" || Array.isArray(cell)) return createCell();

  return {
    children: Array.isArray(cell.children) ? cell.children : [],
    textAlign: typeof cell.textAlign === "string" ? cell.textAlign : "left",
    fontSize: typeof cell.fontSize === "string" ? cell.fontSize : "",
    fontFamily: typeof cell.fontFamily === "string" ? cell.fontFamily : "",
  };
}

export function createCellValue({ children, textAlign, fontSize, fontFamily }) {
  return {
    children: Array.isArray(children) ? children : [],
    textAlign: typeof textAlign === "string" ? textAlign : "left",
    fontSize: typeof fontSize === "string" ? fontSize : "",
    fontFamily: typeof fontFamily === "string" ? fontFamily : "",
  };
}

export function clampIndex(index, length, allowEnd = false) {
  const maximum = allowEnd ? length : length - 1;
  const numericIndex = Number.isInteger(index) ? index : maximum;
  return Math.min(Math.max(numericIndex, 0), maximum);
}
