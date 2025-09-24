"use client";

import { useState } from "react";
import PremiumOnly from "@/components/PremiumOnly";
import IncomeNormalizer from "@/components/income/IncomeNormalizer";

export default function PremiumRechnerDemo() {
  const [bereinigtesNetto, setBereinigtesNetto] = useState<number | null>(null);

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Premium-Funktionen (Demo)</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Einkommens-Vorverarbeitung</h2>
        <PremiumOnly>
          <IncomeNormalizer onApply={(v) => setBereinigtesNetto(v)} />
        </PremiumOnly>
        {!bereinigtesNetto && (
          <p className="text-sm text-gray-600">
            Ergebnis erscheint hier, sobald du „Wert in den Rechner übernehmen“ klickst.
          </p>
        )}
      </section>

      <section className="rounded border p-3 bg-gray-50 text-sm">
        <h3 className="font-medium mb-1">Übernommener Wert</h3>
        <div>
          {bereinigtesNetto !== null ? (
            <>
              <div>
                <strong>{bereinigtesNetto.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</strong>
              </div>
              <p className="mt-2">
                Diesen Wert gibst du im bestehenden Rechner bei <em>bereinigtes Netto</em> ein (Rechenkern bleibt unverändert).
              </p>
            </>
          ) : (
            <span>—</span>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Vollständiges Ergebnisschreiben (PDF)</h2>
        <PremiumOnly>
          <div className="rounded border p-4 bg-white">
            {/* Hier wird später dein echter Schritt-6/PDF-Export gerendert */}
            <button className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
              PDF erzeugen (Premium)
            </button>
          </div>
        </PremiumOnly>
      </section>
    </main>
  );
}
