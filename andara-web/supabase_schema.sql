-- =========================================================================
-- ANDARA CRM - SQL Database Schema for Supabase (SaaS Multi-tenant)
-- Copy and paste this script into the Supabase SQL Editor to initialize all tables
-- =========================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: leads
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    guide_email TEXT NOT NULL, -- Associate leads with the guide who owns them
    name TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('whatsapp', 'instagram', 'facebook')),
    phone TEXT NOT NULL,
    interest TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'proposal', 'reserved', 'completed')),
    destination TEXT,
    travel_date TEXT,
    people_count INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and add basic policies
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON public.leads FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON public.leads FOR DELETE USING (true);

-- 2. Table: messages
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('client', 'guide')),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON public.messages FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON public.messages FOR DELETE USING (true);

-- 3. Table: calendar_events
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
    guide_email TEXT NOT NULL, -- Associate calendar events directly with the guide
    client_name TEXT NOT NULL,
    destination TEXT NOT NULL,
    date TEXT NOT NULL,
    people_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access" ON public.calendar_events FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.calendar_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON public.calendar_events FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON public.calendar_events FOR DELETE USING (true);

-- 4. Table: activity_logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id TEXT PRIMARY KEY,
    guide_email TEXT NOT NULL, -- Segregate logs by guide
    timestamp TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- 5. Table: guide_settings
CREATE TABLE IF NOT EXISTS public.guide_settings (
    id TEXT PRIMARY KEY, -- usually user email
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    agency_name TEXT,
    bio TEXT,
    location TEXT,
    whatsapp_link TEXT,
    languages TEXT,
    license TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.guide_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access" ON public.guide_settings FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert/update access" ON public.guide_settings FOR ALL USING (true);

-- 6. Table: incoming_webhooks (Used for real-time sync between Vercel serverless functions and frontend)
CREATE TABLE IF NOT EXISTS public.incoming_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guide_email TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.incoming_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access" ON public.incoming_webhooks FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.incoming_webhooks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous delete access" ON public.incoming_webhooks FOR DELETE USING (true);

-- 7. Table: linked_pages (SaaS Page connections mapping Page ID to Guide Email)
CREATE TABLE IF NOT EXISTS public.linked_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guide_email TEXT NOT NULL,
    page_id TEXT NOT NULL UNIQUE,
    page_name TEXT NOT NULL,
    page_access_token TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.linked_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access" ON public.linked_pages FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.linked_pages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous delete access" ON public.linked_pages FOR DELETE USING (true);
