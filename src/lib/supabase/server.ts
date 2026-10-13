import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies, type UnsafeUnwrappedCookies } from 'next/headers';
import type { Database } from './database.types';

export function createClient(): SupabaseClient<Database> {
  // Next 15 volvió asíncrono `cookies()`. Esta función es síncrona y la llaman ~320 lugares (`createClient()` sin
  // `await`), y `@supabase/ssr` 0.1 pide un `get/set/remove` síncrono, así que se usa el acceso síncrono de
  // compatibilidad que Next 15 mantiene (el tipo `UnsafeUnwrappedCookies`; en desarrollo avisa en consola, en
  // producción no). DEUDA PARA NEXT 16, que lo elimina: volver `createClient` asíncrono (`await cookies()`),
  // agregar `await` en sus llamadas y subir `@supabase/ssr` a una versión con la API `getAll/setAll`.
  const cookieStore = cookies() as unknown as UnsafeUnwrappedCookies;

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  ) as unknown as SupabaseClient<Database>;
}
