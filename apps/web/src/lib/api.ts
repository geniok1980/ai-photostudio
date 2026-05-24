const API_BASE = 'http://localhost:3007/api';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

function getToken(): string | null {
  return localStorage.getItem('jwt');
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// --- Auth ---

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  balance_generations: number;
  free_attempts_used: number;
}

export function register(name: string, email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { name, email, password },
  });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function getMe(): Promise<{ user: User }> {
  return request<{ user: User }>('/auth/me');
}

// --- Locations ---

export interface Location {
  id: string;
  name: string;
  description: string;
  prompt: string;
  preview_url: string | null;
  category: string;
  is_active: boolean;
  sort_order: number;
}

export function getLocations(): Promise<Location[]> {
  return request<Location[]>('/locations');
}

// --- Packages ---

export interface Package {
  id: string;
  name: string;
  price: number;
  generations_count: number;
  description: string;
  is_active: boolean;
  isPopular?: boolean;
  features?: string[];
}

export function getPackages(): Promise<Package[]> {
  return request<{ packages: Package[] }>('/packages').then(res => res.packages);
}

// --- Photo Generation ---

export interface GenerationRequest {
  file: File;
  locationId: string;
}

export interface GenerationResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
}

export interface GenerationInfo {
  id: string;
  original_photo_url: string;
  result_url: string;
  location_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export async function generatePhoto(file: File, locationId: string): Promise<GenerationResult> {
  // Note: The backend expects JSON with locationId, and handle file separately or as placeholder
  // Looking at backend generate.ts, it doesn't actually use the uploaded file yet, 
  // it uses a placeholder. So we just send locationId for now.
  return request<{ generation: GenerationResult }>('/generate', {
    method: 'POST',
    body: { locationId },
  }).then(res => res.generation);
}

// --- History ---

export interface GenerationHistoryItem {
  id: string;
  original_photo_url: string;
  result_url: string;
  location_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export function getGenerationHistory(): Promise<GenerationHistoryItem[]> {
  return request<{ generations: GenerationHistoryItem[] }>('/generate/history').then(res => res.generations);
}

export function getGenerationStatus(id: string): Promise<{ generation: GenerationHistoryItem }> {
  return request<{ generation: GenerationHistoryItem }>(`/generate/${id}`);
}

// --- Payment ---

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  paid_at: string | null;
  package_name: string;
  generations_count: number;
}

export interface PaymentLinkResponse {
  payment: {
    id: string;
    payment_url: string;
    status: string;
  }
}

export function createPaymentLink(packageId: string): Promise<{ url: string }> {
  return request<PaymentLinkResponse>('/payments/create-link', {
    method: 'POST',
    body: { packageId },
  }).then(res => ({ url: res.payment.payment_url }));
}

export function getPaymentHistory(): Promise<Payment[]> {
  return request<{ payments: Payment[] }>('/payments/history').then(res => res.payments);
}

// --- Admin ---

export interface AdminDashboard {
  totalUsers: number;
  totalRevenue: number;
  totalGenerations: number;
  recentUsers: number;
}

export interface AdminChartData {
  date: string;
  count?: number;
  total?: number;
}

export interface UserAdmin {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  created_at: string;
  balance_generations: number;
  is_blocked: boolean;
}

export interface GenerationLog {
  id: string;
  status: string;
  duration_ms: number;
  error_message: string;
  created_at: string;
  user_email: string;
  location_name: string;
}

export interface PaymentLog {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  wata_transaction_id: string;
  user_email: string;
  package_name: string;
}

export async function getAdminDashboard(): Promise<{ stats: AdminDashboard; charts: { generations: AdminChartData[]; income: AdminChartData[] } }> {
  const data = await request<any>('/admin/dashboard');
  return {
    stats: {
      totalUsers: data.stats.userCount,
      totalRevenue: data.stats.revenue,
      totalGenerations: data.stats.generationCount,
      recentUsers: data.stats.recentUsers,
    },
    charts: data.charts,
  };
}

export async function getAdminUsers(): Promise<UserAdmin[]> {
  const data = await request<{users: UserAdmin[]}>('/admin/users');
  return data.users;
}

export async function updateUserAdmin(userId: string, updates: Partial<UserAdmin>): Promise<UserAdmin> {
  const data = await request<{user: UserAdmin}>(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: updates,
  });
  return data.user;
}

export async function getAdminLocations(): Promise<Location[]> {
  const data = await request<{locations: Location[]}>('/admin/locations');
  return data.locations;
}

export async function createLocation(data: Partial<Location>): Promise<Location> {
  const res = await request<{location: Location}>('/admin/locations', {
    method: 'POST',
    body: data,
  });
  return res.location;
}

export async function updateLocation(id: string, data: Partial<Location>): Promise<Location> {
  const res = await request<{location: Location}>(`/admin/locations/${id}`, {
    method: 'PUT',
    body: data,
  });
  return res.location;
}

export async function deleteLocation(id: string): Promise<void> {
  await request<void>(`/admin/locations/${id}`, {
    method: 'DELETE',
  });
}

export async function getAdminPackages(): Promise<Package[]> {
  const data = await request<{packages: Package[]}>('/admin/packages');
  return data.packages;
}

export async function createAdminPackage(data: Partial<Package>): Promise<Package> {
  const res = await request<{package: Package}>('/admin/packages', {
    method: 'POST',
    body: data,
  });
  return res.package;
}

export async function updateAdminPackage(id: string, data: Partial<Package>): Promise<Package> {
  const res = await request<{package: Package}>(`/admin/packages/${id}`, {
    method: 'PUT',
    body: data,
  });
  return res.package;
}

export async function getMonitoringGenerations(): Promise<GenerationLog[]> {
  const data = await request<{logs: GenerationLog[]}>('/admin/monitoring/generations');
  return data.logs;
}

export async function getMonitoringPayments(): Promise<PaymentLog[]> {
  const data = await request<{logs: PaymentLog[]}>('/admin/monitoring/payments');
  return data.logs;
}

export async function checkOpenRouterStatus(): Promise<any> {
  return request<any>('/admin/monitoring/openrouter');
}
