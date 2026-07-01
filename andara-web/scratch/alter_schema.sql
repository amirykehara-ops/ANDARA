-- ANDARA CRM Fase 2: Schema Migration for Show-up Tracking
-- Ejecuta este script en el editor SQL de Supabase.

-- 1. Agrega el campo attendance_status y ai_score a la tabla leads
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS attendance_status TEXT DEFAULT 'pendiente' 
CHECK (attendance_status IN ('pendiente', 'asistio', 'no-show')),
ADD COLUMN IF NOT EXISTS ai_score TEXT CHECK (ai_score IN ('Alto', 'Medio', 'Bajo'));

-- 2. Agrega el campo attendance_status a la tabla calendar_events
ALTER TABLE public.calendar_events 
ADD COLUMN IF NOT EXISTS attendance_status TEXT DEFAULT 'pendiente' 
CHECK (attendance_status IN ('pendiente', 'asistio', 'no-show'));
