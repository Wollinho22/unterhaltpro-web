"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function PremiumOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) return setAllowed(false);
        const uid = u.user.id;
        const res = await supabase.from("profiles").select("has_active_plan").eq("id", uid).maybeSingle();
        if (res.error) throw res.error;
        setAllowed(!!res.data?.has_active_plan);
      } catch {
        setAllowed(false);
      }
    })();
  }, []);

  if (allowed === null) return <div>Lade Premium-Status…</div>;
  if (!allowed) {
    return (
      fallback ?? (
        <div className="rounded border p-4 bg-yellow-50">
          <p className="mb-2">
            Diese Funktion ist Teil von <strong>UnterhaltPro Premium</strong>.
          </p>
          <a href="/kaufen" className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Jetzt freischalten
          </a>
        </div>
      )
    );
  }
  return <>{children}</>;
}
