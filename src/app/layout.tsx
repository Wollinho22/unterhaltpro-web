export const metadata = {
  title: "UnterhaltPro 2025",
  description: "Kindesunterhalt-Rechner DE (Düsseldorfer Tabelle 2025)",
};

import Link from "next/link";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <nav className="mx-auto max-w-5xl flex gap-4 items-center p-3">
            <Link href="/" className="font-semibold">UnterhaltPro 2025</Link>
            <div className="text-sm text-gray-400">|</div>
            <Link href="/rechner" className="text-sm hover:underline">Rechner</Link>
            <div className="ml-auto flex gap-4 text-sm">
              <Link href="/impressum" className="hover:underline">Impressum</Link>
              <Link href="/datenschutz" className="hover:underline">Datenschutz</Link>
              <Link href="/agb" className="hover:underline">AGB</Link>
              <Link href="/widerruf" className="hover:underline">Widerruf</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl p-4">{children}</main>
        <footer className="mx-auto max-w-5xl p-6 text-xs text-gray-500">
          © 2025 UnterhaltPro – Info-Tool, keine Rechtsberatung. Prüfen Sie stets die aktuellen Veröffentlichungen des OLG Düsseldorf und Ihrer OLG-Leitlinien.
        </footer>
      </body>
    </html>
  );
}
