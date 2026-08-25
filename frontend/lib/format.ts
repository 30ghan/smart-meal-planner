// Every quantity in the meal catalog is built from whole numbers plus
// quarters (0.25 / 0.5 / 0.75), so summed grocery-list totals always land
// on a quarter too -- this never needs thirds or eighths.
const QUARTER_GLYPHS: Record<number, string> = { 0.25: "¼", 0.5: "½", 0.75: "¾" };

export function formatQuantity(quantity: number): string {
  const whole = Math.floor(quantity);
  const roundedQuarter = Math.round((quantity - whole) * 4) / 4;

  if (roundedQuarter === 0) return String(whole);
  if (roundedQuarter === 1) return String(whole + 1);

  const glyph = QUARTER_GLYPHS[roundedQuarter] ?? roundedQuarter.toFixed(2);
  return whole === 0 ? glyph : `${whole}${glyph}`;
}

// Singular/plural display for every unit used in the meal catalog. "unit"
// (a bare count, e.g. "3 eggs") deliberately maps to an empty string --
// the ingredient name already says what's being counted, so the word
// "unit(s)" would just be noise next to oz/cups/tbsp/etc.
const UNIT_LABELS: Record<string, { singular: string; plural: string }> = {
  oz: { singular: "oz", plural: "oz" },
  cup: { singular: "cup", plural: "cups" },
  tbsp: { singular: "tbsp", plural: "tbsp" },
  tsp: { singular: "tsp", plural: "tsp" },
  slice: { singular: "slice", plural: "slices" },
  leaf: { singular: "leaf", plural: "leaves" },
  clove: { singular: "clove", plural: "cloves" },
  stalk: { singular: "stalk", plural: "stalks" },
  bunch: { singular: "bunch", plural: "bunches" },
  scoop: { singular: "scoop", plural: "scoops" },
  unit: { singular: "", plural: "" },
};

export function formatMeasurement(quantity: number, unit: string): string {
  // "¼ cup", not "¼ cups" -- singular below one, plural at/above (matches
  // how quantities actually read in a recipe or on a shopping list).
  const isSingular = quantity <= 1;
  const label = UNIT_LABELS[unit];
  const unitText = label
    ? isSingular
      ? label.singular
      : label.plural
    : `${unit}${isSingular ? "" : "s"}`;
  return `${formatQuantity(quantity)} ${unitText}`.trim();
}
