// Role types
export type UserRole = 'admin' | 'manager' | 'doctor' | 'nurse' | 'staff';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department_id?: number;
}

export interface Department {
  id: number;
  name: string;
  description: string;
}

export interface Shift {
  id: number;
  department_id: number;
  start_time: string;
  end_time: string;
  required_role: string;
  required_staff_count: number;
}

export interface Assignment {
  id: number;
  user_id: number;
  shift_id: number;
  is_emergency: boolean;
}

// AI Integration Types
export interface AISchedulingSuggestion {
  shift_id: number;
  suggested_users: number[];
  reasoning: string;
  confidence: number;
}

export interface TextToSpeechRequest {
  message: string;
  language?: string;
}

export interface TextToSpeechResponse {
  audio_url: string;
}

// Role-based permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['manage_users', 'manage_departments', 'manage_shifts', 'manage_assignments', 'view_reports', 'ai_scheduling'],
  manager: ['manage_shifts', 'manage_assignments', 'view_reports', 'ai_scheduling'],
  doctor: ['view_shifts', 'view_assignments', 'request_changes'],
  nurse: ['view_assignments', 'request_changes'],
  staff: ['view_assignments'],
};
