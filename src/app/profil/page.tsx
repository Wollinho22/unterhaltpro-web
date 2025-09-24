"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import EnvBadge from "@/components/EnvBadge";

type Profile = { id: string; email: string | null; full_name: string | null; created_at: string; updated_at: string };

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // 1) Sicherstellen, dass Session vorhanden ist (PKCE kann ~1s brauchen)
        let { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          await new Promise((r) => setTimeout(r, 600));
          sessionData = (await supabase.auth.getSession()).data;
        }
        if (!sessionData.session) {
          setError("Nicht angemeldet. Bitte über /auth einloggen und den E-Mail-Link direkt anklicken.");
          setLoading(false);
          return;
        }

        const uid = sessionData.session.user.id;
        const email = sessionData.session.user.email ?? null;

        // 2) WICHTIG: ohne Schema-Präfix, weil Schema bereits 'app' ist
        const res = await supabase
          .from("profiles")
          .select("id, email, full_name, created_at, updated_at")
          .eq("id", uid)
          .maybeSingle();

        if (res.error && res.error.code !== "PGRST116") throw res.error;

        let p = res.data as Profile | null;

        if (!p) {
          const ins = await supabase.from("profiles").insert({ id: uid, email }).select().single();
          if (ins.error) throw ins.error;
          p = ins.data as Profile;
        }

        if (!cancelled) {
          setProfile(p);
          setFullName(p.full_name ?? "");
        }
      } catch (e: any) {
        if (!cancelled) setError(`${e?.message || "Unbekannter Fehler"}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const sub = supabase.auth.onAuthStateChange((_e) => load());
    return () => {
      cancelled = true;
      sub.data.subscription.unsubscribe();
    };
  }, []);

  async function save() {
    if (!profile) return;
    const upd = await supabase.from("profiles").update({ full_name: fullName }).eq("id", profile.id).select().single();
    if (upd.error) {
      setError(`Update-Fehler: ${upd.error.message}`);
    } else {
      setProfile(upd.data as Profile);
    }
  }

  if (loading) return <main className="p-6">Lade…<EnvBadge /></main>;

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold mb-2">Profil</h1>
        <div className="rounded border border-yellow-300 bg-yellow-50 p-3 text-sm">
          <p className="font-medium">Hinweis</p>
          <pre className="whitespace-pre-wrap text-yellow-800">{error}</pre>
        </div>
        <p className="mt-3 text-sm">
          <a className="text-blue-700 underline" href="/auth">Zur Anmeldung</a>
        </p>
        <EnvBadge />
      </main>
    );
  }

  if (!profile) return <main className="p-6">Profil nicht gefunden.<EnvBadge /></main>;

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Profil</h1>
      <div className="space-y-2">
        <div className="text-sm text-gray-600">ID: {profile.id}</div>
        <div className="text-sm text-gray-600">E-Mail: {profile.email ?? "—"}</div>
      </div>
      <label className="block">
        <span className="text-sm">Vollständiger Name</span>
        <input
          className="mt-1 w-full rounded border p-2"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ihr Name"
        />
      </label>
      <button onClick={save} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        Speichern
      </button>
      <EnvBadge />
    </main>
  );
}
