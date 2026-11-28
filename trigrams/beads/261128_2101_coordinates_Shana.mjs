// SHANA: Three bits are read top-to-bottom as x, y, z.
export function positionFromCode(code) {
  if (typeof code !== "string" || !/^[01]{3}$/.test(code)) throw new TypeError("Expected three binary digits");
  return [...code].map((bit) => bit === "1" ? 1 : -1);
}

// View from the x-negative side: the first-bit-zero face is nearest.
// Rows are screen-right, screen-up and depth; this is a rotation, not a reflection.
export const BASE_VIEW = [[0, -1, 0], [0, 0, 1], [-1, 0, 0]];
