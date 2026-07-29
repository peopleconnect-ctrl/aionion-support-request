-- ========================================================
-- SUPABASE DATABASE SCHEMA FOR AIONION SUPPORT REQUESTS
-- Paste this script in Supabase SQL Editor and click 'RUN'
-- ========================================================

-- 1. Create support_requests table
CREATE TABLE IF NOT EXISTS public.support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    employee_code TEXT,
    department TEXT NOT NULL,
    email TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    branch_location TEXT NOT NULL,
    request_category TEXT NOT NULL,
    target_audience TEXT,
    purpose_of_request TEXT NOT NULL,
    required_by DATE NOT NULL,
    priority_level TEXT DEFAULT 'Normal',
    approver_name TEXT NOT NULL,
    approver_email TEXT NOT NULL,
    approver_department TEXT NOT NULL,
    reference_file_urls JSONB DEFAULT '[]'::jsonb,
    approval_file_urls JSONB DEFAULT '[]'::jsonb,
    deliverable_file_urls JSONB DEFAULT '[]'::jsonb,
    completion_notes TEXT,
    assigned_to TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

-- If table already exists, add new columns:
ALTER TABLE public.support_requests ADD COLUMN IF NOT EXISTS deliverable_file_urls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.support_requests ADD COLUMN IF NOT EXISTS completion_notes TEXT;
ALTER TABLE public.support_requests ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE public.support_requests ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Allow public submissions" ON public.support_requests;
CREATE POLICY "Allow public submissions" ON public.support_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read access" ON public.support_requests;
CREATE POLICY "Allow read access" ON public.support_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update access" ON public.support_requests;
CREATE POLICY "Allow update access" ON public.support_requests FOR UPDATE USING (true);

-- ========================================================
-- STORAGE BUCKET SETUP INSTRUCTIONS
-- ========================================================
-- Go to Supabase Dashboard -> Storage -> Create new bucket:
-- Bucket Name: support-attachments
-- Public Bucket: YES (Toggle ON)
