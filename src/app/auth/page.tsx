"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | "loading" | "sent" | "error">(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function sendMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      setStatus("sent");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus("error");
      setErrorMsg(msg || "Unbekannter Fehler");
    }
  }

  return (
    <main className="max-w-md mx-auto py-10">
      <h1 className="text-xl font-semibold">Anmelden</h1>
      <p className="text-gray-700 mt-2">Wir senden Ihnen einen Anmeldelink per E-Mail (Magic-Link).</p>
      <form onSubmit={sendMagicLink} className="mt-6 space-y-3">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ihre E-Mail" className="w-full rounded border p-2" />
        <button type="submit" disabled={status === "loading"} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
          {status === "loading" ? "Senden…" : "Magic-Link senden"}
        </button>
      </form>
      {status === "sent" && (<p className="mt-4 text-green-700">Link gesendet. Bitte Postfach prüfen.</p>)}
      {status === "error" && (<p className="mt-4 text-red-700">Fehler: {errorMsg}</p>)}
      <Link href="/" className="inline-block mt-6 text-sm underline">Zurück zur Startseite</Link>
    </main>
  );
}
