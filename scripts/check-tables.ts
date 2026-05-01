import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8").split("\n").forEach((line) => {
    const [key, ...v] = line.split("=");
    if (key && v.length) process.env[key.trim()] = v.join("=").trim();
  });
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const tables = ["vehicles", "maintenance_records", "incidents", "operational_centers", "suppliers", "fuel_logs", "roles", "user_profiles"];

async function main() {
  console.log("Verificando tablas...");
  for (const t of tables) {
    const { error } = await admin.from(t).select("*", { count: "exact", head: true });
    console.log(`  ${error ? "❌ FALTA" : "✅ OK   "} ${t}${error ? " → " + error.message : ""}`);
  }
}

main().catch(console.error);
