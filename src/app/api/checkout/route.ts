import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  try {
    // 1) Supabase-User sicher aus Cookies ermitteln
    const cookieStore = cookies();
    const headerStore = headers();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
        headers: {
          get(name: string) {
            return headerStore.get(name) ?? undefined;
          },
        },
      }
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }
    const user = userData.user;

    // 2) Body lesen (priceId aus UI)
    const body = await req.json().catch(() => ({}));
    const priceId = body?.priceId as string | undefined;

    if (!priceId) {
      return NextResponse.json({ error: "priceId fehlt" }, { status: 400 });
    }

    // 3) Checkout Session erzeugen (Subscription)
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      customer_email: user.email ?? undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/kaufen/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/kaufen/cancel`,
      metadata: { user_id: user.id },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Checkout-Fehler";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
