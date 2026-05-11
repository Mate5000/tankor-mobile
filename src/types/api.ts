// Local mirror of the DTOs from packages/shared. Kept in this app so the mobile
// codebase can live alongside the monorepo without sharing the workspace.

export type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'SUPER_ADMIN';
export type Locale = 'HU' | 'EN';
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  locale: Locale;
  avatarUrl: string | null;
  studyClassId?: string | null;
  studyClass?: { id: string; name: string; startYear: number; identifier: string } | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  accessToken: string;
  user: User;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  capacity: number;
  status: CourseStatus;
  schoolYear: string | null;
  instructorId: string;
  instructor?: { id: string; name: string; avatarUrl: string | null };
  subjectId?: string | null;
  subject?: { id: string; title: string } | null;
  studyClassId?: string | null;
  studyClass?: { id: string; name: string } | null;
  groupId?: string | null;
  group?: { id: string; name: string } | null;
  enrollmentCount?: number;
  lessonCount?: number;
  isEnrolled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location: string | null;
  checkinOpenUntil?: string | null;
  course?: { id: string; title: string };
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  dueAt: string | null;
  maxPoints: number;
  createdAt: string;
  course?: { id: string; title: string };
  mySubmission?: Submission | null;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string | null;
  fileUrl: string | null;
  submittedAt: string;
  student?: { id: string; name: string; avatarUrl: string | null };
  grade?: Grade | null;
}

export interface Grade {
  id: string;
  submissionId: string;
  points: number;
  feedback: string | null;
  gradedAt: string;
  graderId: string;
}

export interface Announcement {
  id: string;
  courseId: string | null;
  authorId: string;
  author?: { id: string; name: string };
  course?: { id: string; title: string } | null;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  payload: any;
  readAt: string | null;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  student?: { id: string; name: string; email: string; avatarUrl: string | null };
}

export interface Attendance {
  id: string;
  lessonId: string;
  studentId: string;
  present: boolean;
  markedAt: string;
  student?: { id: string; name: string; avatarUrl: string | null };
}

export interface Invite {
  id: string;
  token: string;
  role: Role;
  email: string | null;
  courseId: string | null;
  createdById: string;
  expiresAt: string;
  usedAt: string | null;
  usedById: string | null;
}

export interface CheckinStatus {
  isOpen: boolean;
  openUntil: string | null;
  checkedIn: Array<{ studentId: string; name: string; markedAt: string }>;
  hasCheckedIn?: boolean;
}

export interface SchoolEvent {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  createdById: string;
}

export interface DashboardData {
  role: Role;
  user: { id: string; name: string };
  // Student
  enrolledCourses?: number;
  pendingAssignments?: number;
  lastGrade?: { points: number; maxPoints: number; assignmentTitle: string } | null;
  upcomingLessons?: Lesson[];
  recentGrades?: Array<{ id: string; points: number; assignmentTitle: string; courseTitle: string; gradedAt: string }>;
  recentAnnouncements?: Announcement[];
  // Instructor
  coursesTaught?: number;
  students?: number;
  pendingGrading?: number;
  toGrade?: Array<{ id: string; assignmentTitle: string; courseTitle: string; studentName: string; submittedAt: string }>;
  // Admin
  totalUsers?: number;
  activeCourses?: number;
  activeEnrollments?: number;
  instructors?: number;
  recentCourses?: Array<Pick<Course, 'id' | 'title' | 'status' | 'createdAt'>>;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
