// PostgREST (Supabase) devuelve como máximo 1000 filas por consulta aunque se pida un `.limit()` mayor
// (max-rows del proyecto), y lo hace EN SILENCIO: un `.limit(20000)` sobre 3000 filas trae 1000 y nadie se
// entera. Para totales, estadísticas o exportaciones que necesitan TODAS las filas hay que leer por páginas.
//
// Uso: `const filas = await leerTodo((desde, hasta) => supabase.from("t").select("a, b").order("id").range(desde, hasta));`
// Cada página debe construir una consulta NUEVA (los builders de supabase-js son mutables) y ordenar por una
// columna estable, o las páginas pueden repetir o saltarse filas.

export const FILAS_POR_PAGINA = 1000;

export async function leerTodo<T>(pagina: (desde: number, hasta: number) => PromiseLike<{ data: T[] | null; error?: unknown }>): Promise<T[]> {
  const todo: T[] = [];
  for (let desde = 0; ; desde += FILAS_POR_PAGINA) {
    const { data } = await pagina(desde, desde + FILAS_POR_PAGINA - 1);
    const filas = data ?? [];
    todo.push(...filas);
    if (filas.length < FILAS_POR_PAGINA) return todo;
  }
}
