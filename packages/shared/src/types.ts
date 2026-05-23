export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user';
  free_attempts_used: number;
  balance_generations: number;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  prompt: string;
  category?: string;
  preview_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  generations_count: number;
  description?: string;
  is_active: boolean;
}

export interface Generation {
  id: string;
  user_id: string;
  location_id: string;
  original_photo_url: string;
  result_url?: string;
  thumbnail_url?: string;
  status: 'processing' | 'completed' | 'failed';
  error_message?: string;
  duration_ms?: number;
  created_at: string;
  completed_at?: string;
}

export interface Payment {
  id: string;
  user_id: string;
  package_id: string;
  wata_transaction_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  created_at: string;
  paid_at?: string;
}
