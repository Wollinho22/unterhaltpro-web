export default function Page() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">UnterhaltPro 2025</h1>
      <p className="text-gray-700">
        Web-App für die Berechnung von Kindesunterhalt nach Düsseldorfer Tabelle 2025
        (BGB §§ 1601 ff., Leitlinien: BKB, Selbstbehalt, Herab-/Heraufstufung, Mangelfall-Quote).
      </p>
      <ul className="list-disc pl-5 text-gray-700">
        <li>Geführter Assistent, transparente Rechenwege</li>
        <li>PDF-Export (später serverseitig in EU-Storage)</li>
        <li>Monetarisierung via Stripe (Abo/Einmalzahlungen)</li>
      </ul>
      <a
        href="/rechner"
        className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Zum Rechner
      </a>
    </section>
  );
}
