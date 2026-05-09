-- schema.sql
-- Andara Web Platform Database Schema (Supabase PostgreSQL)

-- 1. Profiles Table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    bio TEXT,
    location TEXT,
    whatsapp_link TEXT,
    verified_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tours Table
CREATE TABLE tours (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    guide_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD', -- 'USD' or 'PEN'
    duration TEXT NOT NULL, -- e.g., '2 hours', 'Half day'
    capacity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Availability Table
CREATE TABLE availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    slots_available INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'open', -- 'open' or 'closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tour_id, date)
);

-- 4. Bookings Table
CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tour_id UUID REFERENCES tours(id) ON DELETE RESTRICT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
    payment_status TEXT NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'paid', 'refunded'
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Leads CRM Table
CREATE TABLE leads_crm (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    guide_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    source TEXT NOT NULL, -- 'WhatsApp', 'Instagram', 'Web'
    intent_score TEXT NOT NULL DEFAULT 'cold', -- 'cold', 'warm', 'hot'
    last_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Tours
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tours are viewable by everyone." ON tours FOR SELECT USING (true);
CREATE POLICY "Guides can insert their own tours." ON tours FOR INSERT WITH CHECK (auth.uid() = guide_id);
CREATE POLICY "Guides can update their own tours." ON tours FOR UPDATE USING (auth.uid() = guide_id);
CREATE POLICY "Guides can delete their own tours." ON tours FOR DELETE USING (auth.uid() = guide_id);

-- Availability
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Availability is viewable by everyone." ON availability FOR SELECT USING (true);
CREATE POLICY "Guides can manage availability of their tours." ON availability FOR ALL USING (
    EXISTS (SELECT 1 FROM tours WHERE tours.id = availability.tour_id AND tours.guide_id = auth.uid())
);

-- Bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guides can view bookings for their tours." ON bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM tours WHERE tours.id = bookings.tour_id AND tours.guide_id = auth.uid())
);
CREATE POLICY "Guides can update bookings for their tours." ON bookings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM tours WHERE tours.id = bookings.tour_id AND tours.guide_id = auth.uid())
);

-- Leads CRM
ALTER TABLE leads_crm ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guides can manage their own leads." ON leads_crm FOR ALL USING (auth.uid() = guide_id);
