-- Phase 3: Provider Infrastructure & Scalability

-- 1. Create Verification Status Enum
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

-- 2. Alter Providers table to support deep discovery and profile data
ALTER TABLE providers 
ADD COLUMN display_name TEXT,
ADD COLUMN service_categories TEXT[] DEFAULT '{}',
ADD COLUMN service_area TEXT,
ADD COLUMN verification_status verification_status DEFAULT 'pending',
ADD COLUMN portfolio_images TEXT[] DEFAULT '{}',
ADD COLUMN total_reviews INTEGER DEFAULT 0,
ADD COLUMN response_time INTEGER, -- e.g., in minutes
ADD COLUMN completed_jobs INTEGER DEFAULT 0;

-- Drop the old boolean verified column
ALTER TABLE providers DROP COLUMN IF EXISTS verified;

-- 3. High-Performance Indexes for Marketplace Search Engine
-- GIN index for rapid array intersection (category filtering)
CREATE INDEX idx_providers_service_categories ON providers USING GIN(service_categories);
-- B-Tree index for geographic/city filtering
CREATE INDEX idx_providers_service_area ON providers(service_area);
-- Indexes for sorting top-rated and fastest responders
CREATE INDEX idx_providers_avg_rating ON providers(avg_rating DESC);
CREATE INDEX idx_providers_response_time ON providers(response_time ASC);

-- 4. Supabase Storage for Provider Portfolios
-- Ensure storage extension and schema exists (standard on Supabase)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'portfolio-images', 
  'portfolio-images', 
  true,
  5242880, -- 5MB limit per image
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT DO NOTHING;

-- Policies for CDN and Uploads
-- Public can view portfolio images
CREATE POLICY "Public Portfolio Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'portfolio-images');

-- Authenticated providers can upload their own portfolio images
CREATE POLICY "Provider Portfolio Upload" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'portfolio-images');

CREATE POLICY "Provider Portfolio Update" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id = 'portfolio-images');

CREATE POLICY "Provider Portfolio Delete" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'portfolio-images');
