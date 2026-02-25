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
  createDepartment: (data: { name: string; description: string }) => client.post('/departments', data),
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
  createAssignment: (data: { user_id: number; shift_id: number; is_emergency: boolean }) =>
    client.post('/assignments', data),
  getAssignments: () => client.get('/assignments'),
  getAssignment: (assignmentId: number) => client.get(`/assignments/${assignmentId}`),
  deleteAssignment: (assignmentId: number) => client.delete(`/assignments/${assignmentId}`),
};

// ✅ AI APIs (FIXED)
export const aiAPI = {
  /**
   * Your backend endpoint accepts a schedule payload.
   * Keep your existing usage as-is if it’s already wired.
   */
  getSchedulingSuggestions: (shiftId: number) =>
    client.post('/ai/schedule-suggestions', { shift_id: shiftId }),

  /**
   * If you have a backend route for announcement generation.
   * If not used, keep it harmless.
   */
  generateAnnouncement: (message: string) =>
    client.post('/ai/generate-announcement', { message }),

  /**
   * ✅ FIX: Text-to-speech must return JSON {audio_base64, content_type}.
   * Do NOT request blob.
   */
  textToSpeech: (message: string) =>
    client.post(
      '/ai/text-to-speech',
      { text: message },
      { responseType: 'json' } // ensures res.data is an object, not Blob
    ),

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

export const publicAPI = {
  getDepartments: () => client.get('/public/departments'),
  generateVoiceUpdate: (payload: {
    department_id: number;
    language: 'en' | 'es';
    update_type: 'wait_time' | 'visiting' | 'directions' | 'safety';
    custom_note?: string;
  }) => client.post('/public/voice-update', payload, { responseType: 'json' }),
};