-- =========================================================================
-- ANDARA CRM - SQL Schema Update & RLS Fix in Supabase
-- Copy and paste this script into your Supabase SQL Editor and click 'Run'
-- to authorize access to the new Spanish tables and add fb_user_name column.
-- =========================================================================

-- 0. Update Table Structure
ALTER TABLE IF EXISTS public.paginas_vinculadas ADD COLUMN IF NOT EXISTS fb_user_name TEXT;

-- 1. Enable RLS on the new Spanish tables
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.eventos_calendario ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.registros_actividad ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.configuracion_guia ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mensajes_entrantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.paginas_vinculadas ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies for: paginas_vinculadas
DROP POLICY IF EXISTS "Permitir lectura anonima en paginas_vinculadas" ON public.paginas_vinculadas;
CREATE POLICY "Permitir lectura anonima en paginas_vinculadas" ON public.paginas_vinculadas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion anonima en paginas_vinculadas" ON public.paginas_vinculadas;
CREATE POLICY "Permitir insercion anonima en paginas_vinculadas" ON public.paginas_vinculadas FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion anonima en paginas_vinculadas" ON public.paginas_vinculadas;
CREATE POLICY "Permitir actualizacion anonima en paginas_vinculadas" ON public.paginas_vinculadas FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir eliminacion anonima en paginas_vinculadas" ON public.paginas_vinculadas;
CREATE POLICY "Permitir eliminacion anonima en paginas_vinculadas" ON public.paginas_vinculadas FOR DELETE USING (true);


-- 3. RLS Policies for: mensajes_entrantes
DROP POLICY IF EXISTS "Permitir lectura anonima en mensajes_entrantes" ON public.mensajes_entrantes;
CREATE POLICY "Permitir lectura anonima en mensajes_entrantes" ON public.mensajes_entrantes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion anonima en mensajes_entrantes" ON public.mensajes_entrantes;
CREATE POLICY "Permitir insercion anonima en mensajes_entrantes" ON public.mensajes_entrantes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir eliminacion anonima en mensajes_entrantes" ON public.mensajes_entrantes;
CREATE POLICY "Permitir eliminacion anonima en mensajes_entrantes" ON public.mensajes_entrantes FOR DELETE USING (true);


-- 4. RLS Policies for: configuracion_guia
DROP POLICY IF EXISTS "Permitir lectura anonima en configuracion_guia" ON public.configuracion_guia;
CREATE POLICY "Permitir lectura anonima en configuracion_guia" ON public.configuracion_guia FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir acceso total anonimo en configuracion_guia" ON public.configuracion_guia;
CREATE POLICY "Permitir acceso total anonimo en configuracion_guia" ON public.configuracion_guia FOR ALL USING (true);
