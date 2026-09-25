import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renewWebhookSubscription } from "@/lib/graph/client";

export async function POST(request: NextRequest): Promise<Response> {
  const cronSecret = process.env.CRON_SECRET;
  // Fail-closed: sin secreto configurado se rechaza todo (antes quedaba abierto a cualquiera).
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: subs, error } = await supabase
    .from("onedrive_subscriptions")
    .select("id, expiration_datetime");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!subs || subs.length === 0) {
    return NextResponse.json({ renewed: 0, message: "No subscriptions found" });
  }

  const results: Array<{ id: string; newExpiry: string }> = [];

  for (const sub of subs) {
    const newExpiry = await renewWebhookSubscription(sub.id);
    await supabase
      .from("onedrive_subscriptions")
      .update({ expiration_datetime: newExpiry })
      .eq("id", sub.id);
    results.push({ id: sub.id, newExpiry });
  }

  return NextResponse.json({ renewed: results.length, results });
}

export const GET = POST;
