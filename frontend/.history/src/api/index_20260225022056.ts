import client from './client';

// Auth APIs
export const authAPI = {
  register: (data: { name: string; email: string; password: string; role: string; department_id: number }) =>
    client.post('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      department_id: data.department_id,
    }),

  login: (email: string, password: string) =>
    client.post('/auth/login', new URLSearchParams({ username: email, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),

  getCurrentUser: () => client.get('/users/me'),
};

// User APIs
export const userAPI = {
  getAllUsers: () => client.get('/users/'),
  getUser: (userId: number) => client.get(`/users/${userId}`),
  updateUser: (userId: number, data: any) => client.patch(`/users/${userId}`, data),
};

// Department APIs
export const departmentAPI = {
  createDepartment: (data: { name: string; description: string }) =>
    client.post('/departments', data),
  getDepartments: () => client.get('/departments'),
  getDepartment: (deptId: number) => client.get(`/departments/${deptId}`),
  deleteDepartment: (deptId: number) => client.delete(`/departments/${deptId}`),
};

// Shift APIs
export const shiftAPI = {
  createShift: (data: {
    department_id: number;
    start_time: string;
    end_time: string;
    required_role: string;
    required_staff_count: number;
  }) => client.post('/shifts', data),
  getShifts: () => client.get('/shifts'),
  getShift: (shiftId: number) => client.get(`/shifts/${shiftId}`),
  updateShift: (shiftId: number, data: any) => client.patch(`/shifts/${shiftId}`, data),
  deleteShift: (shiftId: number) => client.delete(`/shifts/${shiftId}`),
};

// Assignment APIs
export const assignmentAPI = {
  createAssignment: (data: {
    user_id: number;
    shift_id: number;
    is_emergency: boolean;
  }) => client.post('/assignments', data),
  getAssignments: () => client.get('/assignments'),
  getAssignment: (assignmentId: number) => client.get(`/assignments/${assignmentId}`),
  deleteAssignment: (assignmentId: number) => client.delete(`/assignments/${assignmentId}`),
};

// AI APIs
export const aiAPI = {
  suggestSchedule: (data: { staff: any[]; shifts: any[]; context?: string }) =>
    client.post('/ai/suggest-schedule', data),
  analyzeWorkload: (data: { staff_data: any[] }) =>
    client.post('/ai/analyze-workload', data),
  getTip: () => client.get('/ai/tip'),
};

// Emergency APIs
export const emergencyAPI = {
  triggerRedAlert: (data: { emergency_type: string; department_id: number; notes?: string }) =>
    client.post('/emergency/red-alert', data),
  resolve: (data: { department_id: number }) =>
    client.post('/emergency/resolve', data),
};