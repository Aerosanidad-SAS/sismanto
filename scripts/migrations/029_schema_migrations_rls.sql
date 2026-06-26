-- Migration 029: Proteger tabla interna schema_migrations
-- Supabase lint: "RLS Disabled in Public Entity: public.schema_migrations"
-- schema_migrations es solo para el script db:apply (service_role directo).
-- anon y authenticated nunca deben leerla ni escribirla via PostgREST.

REVOKE ALL ON public.schema_migrations FROM anon, authenticated;
ALTER TABLE public.schema_migrations ENABLE ROW LEVEL SECURITY;
-- Sin políticas = denegación implícita para todo rol no privilegiado.
