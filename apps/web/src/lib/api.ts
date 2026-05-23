const API_BASE = 'http://localhost:3001/api';

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

// --- Locations ---

export interface Location {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  isActive: boolean;
}

export function getLocations(): Promise<Location[]> {
  return request<Location[]>('/locations');
}

// --- Packages ---

export interface Package {
  id: string;
  name: string;
  price: number;
  generationsCount: number;
  description: string;
  isPopular?: boolean;
  features: string[];
}

export function getPackages(): Promise<Package[]> {
  return request<Package[]>('/packages');
}

// --- Photo Generation ---

export interface GenerationRequest {
  file: File;
  locationId: string;
}

export interface GenerationResult {
  id: string;
  originalUrl: string;
  resultUrl: string;
  locationName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export async function generatePhoto(file: File, locationId: string): Promise<GenerationResult> {
  const token = getToken();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('locationId', locationId);

  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.generation;
}

// --- History ---

export interface GenerationHistoryItem {
  id: string;
  originalUrl: string;
  resultUrl: string;
  locationName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export async function getGenerationHistory(): Promise<GenerationHistoryItem[]> {
  const data = await request<{ generations: GenerationHistoryItem[] }>('/generate/history');
  return data.generations;
}

// --- Payment ---

export interface PaymentLinkResponse {
  url: string;
}

export function createPaymentLink(packageId: string): Promise<PaymentLinkResponse> {
  return request<PaymentLinkResponse>('/payments/create', {
    method: 'POST',
    body: { packageId },
  });
}

// --- Admin ---

export interface AdminDashboard {
  totalUsers: number;
  totalRevenue: number;
  totalGenerations: number;
  recentUsers: number;
}

export interface UserAdmin {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  generationsCount: number;
}

export function getAdminDashboard(): Promise<AdminDashboard> {
  return request<AdminDashboard>('/admin/dashboard');
}

export function getAdminUsers(): Promise<UserAdmin[]> {
  return request<UserAdmin[]>('/admin/users');
}

export function updateUserRole(userId: string, role: 'user' | 'admin'): Promise<UserAdmin> {
  return request<UserAdmin>(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: { role },
  });
}

export function createLocation(data: Omit<Location, 'id'>): Promise<Location> {
  return request<Location>('/locations', {
    method: 'POST',
    body: data,
  });
}

export function updateLocation(id: string, data: Partial<Location>): Promise<Location> {
  return request<Location>(`/locations/${id}`, {
    method: 'PATCH',
    body: data,
  });
}

export function deleteLocation(id: string): Promise<void> {
  return request<void>(`/locations/${id}`, {
    method: 'DELETE',
  });
}
