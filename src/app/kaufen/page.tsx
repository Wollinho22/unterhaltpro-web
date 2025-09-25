"use client";

import { useState } from "react";

export default function KaufenPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_TEST_PRICE_ID || "";

  async function go() {
    setErr(null);
    if (!PRICE_ID) {
      setErr("Konfiguration fehlt: NEXT_PUBLIC_STRIPE_TEST_PRICE_ID ist nicht gesetzt.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: PRICE_ID }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unbekannter Fehler");
      window.location.href = data.url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Checkout fehlgeschlagen";
      setErr(msg);
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">UnterhaltPro Premium</h1>
      <p>Schalte Premium frei (monatlich 99,99 €) – inkl. 12-Monats-Einkommensnormalisierung & vollständigem PDF.</p>

      <button
        onClick={go}
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Weiter zu Stripe…" : "Jetzt freischalten"}
      </button>

      {err && (
        <div className="mt-3 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {!PRICE_ID && (
        <p className="text-xs text-gray-500">
          Hinweis (Dev): Setze <code>NEXT_PUBLIC_STRIPE_TEST_PRICE_ID</code> in deiner <code>.env.local</code>.
        </p>
      )}

      <div className="text-xs text-gray-500 mt-6">
        Testmodus: Kartennummer <code>4242 4242 4242 4242</code>, beliebiges Datum, CVC z. B. <code>123</code>.
      </div>
    </main>
  );
}
