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

function humanizeError(e: unknown): string {
  if (e instanceof Error) return e.message;
  try {
    if (typeof e === "object" && e !== null) {
      return JSON.stringify(e);
    }
    return String(e);
  } catch {
    return "Unbekannter Fehler";
  }
}

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
        const res = await supabase
          .from("profiles")
          .select("id, email, full_name, created_at, updated_at")
          .eq("id", uid)
          .maybeSingle();

        if (res.error && res.status !== 406) {
          throw new Error(`Fetch error (${res.status}): ${humanizeError(res.error)}`);
        }

        let data = res.data as Profile | null;

        // 2) Wenn nicht vorhanden: automatisch anlegen (RLS-Insert-Policy erforderlich)
        if ((!data || res.status === 406) && !res.error) {
          const ins = await supabase
            .from("profiles")
            .insert({ id: uid, email });
          if (ins.error) {
            throw new Error(`Insert error: ${humanizeError(ins.error)}`);
          }

          // 3) Danach erneut lesen
          const res2 = await supabase
            .from("profiles")
            .select("id, email, full_name, created_at, updated_at")
            .eq("id", uid)
            .single();
          if (res2.error) {
            throw new Error(`Reload error: ${humanizeError(res2.error)}`);
          }
          data = res2.data as Profile;
        }

        if (!mounted) return;

        if (data) {
          setProfile(data);
          setFullName(data.full_name || "");
        } else {
          setProfile(null);
          setMsg("Kein Profil-Datensatz gefunden.");
        }
      } catch (e: unknown) {
        setMsg(humanizeError(e));
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
      const upd = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", profile.id);
      if (upd.error) throw new Error(humanizeError(upd.error));
      setMsg("Gespeichert.");
    } catch (e: unknown) {
      setMsg(humanizeError(e));
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
        )}
      </main>
    </RequireAuth>
  );
}
