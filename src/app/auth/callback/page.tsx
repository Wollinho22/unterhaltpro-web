"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CallbackPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Anmeldung wird bestätigt…");

  useEffect(() => {
    // Supabase wertet dank detectSessionInUrl=true die URL selbst aus (PKCE).
    const sub = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setMsg("Erfolgreich angemeldet. Weiterleiten…");
        setTimeout(() => router.replace("/profil"), 400);
      }
    });

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setMsg("Bereits angemeldet. Weiterleiten…");
        setTimeout(() => router.replace("/profil"), 300);
      } else {
        // kurze Gnadenfrist, damit Supabase code↔verifier tauschen kann
        setTimeout(async () => {
          const { data: d2 } = await supabase.auth.getSession();
          if (!d2.session) {
            setMsg(
              "Kein Anmeldecode gefunden. Bitte den E-Mail-Link direkt im gleichen Safari-Fenster anklicken oder Anmeldung neu starten."
            );
          }
        }, 1200);
      }
    })();

    return () => sub.data.subscription.unsubscribe();
  }, [router]);

  return (
    <main className="max-w-md mx-auto py-10">
      <h1 className="text-xl font-semibold">Anmeldung</h1>
      <p className="mt-3 text-gray-700">{msg}</p>
    </main>
  );
}
