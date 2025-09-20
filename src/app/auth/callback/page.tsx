"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function getHashParams(): URLSearchParams {
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  const h = hash.startsWith("#") ? hash.slice(1) : hash;
  return new URLSearchParams(h);
}

export default function CallbackPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Anmeldung wird bestätigt…");

  useEffect(() => {
    async function run() {
      try {
        // 1) Wenn bereits eine Session existiert → direkt weiter
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          setMsg("Bereits angemeldet. Weiterleiten…");
          setTimeout(() => router.replace("/"), 500);
          return;
        }

        const url = new URL(window.location.href);

        // 2) Magic-Link (PKCE): ?code=... & ?code_verifier=...
        const code = url.searchParams.get("code");
        const verifier = url.searchParams.get("code_verifier");
        if (code && verifier) {
          const { error } = await supabase.auth.exchangeCodeForSession(url.toString());
          if (error) throw error;
          setMsg("Erfolgreich angemeldet. Weiterleiten…");
          setTimeout(() => router.replace("/"), 800);
          return;
        }

        // 3) Hash-Flow (z. B. access_token im Fragment)
        const hashParams = getHashParams();
        const access_token = hashParams.get("access_token");
        const refresh_token = hashParams.get("refresh_token");
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) throw error;
          setMsg("Erfolgreich angemeldet. Weiterleiten…");
          setTimeout(() => router.replace("/"), 800);
          return;
        }

        // 4) Fallback: nur ?code vorhanden
        if (code && !verifier) {
          const { error } = await supabase.auth.exchangeCodeForSession(url.toString());
          if (!error) {
            setMsg("Erfolgreich angemeldet. Weiterleiten…");
            setTimeout(() => router.replace("/"), 800);
            return;
          }
        }

        throw new Error(
          "Kein gültiger Anmeldecode gefunden. Öffnen Sie den Link im gleichen Browser und prüfen Sie die Redirect-URL."
        );
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setMsg(`Fehler bei der Anmeldung: ${msg || "Unbekannt"}`);
      }
    }
    run();
  }, [router]);

  return (
    <main className="max-w-md mx-auto py-10">
      <h1 className="text-xl font-semibold">Anmeldung</h1>
      <p className="mt-3 text-gray-700">{msg}</p>
      <div className="mt-4 text-sm text-gray-600 space-y-1">
        <p>Tipps bei Problemen:</p>
        <ul className="list-disc pl-5">
          <li>Öffnen Sie den E-Mail-Link im <strong>gleichen Browser</strong>, in dem die App geöffnet ist.</li>
          <li>Prüfen Sie in Supabase unter <em>Authentication → URL Configuration</em>, dass
            <code className="mx-1">/auth/callback</code> als Redirect-URL exakt eingetragen ist.</li>
          <li>Falls der Link in einer externen App geöffnet wurde, kopieren Sie die <strong>gesamte URL</strong> in die Adresszeile Ihres Browsers.</li>
        </ul>
      </div>
    </main>
  );
}
