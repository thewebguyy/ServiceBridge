-- Phase 4: Marketplace Core & Booking State Machine

-- 1. Update existing check constraint for booking status to include CANCELLED
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'PAID', 'DECLINED', 'CANCELLED', 'DISPUTED', 'RESOLVED'));

-- 2. Expand Bookings Table for Marketplace Data
ALTER TABLE bookings 
  ADD COLUMN service_category TEXT,
  ADD COLUMN location TEXT,
  ADD COLUMN notes TEXT,
  ADD COLUMN estimated_price DECIMAL(10, 2);

-- 3. Enhance Booking Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_service_category ON bookings(service_category);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- Event Triggers / Prepare for Notifications Table (for future phases)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  event_type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
