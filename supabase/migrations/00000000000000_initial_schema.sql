-- Users table (Synced via Clerk Webhooks)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('customer', 'provider', 'admin')) NOT NULL DEFAULT 'customer',
  name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for location searches
CREATE INDEX idx_users_location ON users(location);

-- Providers Profile table
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  category TEXT NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  avg_rating DECIMAL(3, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for provider category searches
CREATE INDEX idx_providers_category ON providers(category);

-- Bookings & Escrow State table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES providers(id),
  status TEXT CHECK (status IN ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'PAID', 'DECLINED', 'DISPUTED', 'RESOLVED')) NOT NULL DEFAULT 'PENDING',
  scheduled_at TIMESTAMPTZ NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  escrow_ref TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for booking lookups
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Real-time Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for message lookups by booking
CREATE INDEX idx_messages_booking_id ON messages(booking_id);

-- Trust & Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  author_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES providers(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for reviews
CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);
