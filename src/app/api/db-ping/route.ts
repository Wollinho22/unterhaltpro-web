import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const { error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message, details: error },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
