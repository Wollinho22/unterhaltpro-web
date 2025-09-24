export type MonthValue = number | null | undefined;

export type Deductions = {
  berufsbedingt?: number;
  kranken_pflege?: number;
  schulden?: number;
  weitere?: number;
};

export function avg12m(values: MonthValue[]): number {
  const nums = values.map(v => (typeof v === "number" && isFinite(v) ? v : null)).filter(v => v !== null) as number[];
  if (nums.length === 0) return 0;
  const sum = nums.reduce((a, b) => a + b, 0);
  return sum / 12; // auf 12 Monate verteilt (glättet Lücken)
}

export function sumDeductions(d: Deductions): number {
  return ["berufsbedingt", "kranken_pflege", "schulden", "weitere"]
    .map((k) => (d as any)[k])
    .reduce((acc, v) => acc + (typeof v === "number" && isFinite(v) ? v : 0), 0);
}

/** Vorverarbeitung: Durchschnitt minus Abzüge → bereinigtes Netto (ohne Rechenkern zu ändern) */
export function computeBereinigtesNetto(monthlyNet: MonthValue[], deductions: Deductions): number {
  const durchschnitt = avg12m(monthlyNet);
  const abzuege = sumDeductions(deductions);
  const result = Math.max(0, durchschnitt - abzuege);
  return Math.round(result * 100) / 100;
}
