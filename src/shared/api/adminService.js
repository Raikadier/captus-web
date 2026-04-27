import apiClient from './client';

const BASE = '/admin';

// ── Institution ────────────────────────────────────────────────────────────
export const getInstitution          = ()           => apiClient.get(`${BASE}/institution`);
export const createInstitution       = (data)       => apiClient.post(`${BASE}/institution`, data);
export const updateInstitution       = (id, data)   => apiClient.put(`${BASE}/institution/${id}`, data);
export const getAdminStats           = ()           => apiClient.get(`${BASE}/stats`);

// ── Users ──────────────────────────────────────────────────────────────────
export const getMembers              = (role)       => apiClient.get(`${BASE}/users`, { params: { role } });
export const inviteUser              = (data)       => apiClient.post(`${BASE}/users/invite`, data);
export const removeUser              = (userId)     => apiClient.delete(`${BASE}/users/${userId}`);
export const changeUserRole          = (userId, role) => apiClient.patch(`${BASE}/users/${userId}/role`, { role });

// ── Courses ────────────────────────────────────────────────────────────────
export const getAdminCourses         = ()                   => apiClient.get(`${BASE}/courses`);
export const createAdminCourse       = (data)               => apiClient.post(`${BASE}/courses`, data);
export const assignTeacher           = (courseId, teacherId) => apiClient.post(`${BASE}/courses/${courseId}/assign-teacher`, { teacherId });
export const bulkEnroll              = (courseId, emails)   => apiClient.post(`${BASE}/courses/${courseId}/bulk-enroll`, { emails });

// ── Grading Scales ─────────────────────────────────────────────────────────
export const getGradingScales        = ()           => apiClient.get(`${BASE}/grading-scales`);
export const createGradingScale      = (data)       => apiClient.post(`${BASE}/grading-scales`, data);
export const updateGradingScale      = (id, data)   => apiClient.put(`${BASE}/grading-scales/${id}`, data);
export const deleteGradingScale      = (id)         => apiClient.delete(`${BASE}/grading-scales/${id}`);
export const setDefaultGradingScale  = (id)         => apiClient.patch(`${BASE}/grading-scales/${id}/set-default`);

// ── Academic Periods ───────────────────────────────────────────────────────
export const getPeriods              = ()           => apiClient.get(`${BASE}/periods`);
export const createPeriod            = (data)       => apiClient.post(`${BASE}/periods`, data);
export const updatePeriod            = (id, data)   => apiClient.put(`${BASE}/periods/${id}`, data);
export const deletePeriod            = (id)         => apiClient.delete(`${BASE}/periods/${id}`);
export const setActivePeriod         = (id)         => apiClient.patch(`${BASE}/periods/${id}/set-active`);
