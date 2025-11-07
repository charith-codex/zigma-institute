import { useState, useEffect, useCallback } from 'react';
import { Course, TeacherSummary } from '@/types';

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

export function useClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    // TODO: Implement with Neon PostgreSQL
    setLoading(true);
    setTimeout(() => {
      // Mock teacher classes data
      setClasses([
        {
          id: 'CLS00001',
          name: 'Advanced React Development',
          code: 'CS401',
          description: 'Learn advanced React concepts including hooks, context, and performance optimization',
          max_students: 30,
          enrolled_students: 25,
          schedule: 'Mon, Wed, Fri 10:00 AM',
          room: 'Lab 101',
          semester: 'Fall 2024',
          status: 'active',
          department: 'Computer Science',
          teacher_id: 'teacher-001'
        },
        {
          id: 'CLS00002', 
          name: 'Database Design Principles',
          code: 'CS301',
          description: 'Comprehensive study of database design, normalization, and SQL optimization',
          max_students: 25,
          enrolled_students: 22,
          schedule: 'Tue, Thu 2:00 PM',
          room: 'Room 205',
          semester: 'Fall 2024',
          status: 'active',
          department: 'Computer Science',
          teacher_id: 'teacher-001'
        },
        {
          id: 'CLS00003',
          name: 'Web Development Fundamentals',
          code: 'CS201',
          description: 'Introduction to HTML, CSS, JavaScript and modern web development practices',
          max_students: 35,
          enrolled_students: 32,
          schedule: 'Mon, Wed 2:00 PM',
          room: 'Lab 102',
          semester: 'Fall 2024',
          status: 'active',
          department: 'Computer Science',
          teacher_id: 'teacher-001'
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refetch();
  }, []);

  return { classes, loading, error, refetch };
}

export function useEnrollments() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setTimeout(() => {
      setEnrollments([]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refetch();
  }, []);

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

export function usePayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setTimeout(() => {
      setPayments([]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refetch();
  }, []);

  return { payments, loading, error, refetch };
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