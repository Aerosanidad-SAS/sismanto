/**
 * One-shot script: registers a Microsoft Graph webhook subscription for the
 * OneDrive input folder and stores the subscription ID in Supabase.
 *
 * Usage:
 *   npx tsx scripts/register-onedrive-webhook.ts
 *
 * Requires these env vars in .env.local:
 *   AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET,
 *   ONEDRIVE_USER_ID, ONEDRIVE_INPUT_FOLDER_ID, GRAPH_WEBHOOK_SECRET,
 *   NEXT_PUBLIC_APP_URL (e.g. https://aeromanto.vercel.app),
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

import { registerWebhookSubscription } from "../src/lib/graph/client";
import { createClient } from "@supabase/supabase-js";

async function main() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is not set");

  const notificationUrl = `${appUrl}/api/webhooks/onedrive`;
  console.log(`Registering webhook → ${notificationUrl}`);

  const { id, expirationDateTime } = await registerWebhookSubscription(notificationUrl);
  console.log(`✓ Subscription ID: ${id}`);
  console.log(`  Expires: ${expirationDateTime}`);

  // Persist subscription ID so the renew cron can find it
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { error } = await supabase.from("onedrive_subscriptions").upsert(
    {
      id,
      resource:             `/users/${process.env.ONEDRIVE_USER_ID}/drive/items/${process.env.ONEDRIVE_INPUT_FOLDER_ID}/children`,
      notification_url:     notificationUrl,
      expiration_datetime:  expirationDateTime,
    },
    { onConflict: "id" }
  );

  if (error) throw new Error(`Failed to persist subscription: ${error.message}`);
  console.log("✓ Subscription saved to Supabase.");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
