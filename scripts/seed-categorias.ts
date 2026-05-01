// Script para poblar las categorías de mantenimiento en Supabase
// Ejecutar con: npx tsx scripts/seed-categorias.ts

import { createClient } from "@supabase/supabase-js";
import { generarCategoriasParaDB } from "../src/lib/constants";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY deben estar configurados"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedCategorias() {
  console.log("Generando categorías...");
  const categorias = generarCategoriasParaDB();

  console.log(`Insertando ${categorias.length} categorías...`);

  const { error } = await supabase
    .from("maintenance_categories")
    .upsert(categorias, { onConflict: "nombre" });

  if (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  } else {
    console.log(`✅ Insertadas ${categorias.length} categorías`);
  }
}

seedCategorias()
  .then(() => {
    console.log("✅ Seed completado exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  });
