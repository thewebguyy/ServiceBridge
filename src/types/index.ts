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
  created_at: string;
  updated_at: string;
}
