export enum Role {
  CLIENT = 'client',
  TECHNICIAN = 'technician',
  ADMIN = 'admin'
}

export interface User {
  id: number;
  contract: string;
  nom: string;
  cin: string; // Stored in plain text in DB, masked in UI based on role
  phone: string | null;
  phone2: string | null; // Secondary optional phone number
  phoneVerified: boolean;
  phoneUpdateCount: number; // Tracks how many times client updated phone
  lastVerifiedAt: string | null; // ISO Date string
  lastModifiedBy: string | null;
  lastModifiedAt: string | null;
  createdAt: string;
}

export interface Technician {
  id: number;
  username: string;
  password: string; // In real app, hash this!
  name: string;
}

export interface AuditLog {
  id: number;
  action: string;
  details: string;
  actor: string; // 'client' or 'technician:Name' or 'admin'
  timestamp: string;
}

export interface VerificationSession {
  code: string;
  expiresAt: number; // Timestamp
  used: boolean;
  purpose: 'phone_update';
}

// Response types for our mock service
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface AuthUser {
  username: string;
  role: Role;
  name: string;
}