-- Phase 5: Escrow Payment Infrastructure

-- 1. Create Payment Status Enum
CREATE TYPE payment_status AS ENUM ('initialized', 'pending', 'successful', 'failed', 'refunded');

-- 2. Create Payments Table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES providers(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  paystack_reference TEXT UNIQUE NOT NULL,
  payment_status payment_status DEFAULT 'initialized',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Payment lookups
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_paystack_reference ON payments(paystack_reference);

-- 3. Extend Bookings Table for Payment Relationships
ALTER TABLE bookings 
  ADD COLUMN payment_id UUID REFERENCES payments(id),
  ADD COLUMN escrow_released BOOLEAN DEFAULT FALSE;

-- 4. Extend Providers Table for Payout Configuration
ALTER TABLE providers 
  ADD COLUMN bank_name TEXT,
  ADD COLUMN account_number TEXT,
  ADD COLUMN account_name TEXT,
  ADD COLUMN paystack_recipient_code TEXT; -- Required for Paystack Transfers
