export const metadata = { title: "Offline – UnterhaltPro 2025" };

export default function OfflinePage() {
  return (
    <main className="max-w-xl mx-auto py-10">
      <h1 className="text-xl font-semibold">Offline</h1>
      <p className="text-gray-700 mt-2">
        Es besteht aktuell keine Internetverbindung. Einige Inhalte sind evtl. aus dem Cache verfügbar.
      </p>
      <p className="text-gray-700 mt-2">
        Sobald die Verbindung wieder da ist, laden Sie die Seite neu.
      </p>
      <a href="/" className="inline-block mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        Zur Startseite
      </a>
    </main>
  );
}
