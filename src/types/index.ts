export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface User {
  id: string;
  clerk_id: string;
  role: 'customer' | 'provider' | 'admin';
  name: string;
  phone?: string;
  location?: string;
  created_at: string;
}

export interface Provider {
  id: string;
  user_id: string; // References User
  display_name: string;
  bio?: string;
  category: string; // Primary category
  service_categories: string[]; // Secondary categories
  hourly_rate: number;
  service_area?: string;
  verification_status: VerificationStatus;
  portfolio_images: string[];
  avg_rating: number;
  total_reviews: number;
  response_time?: number; // In minutes
  completed_jobs: number;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  paystack_recipient_code?: string;
  verification_documents?: string[];
  verification_completed_at?: string;
  trust_score?: number;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 
  | 'PENDING' 
  | 'ACCEPTED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'PAID' 
  | 'DECLINED' 
  | 'CANCELLED' 
  | 'DISPUTED' 
  | 'RESOLVED';

export interface Booking {
  id: string;
  customer_id: string; // References User
  provider_id: string; // References Provider
  status: BookingStatus;
  scheduled_at: string;
  amount: number;
  escrow_ref?: string;
  service_category: string;
  location: string;
  notes?: string;
  estimated_price: number;
  payment_id?: string;
  escrow_released?: boolean;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = 'initialized' | 'pending' | 'successful' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  amount: number;
  currency: string;
  paystack_reference: string;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export type MessageType = 'text' | 'image' | 'system';

export interface Message {
  id: string;
  booking_id: string;
  sender_id?: string; // Optional for system messages
  message_content: string;
  message_type: MessageType;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  rating: number;
  review_text?: string;
  created_at: string;
}

export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'rejected';

export interface Dispute {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  dispute_reason: string;
  dispute_description: string;
  status: DisputeStatus;
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
}
