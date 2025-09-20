"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function UserAuth() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Aktuelle Session laden
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
    // Auf Änderungen reagieren
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => { sub.subscription?.unsubscribe(); };
  }, []);

 if (email) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <a href="/profil" className="underline">Profil</a>
      <span className="text-gray-600 hidden sm:inline">Eingeloggt: {email}</span>
      <button
        className="rounded border px-2 py-1 hover:bg-gray-50"
        onClick={async () => { await supabase.auth.signOut(); }}
      >
        Abmelden
      </button>
    </div>
  );
}

  return (
    <a href="/auth" className="text-sm underline">Anmelden</a>
  );
}
