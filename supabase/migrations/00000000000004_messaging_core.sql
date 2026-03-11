-- Phase 6: Communication Layer & Real-time Messaging

-- 1. Create Message Types
CREATE TYPE message_type AS ENUM ('text', 'image', 'system');

-- 2. Modify existing Messages Table
ALTER TABLE messages RENAME COLUMN content TO message_content;
ALTER TABLE messages ADD COLUMN message_type message_type DEFAULT 'text';

-- 3. Additional index for chronological sorting
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- 4. Enable Row Level Security (RLS) on Messages
-- Assuming Clerk integration passes clerk_id in the Supabase JWT decoding, or through a custom function.
-- Here we establish the standard policies relying on user IDs or tracking it through the users mapping.
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Note: In a Clerk+Supabase integration, auth.uid() typically returns the Clerk User ID if configured via custom JWT template.
-- We will write a policy that joins bookings -> users to verify access.
CREATE POLICY "Users can view messages of their bookings" ON messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN users u ON (b.customer_id = u.id OR b.provider_id = u.id)
    WHERE b.id = messages.booking_id AND u.clerk_id = auth.uid()::text
  )
);

CREATE POLICY "Users can insert messages to their bookings" ON messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN users u ON (b.customer_id = u.id OR b.provider_id = u.id)
    WHERE b.id = messages.booking_id AND u.clerk_id = auth.uid()::text
  )
);

-- 5. Supabase Storage for Chat Attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'chat-attachments', 
  'chat-attachments', 
  false, -- private bucket, signed URLs or strict policies
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT DO NOTHING;

-- Storage Policies
-- We allow authenticated users to upload their attachments
CREATE POLICY "Authorized Uploads for Attachments" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'chat-attachments');

-- We allow authenticated users to read attachments
CREATE POLICY "Authorized Reads for Attachments" ON storage.objects 
FOR SELECT TO authenticated 
USING (bucket_id = 'chat-attachments');
