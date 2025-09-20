"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    async function check() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session) {
        // Falls nicht eingeloggt → auf /auth schicken, inkl. späterer Rückkehr
        const next = encodeURIComponent(pathname || "/");
        router.replace(`/auth?next=${next}`);
        return;
      }
      setReady(true);
    }
    check();

    // Session-Änderungen live berücksichtigen
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!session) {
        const next = encodeURIComponent(pathname || "/");
        router.replace(`/auth?next=${next}`);
      }
    });
    return () => {
      mounted = false;
      sub.subscription?.unsubscribe();
    };
  }, [router, pathname]);

  if (!ready) {
    return (
      <div className="p-6 text-sm text-gray-600">Prüfe Anmeldung…</div>
    );
  }

  return <>{children}</>;
}
