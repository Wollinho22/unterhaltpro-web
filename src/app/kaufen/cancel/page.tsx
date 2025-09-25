export default function CancelPage() {
  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Vorgang abgebrochen</h1>
      <p>Der Kauf wurde abgebrochen. Du kannst es jederzeit erneut versuchen.</p>
      <p><a className="text-blue-700 underline" href="/kaufen">Zurück zur Kaufseite</a></p>
    </main>
  );
}
