"use client";

import { useMemo, useState } from "react";
import { computeBereinigtesNetto, Deductions, MonthValue, avg12m, sumDeductions } from "@/lib/income/normalizer";

export default function IncomeNormalizer({
  onApply,
}: {
  onApply?: (bereinigtesNetto: number) => void;
}) {
  const [months, setMonths] = useState<MonthValue[]>(Array(12).fill(null));
  const [ded, setDed] = useState<Deductions>({});

  function setMonth(i: number, v: string) {
    const n = v.trim() === "" ? null : Number(v.replace(",", "."));
    setMonths((prev) => prev.map((x, idx) => (idx === i ? (isFinite(n as number) ? (n as number) : null) : x)));
  }

  const avg = useMemo(() => avg12m(months), [months]);
  const dedSum = useMemo(() => sumDeductions(ded), [ded]);
  const netto = useMemo(() => computeBereinigtesNetto(months, ded), [months, ded]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold">Einkommen der letzten 12 Monate</h2>
        <p className="text-sm text-gray-600 mb-2">
          Trage dein <em>Nettoeinkommen</em> je Monat ein (leer lassen, wenn unbekannt).
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {months.map((v, i) => (
            <label key={i} className="text-sm">
              <span className="block text-gray-600">Monat {i + 1}</span>
              <input
                className="mt-1 w-full rounded border p-2"
                inputMode="decimal"
                placeholder="z. B. 2.450,00"
                value={v ?? ""}
                onChange={(e) => setMonth(i, e.target.value)}
              />
            </label>
          ))}
        </div>
        <div className="mt-3 text-sm text-gray-700">
          Durchschnitt (12M, auf 12 verteilt): <strong>{avg.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</strong>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Abzüge (optional, monatlich)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label className="text-sm">
            <span className="block text-gray-600">Berufsbedingte Aufwendungen</span>
            <input
              className="mt-1 w-full rounded border p-2"
              inputMode="decimal"
              placeholder="z. B. 100,00"
              onChange={(e) => setDed({ ...ded, berufsbedingt: toNum(e.target.value) })}
            />
          </label>
          <label className="text-sm">
            <span className="block text-gray-600">Kranken-/Pflegeversicherung (privat)</span>
            <input
              className="mt-1 w-full rounded border p-2"
              inputMode="decimal"
              placeholder="z. B. 350,00"
              onChange={(e) => setDed({ ...ded, kranken_pflege: toNum(e.target.value) })}
            />
          </label>
          <label className="text-sm">
            <span className="block text-gray-600">Schulden (anrechenbar)</span>
            <input
              className="mt-1 w-full rounded border p-2"
              inputMode="decimal"
              placeholder="z. B. 150,00"
              onChange={(e) => setDed({ ...ded, schulden: toNum(e.target.value) })}
            />
          </label>
          <label className="text-sm">
            <span className="block text-gray-600">Weitere Abzüge</span>
            <input
              className="mt-1 w-full rounded border p-2"
              inputMode="decimal"
              placeholder="z. B. 0,00"
              onChange={(e) => setDed({ ...ded, weitere: toNum(e.target.value) })}
            />
          </label>
        </div>
        <div className="mt-3 text-sm text-gray-700">
          Summe Abzüge: <strong>{dedSum.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</strong>
        </div>
      </section>

      <section className="rounded border p-3 bg-gray-50 text-sm">
        <div>
          <span className="text-gray-600">Bereinigtes Netto (Vorverarbeitung): </span>
          <strong>{netto.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</strong>
        </div>
        <p className="mt-2 text-gray-600">
          Hinweis: Dies ist eine <em>Vorverarbeitung</em> deiner Eingaben. Der eigentliche Rechenkern bleibt unverändert.
        </p>
        <div className="mt-3">
          <button
            className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
            onClick={() => onApply?.(netto)}
          >
            Wert in den Rechner übernehmen
          </button>
        </div>
      </section>
    </div>
  );
}

function toNum(v: string): number | undefined {
  const n = v.trim() === "" ? undefined : Number(v.replace(",", "."));
  return typeof n === "number" && isFinite(n) ? n : undefined;
}
