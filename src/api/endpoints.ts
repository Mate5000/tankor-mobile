// Thin wrappers around the API. Returns parsed JSON. All paths are relative
// to /api/v1 — the client adds the prefix.

import { api } from './client';
import type {
  Announcement,
  Assignment,
  Attendance,
  CheckinStatus,
  Course,
  CourseStatus,
  DashboardData,
  Enrollment,
  Grade,
  Invite,
  Lesson,
  Notification,
  Page,
  Role,
  SchoolEvent,
  Submission,
  User,
} from '@/types/api';

// -- Me --
export const meApi = {
  get: () => api<User>('/me'),
  update: (body: Partial<{ name: string; locale: 'HU' | 'EN'; avatarUrl: string | null; currentPassword: string; newPassword: string }>) =>
    api<User>('/me', { method: 'PATCH', json: body }),
  dashboard: () => api<DashboardData>('/me/dashboard'),
  schedule: (from: string, to: string) => api<Lesson[]>('/me/schedule', { query: { from, to } }),
  enrollments: () => api<Course[]>('/me/enrollments'),
  teaching: () => api<Course[]>('/me/teaching'),
  assignments: () => api<Assignment[]>('/me/assignments'),
  results: () => api<any[]>('/me/results'),
};

// -- Notifications --
export const notificationsApi = {
  list: (unreadOnly?: boolean, limit?: number) =>
    api<{ items: Notification[]; unreadCount: number }>('/me/notifications', {
      query: { unreadOnly: unreadOnly ? 'true' : undefined, limit },
    }),
  markRead: (id: string) => api(`/me/notifications/${id}`, { method: 'PATCH' }),
  markAllRead: () => api('/me/notifications/read-all', { method: 'POST' }),
};

// -- Courses --
export const coursesApi = {
  list: (params?: { q?: string; status?: CourseStatus; page?: number; pageSize?: number; subjectId?: string; studyClassId?: string }) =>
    api<Page<Course>>('/courses', { query: params }),
  get: (id: string) => api<Course>(`/courses/${id}`),
  create: (body: any) => api<Course>('/courses', { method: 'POST', json: body }),
  update: (id: string, body: any) => api<Course>(`/courses/${id}`, { method: 'PATCH', json: body }),
  archive: (id: string) => api(`/courses/${id}`, { method: 'DELETE' }),
  enroll: (id: string) => api<Enrollment>(`/courses/${id}/enroll`, { method: 'POST' }),
  withdraw: (id: string) => api(`/courses/${id}/enroll`, { method: 'DELETE' }),
  enrollments: (id: string) => api<Enrollment[]>(`/courses/${id}/enrollments`),
  lessons: (id: string) => api<Lesson[]>(`/courses/${id}/lessons`),
  createLesson: (id: string, body: any) => api<Lesson>(`/courses/${id}/lessons`, { method: 'POST', json: body }),
  assignments: (id: string) => api<Assignment[]>(`/courses/${id}/assignments`),
  createAssignment: (id: string, body: any) => api<Assignment>(`/courses/${id}/assignments`, { method: 'POST', json: body }),
  announcements: (id: string) => api<Announcement[]>('/announcements', { query: { courseId: id } }),
};

// -- Lessons --
export const lessonsApi = {
  update: (id: string, body: any) => api<Lesson>(`/lessons/${id}`, { method: 'PATCH', json: body }),
  delete: (id: string) => api(`/lessons/${id}`, { method: 'DELETE' }),
  attendance: (id: string) => api<Attendance[]>(`/lessons/${id}/attendance`),
  markAttendance: (id: string, body: { studentId: string; present: boolean }) =>
    api(`/lessons/${id}/attendance`, { method: 'POST', json: body }),
  // Check-in (QR)
  openCheckin: (id: string, ttlMinutes = 15) => api(`/lessons/${id}/checkin/open`, { method: 'POST', json: { ttlMinutes } }),
  closeCheckin: (id: string) => api(`/lessons/${id}/checkin/close`, { method: 'POST' }),
  checkinStatus: (id: string) => api<CheckinStatus>(`/lessons/${id}/checkin`),
  checkIn: (id: string) => api(`/lessons/${id}/checkin`, { method: 'POST' }),
};

// -- Assignments --
export const assignmentsApi = {
  get: (id: string) => api<Assignment>(`/assignments/${id}`),
  update: (id: string, body: any) => api<Assignment>(`/assignments/${id}`, { method: 'PATCH', json: body }),
  delete: (id: string) => api(`/assignments/${id}`, { method: 'DELETE' }),
  submissions: (id: string) => api<Submission[]>(`/assignments/${id}/submissions`),
  submit: (id: string, body: { content?: string }) => api<Submission>(`/assignments/${id}/submissions`, { method: 'POST', json: body }),
  grade: (submissionId: string, body: { points: number; feedback?: string }) =>
    api<Grade>(`/submissions/${submissionId}/grade`, { method: 'POST', json: body }),
};

// -- Announcements --
export const announcementsApi = {
  list: (params?: { courseId?: string; limit?: number }) => api<Announcement[]>('/announcements', { query: params }),
  create: (body: any) => api<Announcement>('/announcements', { method: 'POST', json: body }),
  update: (id: string, body: any) => api<Announcement>(`/announcements/${id}`, { method: 'PATCH', json: body }),
  delete: (id: string) => api(`/announcements/${id}`, { method: 'DELETE' }),
};

// -- Users (admin) --
export const usersApi = {
  list: (params?: { q?: string; role?: Role; isActive?: boolean; page?: number; pageSize?: number }) =>
    api<Page<User>>('/users', {
      query: {
        q: params?.q,
        role: params?.role,
        isActive: params?.isActive === undefined ? undefined : params.isActive ? 'true' : 'false',
        page: params?.page,
        pageSize: params?.pageSize,
      },
    }),
  update: (id: string, body: any) => api<User>(`/users/${id}`, { method: 'PATCH', json: body }),
  deactivate: (id: string) => api(`/users/${id}`, { method: 'DELETE' }),
};

// -- Invites (admin) --
export const invitesApi = {
  list: () => api<Invite[]>('/invites'),
  create: (body: { role: Role; email?: string; courseId?: string; expiresInHours?: number }) =>
    api<Invite>('/invites', { method: 'POST', json: body }),
  delete: (id: string) => api(`/invites/${id}`, { method: 'DELETE' }),
};

// -- Academic helpers --
export const academicApi = {
  subjects: () => api<any[]>('/subjects'),
  classes: () => api<any[]>('/classes'),
  groups: () => api<any[]>('/groups'),
};

// -- School events --
export const eventsApi = {
  list: () => api<SchoolEvent[]>('/school-events'),
  create: (body: any) => api<SchoolEvent>('/school-events', { method: 'POST', json: body }),
};
