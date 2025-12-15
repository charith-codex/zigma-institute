import { useState, useEffect, useCallback } from 'react';
import { Course, CourseCategory, TeacherSummary, StudentRegistrationStatus, StudentRegistrationSummary } from '@/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ClassSummary {
  id: string;
  name: string;
  code: string;
  description: string;
  teacher_id: string | null;
  teacher_name: string | null;
  enrolled_students: number;
  max_students: number;
  schedule: string;
  room: string;
  semester: string;
  status: string;
  department: string;
  coverImage: string | null;
  slug: string | null;
}

export interface LessonSummary {
  id: string;
  title: string;
  description: string | null;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentEnrollment {
  id: string;
  courseId: string;
  courseName: string;
  courseSlug: string | null;
  enrolledAt: string;
  priceInCents: number;
  currency: string;
  teacherName: string | null;
}

// Mock data hooks for demonstration - replace with your Neon PostgreSQL implementation
export function useProfiles() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    // TODO: Implement with Neon PostgreSQL
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProfiles([]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refetch();
  }, []);

  return { profiles, loading, error, refetch };
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'Failed to load courses');
      }

      const payload = await response.json();
      const normalizedCourses: Course[] = Array.isArray(payload)
        ? payload.map((course) => ({
            ...course,
            teacherId: course.teacherId ?? null,
            courseCategoryId: course.courseCategoryId,
            courseCategory: course.courseCategory ?? null,
            createdAt: new Date(course.createdAt),
            updatedAt: new Date(course.updatedAt),
          }))
        : [];

      setCourses(normalizedCourses);
      setError(null);
    } catch (fetchError) {
      console.error('Failed to fetch courses', fetchError);
      setCourses([]);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Failed to load courses'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { courses, loading, error, refetch };
}

export function useCourseCategories() {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/course-categories');

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'Failed to load categories');
      }

      const payload = await response.json();
      const normalizedCategories: CourseCategory[] = Array.isArray(payload)
        ? payload.map((category) => ({
            ...category,
            createdAt: new Date(category.createdAt),
            updatedAt: new Date(category.updatedAt),
          }))
        : [];

      setCategories(normalizedCategories);
      setError(null);
    } catch (fetchError) {
      console.error('Failed to fetch course categories', fetchError);
      setCategories([]);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Failed to load course categories'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { categories, loading, error, refetch };
}

export function useTeachers() {
  const [teachers, setTeachers] = useState<TeacherSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teachers');

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'Failed to load teachers');
      }

      const payload = await response.json();
      const normalizedTeachers: TeacherSummary[] = Array.isArray(payload)
        ? payload
            .filter(
              (teacher): teacher is TeacherSummary =>
                Boolean(teacher) && typeof teacher.id === 'string' && typeof teacher.name === 'string'
            )
            .map((teacher) => ({
              id: teacher.id,
              name: teacher.name,
              email: typeof teacher.email === 'string' ? teacher.email : null,
            }))
        : [];

      setTeachers(normalizedTeachers);
      setError(null);
    } catch (fetchError) {
      console.error('Failed to fetch teachers', fetchError);
      setTeachers([]);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Failed to load teachers'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { teachers, loading, error, refetch };
}

export function useStudentRegistrations(
  statuses: StudentRegistrationStatus[] = ["PAID", "APPROVED"]
) {
  const [registrations, setRegistrations] = useState<StudentRegistrationSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryString = statuses.map((status) => `status=${status}`).join("&");

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/student-registration?${queryString}`);

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to load registrations");
      }

      const payload = await response.json();
      const normalized: StudentRegistrationSummary[] = Array.isArray(payload)
        ? payload
            .filter((item): item is StudentRegistrationSummary =>
              Boolean(item?.id)
            )
            .map((item) => ({
              ...item,
              qrCodeUrl:
                typeof item.qrCodeUrl === "string" ? item.qrCodeUrl : null,
              createdAt: new Date(item.createdAt),
            }))
        : [];

      setRegistrations(normalized);
      setError(null);
    } catch (fetchError) {
      console.error('Failed to load student registrations', fetchError);
      setRegistrations([]);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Failed to load student registrations'
      );
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { registrations, loading, error, refetch };
}

const normalizeCourseToClassSummary = (
  course: unknown
): ClassSummary | null => {
  if (!course || typeof course !== 'object') {
    return null;
  }

  const data = course as Record<string, unknown>;
  const id = typeof data.id === 'string' ? data.id : null;

  if (!id) {
    return null;
  }

  const slug = typeof data.slug === 'string' ? data.slug : null;
  const name =
    typeof data.name === 'string' && data.name.trim().length > 0
      ? data.name
      : 'Untitled Course';
  const description =
    typeof data.description === 'string' ? data.description : 'Description unavailable.';
  const teacherId = typeof data.teacherId === 'string' ? data.teacherId : null;
  const teacherName = typeof data.teacherName === 'string' ? data.teacherName : null;
  const coverImage = typeof data.coverImage === 'string' ? data.coverImage : null;
  const enrolledFromCount =
    typeof (data as { _count?: { enrollments?: number } })._count?.enrollments === 'number'
      ? (data as { _count?: { enrollments?: number } })._count!.enrollments!
      : null;
  const enrolledStudents =
    typeof (data as { enrolled_students?: number }).enrolled_students === 'number'
      ? (data as { enrolled_students: number }).enrolled_students
      : enrolledFromCount ?? 0;
  const maxStudents =
    typeof (data as { max_students?: number }).max_students === 'number'
      ? (data as { max_students: number }).max_students
      : Math.max(enrolledStudents, 0);
  const schedule =
    typeof (data as { schedule?: string }).schedule === 'string'
      ? (data as { schedule?: string }).schedule!
      : 'Schedule to be announced';
  const room =
    typeof (data as { room?: string }).room === 'string'
      ? (data as { room?: string }).room!
      : 'Room assignment pending';
  const semester =
    typeof (data as { semester?: string }).semester === 'string'
      ? (data as { semester?: string }).semester!
      : 'Upcoming semester';
  const status =
    typeof (data as { status?: string }).status === 'string'
      ? (data as { status?: string }).status!
      : 'active';
  const department =
    typeof (data as { department?: string }).department === 'string'
      ? (data as { department?: string }).department!
      : 'General Studies';

  const code = slug && slug.trim().length > 0 ? slug.toUpperCase() : id.slice(0, 8).toUpperCase();

  return {
    id,
    name,
    code,
    description,
    teacher_id: teacherId,
    teacher_name: teacherName,
    enrolled_students: enrolledStudents,
    max_students: maxStudents,
    schedule,
    room,
    semester,
    status,
    department,
    coverImage,
    slug,
  };
};

export function useClasses() {
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'Failed to load courses');
      }

      const payload = await response.json();
      const normalizedClasses: ClassSummary[] = Array.isArray(payload)
        ? payload
            .map((course) => normalizeCourseToClassSummary(course))
            .filter((course): course is ClassSummary => course !== null)
        : [];

      setClasses(normalizedClasses);
      setError(null);
    } catch (fetchError) {
      console.error('Failed to fetch classes', fetchError);
      setClasses([]);
      setError(
        fetchError instanceof Error ? fetchError.message : 'Failed to load courses'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { classes, loading, error, refetch };
}

const normalizeLesson = (lesson: unknown): LessonSummary | null => {
  if (!lesson || typeof lesson !== 'object') {
    return null;
  }

  const data = lesson as Record<string, unknown>;
  const id = typeof data.id === 'string' ? data.id : null;
  const courseId = typeof data.courseId === 'string' ? data.courseId : null;
  const title = typeof data.title === 'string' ? data.title : null;

  if (!id || !courseId || !title) {
    return null;
  }

  const description =
    typeof data.description === 'string' && data.description.length > 0
      ? data.description
      : null;
  const createdAt =
    typeof data.createdAt === 'string'
      ? data.createdAt
      : new Date().toISOString();
  const updatedAt =
    typeof data.updatedAt === 'string'
      ? data.updatedAt
      : new Date().toISOString();

  return {
    id,
    title,
    description,
    courseId,
    createdAt,
    updatedAt,
  };
};

export function useLessons(courseId?: string) {
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!courseId) {
      setLessons([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/lessons?courseId=${encodeURIComponent(courseId)}`);

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'Failed to load lessons');
      }

      const payload = await response.json();
      const normalizedLessons: LessonSummary[] = Array.isArray(payload)
        ? payload
            .map((lesson) => normalizeLesson(lesson))
            .filter((lesson): lesson is LessonSummary => lesson !== null)
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
        : [];

      setLessons(normalizedLessons);
      setError(null);
    } catch (fetchError) {
      console.error('Failed to fetch lessons', fetchError);
      setLessons([]);
      setError(
        fetchError instanceof Error ? fetchError.message : 'Failed to load lessons'
      );
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const createLesson = useCallback(
    async (input: { title: string; description?: string | null }) => {
      if (!courseId) {
        throw new Error('A course must be selected before creating lessons.');
      }

      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: input.title,
          description: input.description ?? null,
          courseId,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          (payload && typeof payload.error === 'string'
            ? payload.error
            : null) ?? 'Failed to create lesson'
        );
      }

      const normalized = normalizeLesson(payload);

      if (!normalized) {
        throw new Error('Unexpected response received when creating lesson.');
      }

      setLessons((previous) =>
        [...previous, normalized].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );

      return normalized;
    },
    [courseId]
  );

  return { lessons, loading, error, refetch, createLesson };
}

export function useEnrollments() {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/lms/enrollments", { cache: "no-store" });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to load enrollments");
      }

      const payload = await response.json();

      const normalized: StudentEnrollment[] = Array.isArray(payload)
        ? payload
            .map((entry) => {
              const course = (entry as { course?: unknown }).course as
                | Record<string, unknown>
                | undefined;
              const courseId =
                typeof entry.courseId === "string"
                  ? entry.courseId
                  : typeof course?.id === "string"
                    ? (course.id as string)
                    : null;

              if (!courseId) return null;

              const courseName =
                typeof course?.name === "string"
                  ? course.name
                  : typeof (entry as { courseName?: unknown }).courseName ===
                      "string"
                    ? ((entry as { courseName: string }).courseName as string)
                    : "Course";

              return {
                id: typeof entry.id === "string" ? entry.id : courseId,
                courseId,
                courseName,
                courseSlug:
                  typeof course?.slug === "string"
                    ? (course.slug as string)
                    : null,
                enrolledAt:
                  typeof (entry as { enrolledAt?: unknown }).enrolledAt ===
                  "string"
                    ? ((entry as { enrolledAt: string }).enrolledAt as string)
                    : new Date().toISOString(),
                priceInCents:
                  typeof course?.priceInCents === "number"
                    ? (course.priceInCents as number)
                    : 0,
                currency:
                  typeof course?.currency === "string"
                    ? (course.currency as string)
                    : "usd",
                teacherName:
                  typeof course?.teacherName === "string"
                    ? (course.teacherName as string)
                    : null,
              } satisfies StudentEnrollment;
            })
            .filter((entry): entry is StudentEnrollment => entry !== null)
        : [];

      setEnrollments(normalized);
      setError(null);
    } catch (fetchError) {
      console.error("Failed to fetch enrollments", fetchError);
      setEnrollments([]);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load enrollments"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { enrollments, loading, error, refetch };
}

export function useAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setTimeout(() => {
      setAssignments([]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refetch();
  }, []);

  return { assignments, loading, error, refetch };
}

export interface FeeRecord {
  id: string;
  studentId: string | null;
  studentName: string;
  studentEmail: string | null;
  courseId: string | null;
  courseName: string | null;
  amountInCents: number;
  currency: string;
  paidAt: string;
  paymentType: "INSTALLMENT" | "REGISTRATION";
  transactionId: string | null;
  monthNumber: number | null;
  discountRate: number | null;
}

export interface FeeSummary {
  totalIncomeInCents: number;
  monthlyIncome: { month: string; totalInCents: number }[];
  courseTotals: {
    courseId: string;
    courseName: string;
    totalInCents: number;
    payments: number;
  }[];
  studentTotals: {
    studentId: string | null;
    studentName: string;
    studentEmail: string | null;
    totalInCents: number;
    payments: number;
  }[];
}

export function usePayments() {
  const [payments, setPayments] = useState<FeeRecord[]>([]);
  const [summary, setSummary] = useState<FeeSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fees', { cache: 'no-store' });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'Failed to load fees');
      }

      const payload = await response.json();

      setPayments(Array.isArray(payload?.records) ? payload.records : []);
      setSummary(payload?.summary ?? null);
      setError(null);
    } catch (fetchError) {
      console.error('Failed to load fee data', fetchError);
      setPayments([]);
      setSummary(null);
      setError(
        fetchError instanceof Error ? fetchError.message : 'Failed to load fee data'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { payments, summary, loading, error, refetch };
}

export function useDashboardStats() {
  const [stats, setStats] = useState({
    studentCount: 0,
    teacherCount: 0,
    activeClasses: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setTimeout(() => {
      setStats({
        studentCount: 0,
        teacherCount: 0,
        activeClasses: 0,
        totalRevenue: 0
      });
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refetch();
  }, []);

  return { stats, loading, error, refetch };
}

export function useFlashcards() {
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setTimeout(() => {
      setFlashcards([]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refetch();
  }, []);

  return { flashcards, loading, error, refetch };
}

export function useLessonSummaries() {
  const [lessonSummaries, setLessonSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setTimeout(() => {
      setLessonSummaries([]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refetch();
  }, []);

  return { lessonSummaries, loading, error, refetch };
}

export function useQuizzes() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setTimeout(() => {
      setQuizzes([]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refetch();
  }, []);

  return { quizzes, loading, error, refetch };
}

export function useComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setTimeout(() => {
      setComplaints([]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refetch();
  }, []);

  return { complaints, loading, error, refetch };
}

export function useQRAttendanceSessions() {
  const [qrSessions, setQRSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setTimeout(() => {
      setQRSessions([]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refetch();
  }, []);

  return { qrSessions, loading, error, refetch };
}

export function usePhysicalMaterials() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setTimeout(() => {
      setMaterials([]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refetch();
  }, []);

  return { materials, loading, error, refetch };
}

export function useMaterialDistributions() {
  const [distributions, setDistributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setTimeout(() => {
      setDistributions([]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refetch();
  }, []);

  return { distributions, loading, error, refetch };
}

// Combined hook for backward compatibility
export function useData() {
  const profiles = useProfiles();
  const courses = useCourses();
  const classes = useClasses();
  const enrollments = useEnrollments();
  const assignments = useAssignments();
  const payments = usePayments();
  const flashcards = useFlashcards();
  const lessonSummaries = useLessonSummaries();
  const quizzes = useQuizzes();

  const loading = profiles.loading || courses.loading || classes.loading || 
                  enrollments.loading || assignments.loading || payments.loading ||
                  flashcards.loading || lessonSummaries.loading || quizzes.loading;

  return {
    profiles: profiles.profiles,
    courses: courses.courses,
    classes: classes.classes,
    enrollments: enrollments.enrollments,
    assignments: assignments.assignments,
    payments: payments.payments,
    flashcards: flashcards.flashcards,
    lessonSummaries: lessonSummaries.lessonSummaries,
    quizzes: quizzes.quizzes,
    loading,
  };
}