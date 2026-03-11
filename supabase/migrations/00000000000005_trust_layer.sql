-- Phase 7: Trust Layer & Reputation Systems

-- 1. Reviews Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
  customer_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES providers(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);

-- 2. Providers Verification & Trust Extension
ALTER TABLE providers 
  ADD COLUMN verification_documents TEXT[],
  ADD COLUMN verification_completed_at TIMESTAMPTZ,
  ADD COLUMN trust_score DECIMAL(5, 2) DEFAULT 0.00;

-- 3. Dispute Status & Disputes Table
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved', 'rejected');

CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES providers(id),
  dispute_reason TEXT NOT NULL,
  dispute_description TEXT NOT NULL,
  status dispute_status DEFAULT 'open',
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_booking_id ON disputes(booking_id);

-- 4. Supabase Storage for Verification Documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'provider-verification', 
  'provider-verification', 
  false, -- Highly Private bucket
  10485760, -- 10MB limit per doc
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
) ON CONFLICT DO NOTHING;

-- Storage Policies for Verification Documents
CREATE POLICY "Providers can upload verification docs" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'provider-verification');

CREATE POLICY "Only Admins can read verification docs" ON storage.objects 
FOR SELECT TO authenticated 
USING (bucket_id = 'provider-verification' AND auth.jwt() ->> 'role' = 'admin');
