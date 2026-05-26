import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET — Microsoft Graph validation handshake
export async function GET(request: NextRequest): Promise<Response> {
  const token = request.nextUrl.searchParams.get("validationToken");
  if (!token) {
    return NextResponse.json({ error: "Missing validationToken" }, { status: 400 });
  }
  return new Response(token, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

interface GraphNotification {
  clientState?:     string;
  changeType?:      string;
  resourceData?:    { id?: string; name?: string };
  resource?:        string;
}

interface GraphPayload {
  value: GraphNotification[];
}

// POST — change notifications from Microsoft Graph
export async function POST(request: NextRequest): Promise<Response> {
  let payload: GraphPayload;
  try {
    payload = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const secret = process.env.GRAPH_WEBHOOK_SECRET;
  const notifications = payload?.value ?? [];

  if (notifications.length === 0) {
    return new Response(null, { status: 202 });
  }

  // Validate clientState on all notifications
  const invalid = notifications.some(
    (n) => secret && n.clientState !== secret
  );
  if (invalid) {
    return new Response(null, { status: 401 });
  }

  const supabase = createAdminClient();

  const rows = notifications
    .filter((n) => n.changeType === "created" && n.resourceData?.id)
    .map((n) => ({
      status:          "pending" as const,
      onedrive_item_id: n.resourceData!.id!,
      source_file_name: n.resourceData?.name ?? null,
      source_file_path: n.resource ?? null,
    }));

  if (rows.length > 0) {
    await supabase.from("invoice_jobs").insert(rows);
  }

  // 202 must be returned quickly — actual processing happens in the cron
  return new Response(null, { status: 202 });
}
