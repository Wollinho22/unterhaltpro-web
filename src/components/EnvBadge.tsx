"use client";

export default function EnvBadge() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "n/a";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "n/a";

  const host = (() => {
    try {
      const u = new URL(url);
      return u.host;
    } catch {
      return url;
    }
  })();

  const keyMasked = key === "n/a" ? "n/a" : key.slice(0, 6) + "…" + key.slice(-4);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 12,
        right: 12,
        background: "#eef2ff",
        border: "1px solid #c7d2fe",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
        zIndex: 1000,
      }}
    >
      <div><strong>ENV (Dev)</strong></div>
      <div>SUPABASE_HOST: {host}</div>
      <div>ANON_KEY: {keyMasked}</div>
    </div>
  );
}
