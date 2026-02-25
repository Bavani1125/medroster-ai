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
  getUsersByRole: (role: string) => client.get(`/users/role/${role}`),
  getUsersByDepartment: (deptId: number) => client.get(`/users/department/${deptId}`),
};

// Department APIs
export const departmentAPI = {
  createDepartment: (data: { name: string; description: string }) =>
    client.post('/departments', data),
  getDepartments: () => client.get('/departments'),
  getDepartment: (deptId: number) => client.get(`/departments/${deptId}`),
  updateDepartment: (deptId: number, data: any) => client.patch(`/departments/${deptId}`, data),
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

// AI APIs - OpenAI & 11 Labs Integration
export const aiAPI = {
  // Get scheduling suggestions using OpenAI
  getSchedulingSuggestions: (shiftId: number) =>
    client.post('/ai/schedule-suggestions', { shift_id: shiftId }),
  
  // Generate announcement using OpenAI
  generateAnnouncement: (message: string) =>
    client.post('/ai/generate-announcement', { message }),
  
  // Convert text to speech using 11 Labs
  textToSpeech: (message: string, language: string = 'en') =>
    client.post('/ai/text-to-speech', { message, language }, { responseType: 'blob' }),
  
  // Get scheduling recommendations
  getRecommendations: (departmentId: number, criteria?: any) =>
    client.post(`/ai/recommendations`, { department_id: departmentId, ...criteria }),
  
  // Analyze workload
  analyzeWorkload: (departmentId: number) =>
    client.post('/ai/analyze-workload', { department_id: departmentId }),
  
  // Get AI tip
  getTip: () => client.get('/ai/tip'),
};

// Emergency APIs
export const emergencyAPI = {
  triggerRedAlert: (data: { emergency_type: string; department_id: number; notes?: string }) =>
    client.post('/emergency/red-alert', data),
  resolve: (data: { department_id: number }) =>
    client.post('/emergency/resolve', data),
};