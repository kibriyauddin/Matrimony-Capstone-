export interface User {
  id: number;
  email: string;
  name: string;
  role: 'attendee' | 'organizer';
  created_at: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'attendee' | 'organizer';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}