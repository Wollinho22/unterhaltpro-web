"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/require-auth";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
};

export default function ProfilPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);

        // 0) User-ID & E-Mail aus Session
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData.user?.id;
        const email = userData.user?.email ?? null;
        if (!uid) throw new Error("Keine Session gefunden");

        // 1) Profil versuchen zu lesen (maybeSingle: 406 = nicht vorhanden)
const {
  data: fetched,
  error: fetchError,
  status: fetchStatus,
} = await supabase
  .from("app.profiles")
  .select("id, email, full_name, created_at, updated_at")
  .eq("id", uid)
  .maybeSingle();

// Debug-Hilfe: Fehler verständlich aufbereiten
if (fetchError && fetchStatus !== 406) {
  const readable =
    (fetchError as any)?.message ||
    JSON.stringify(fetchError, Object.getOwnPropertyNames(fetchError));
  throw new Error(`Fetch error (${fetchStatus}): ${readable}`);
}

let data = fetched;

// 2) Wenn nicht vorhanden: automatisch anlegen (RLS-Insert-Policy erforderlich)
if ((!data || fetchStatus === 406) && !fetchError) {
  const { error: insErr } = await supabase
    .from("app.profiles")
    .insert({ id: uid, email });
  if (insErr) {
    const readable =
      (insErr as any)?.message ||
      JSON.stringify(insErr, Object.getOwnPropertyNames(insErr));
    throw new Error(`Insert error: ${readable}`);
  }

  // 3) Danach erneut lesen
  const { data: data2, error: err2 } = await supabase
    .from("app.profiles")
    .select("id, email, full_name, created_at, updated_at")
    .eq("id", uid)
    .single();
  if (err2) {
    const readable =
      (err2 as any)?.message ||
      JSON.stringify(err2, Object.getOwnPropertyNames(err2));
    throw new Error(`Reload error: ${readable}`);
  }
  data = data2;
}

        if (!mounted) return;

        const p = data as Profile;
        setProfile(p);
        setFullName(p.full_name || "");
      } catch (e: unknown) {
        const m = e instanceof Error ? e.message : String(e);
        setMsg(m || "Fehler beim Laden des Profils");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function save() {
    try {
      setMsg(null);
      if (!profile) return;
      const { error } = await supabase
        .from("app.profiles")
        .update({ full_name: fullName })
        .eq("id", profile.id);
      if (error) throw error;
      setMsg("Gespeichert.");
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : String(e);
      setMsg(m || "Fehler beim Speichern");
    }
  }

   return (
    <RequireAuth>
      <main className="max-w-xl mx-auto py-8">
        <h1 className="text-xl font-semibold">Profil</h1>

        {loading ? (
          <p className="mt-3 text-gray-600">Lade Profil…</p>
        ) : profile ? (
          <div className="mt-4 space-y-4">
            <div className="rounded border bg-white p-4">
              <div className="text-sm text-gray-600">E-Mail</div>
              <div className="font-mono">{profile.email}</div>
            </div>

            <div className="rounded border bg-white p-4">
              <label className="block text-sm text-gray-600 mb-1">
                Vollständiger Name
              </label>
              <input
                className="w-full rounded border p-2"
                value={fullName}
                onChange={(ev) => setFullName(ev.target.value)}
                placeholder="Ihr Name (optional)"
              />
              <button
                onClick={save}
                className="mt-3 rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
              >
                Speichern
              </button>
              {msg && <p className="mt-2 text-sm text-gray-700">{msg}</p>}
            </div>

            <p className="text-xs text-gray-500">
              Hinweis: Profildaten werden DSGVO-konform in der EU gespeichert.
              Ihre E-Mail stammt aus dem Auth-System.
            </p>
          </div>
        ) : (
  <div className="mt-3">
    <p className="text-red-700">Profil nicht gefunden.</p>
    {msg && (
      <pre className="mt-2 text-xs text-gray-700 bg-gray-100 p-2 rounded overflow-auto">
        {msg}
      </pre>
    )}
  </div>
) }
      </main>
    </RequireAuth>
  );
}
