-- Team Members Table
-- Run this in your Supabase SQL Editor

CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NULL,
  designation text NULL,
  quote text NULL,
  image text NULL,
  status text NULL DEFAULT 'active',
  order_index integer NULL,
  CONSTRAINT team_members_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Add RLS (Row Level Security) policies for team_members table
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Allow public to read team members
CREATE POLICY "Allow public read access" ON public.team_members
FOR SELECT USING (true);

-- Allow authenticated users to insert team members
CREATE POLICY "Allow authenticated insert" ON public.team_members
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update team members
CREATE POLICY "Allow authenticated update" ON public.team_members
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete team members
CREATE POLICY "Allow authenticated delete" ON public.team_members
FOR DELETE USING (auth.role() = 'authenticated');

-- Create an index on order_index for better performance when ordering
CREATE INDEX idx_team_members_order ON public.team_members(order_index);

-- Create an index on status for filtering active/inactive members
CREATE INDEX idx_team_members_status ON public.team_members(status);