// SHANA: Three bits are read top-to-bottom as x, y, z.
export function positionFromCode(code) {
  if (typeof code !== "string" || !/^[01]{3}$/.test(code)) throw new TypeError("Expected three binary digits");
  return [...code].map((bit) => bit === "1" ? 1 : -1);
}
