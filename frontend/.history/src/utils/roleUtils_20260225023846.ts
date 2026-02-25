import { UserRole } from '../types';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'manage_users',
    'manage_departments',
    'manage_shifts',
    'manage_assignments',
    'view_reports',
    'ai_scheduling',
    'ai_announcements',
  ],
  manager: [
    'manage_shifts',
    'manage_assignments',
    'view_reports',
    'ai_scheduling',
    'ai_insights',
  ],
  doctor: [
    'view_shifts',
    'view_assignments',
    'request_changes',
    'view_workload',
  ],
  nurse: [
    'view_assignments',
    'request_changes',
    'view_schedule',
  ],
  staff: [
    'view_assignments',
    'view_schedule',
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: '👨‍💼 Administrator',
  manager: '👩‍✈️ Manager',
  doctor: '👨‍⚕️ Doctor',
  nurse: '👩‍⚕️ Nurse',
  staff: '👤 Staff',
};

export const hasPermission = (userRole: UserRole | undefined, permission: string): boolean => {
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
};

export const getRoleColor = (role: UserRole | undefined): string => {
  const colors: Record<UserRole, string> = {
    admin: '#d32f2f',
    manager: '#1976d2',
    doctor: '#388e3c',
    nurse: '#7b1fa2',
    staff: '#0097a7',
  };
  return colors[role as UserRole] || '#757575';
};

export const getRoleBgColor = (role: UserRole | undefined): string => {
  const colors: Record<UserRole, string> = {
    admin: '#ffebee',
    manager: '#e3f2fd',
    doctor: '#f1f8e9',
    nurse: '#f3e5f5',
    staff: '#e0f2f1',
  };
  return colors[role as UserRole] || '#f5f5f5';
};
