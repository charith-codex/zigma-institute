"use server";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";

export interface StudentAnalyticsData {
  userId: string;
  studentPublicId: string | null;
  name: string;
  onlineMark: number | null;
  physicalMark: number | null;
  overallMark: number | null;
  totalExams: number;
  attendedExams: number;
  attendedAll: boolean;
}

export interface StudentMark {
  studentId: string;
  studentName: string;
  studentPublicId: string | null;
  mark: number | null;
}

export interface PaperData {
  id: string;
  title: string;
  type: "Online" | "Physical";
  results: StudentMark[];
}

export interface CourseAnalyticsResponse {
  summary: StudentAnalyticsData[];
  papers: PaperData[];
}

export async function getCourseAnalytics(
  courseId: string
): Promise<CourseAnalyticsResponse> {
  try {
    // 1. Fetch all enrolled students for the course
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const enrolledStudents = enrollments.map((e) => ({
      userId: e.student.user.id,
      studentPublicId: e.student.studentPublicId,
      name: e.student.user.name,
    }));

    if (enrolledStudents.length === 0) return { summary: [], papers: [] };

    const studentIds = enrolledStudents.map((s) => s.userId);

    // 2. Fetch all unique PUBLISHED exam papers for this course
    const publishedExams = await prisma.examPaper.findMany({
      where: {
        courseId,
        status: "PUBLISHED",
      },
      select: { id: true, title: true },
    });
    const totalOnlineExamsCount = publishedExams.length;
    const publishedExamIds = publishedExams.map((e) => e.id);

    // 3. Fetch all GRADED online exam attempts for these students in this course
    const onlineAttempts = await prisma.examAttempt.findMany({
      where: {
        studentId: { in: studentIds },
        examId: { in: publishedExamIds },
        status: "GRADED",
      },
      include: {
        exam: {
          select: {
            questions: { select: { marks: true } },
          },
        },
      },
    });

    // 4. Determine total Physical Exams for this course
    // We unique by both title and date to identify distinct exam sessions
    const allPhysicalExamSessions = await prisma.physicalExamMark.findMany({
      where: { courseId },
      select: { examTitle: true, examDate: true },
      distinct: ["examTitle", "examDate"],
    });
    const totalPhysicalExamsCount = allPhysicalExamSessions.length;

    // 5. Fetch physical exam marks for these students in this course
    const registrations = await prisma.studentRegistration.findMany({
      where: {
        studentUserId: { in: studentIds },
        courses: { some: { courseId } },
      },
      select: { id: true, studentUserId: true },
    });

    const registrationIdToUserId = new Map(
      registrations.map((r) => [r.id, r.studentUserId!])
    );
    const registrationIds = Array.from(registrationIdToUserId.keys());

    const physicalMarks = await prisma.physicalExamMark.findMany({
      where: {
        courseId,
        studentRegistrationId: { in: registrationIds },
      },
    });

    // 6. Aggregation logic
    const totalCourseExams = totalOnlineExamsCount + totalPhysicalExamsCount;

    const studentAnalytics = enrolledStudents.map((student) => {
      // Online Marks Calculation (Average Percentage)
      const studentOnlineAttempts = onlineAttempts.filter(
        (a) => a.studentId === student.userId
      );
      const attendedOnlineCount = new Set(
        studentOnlineAttempts.map((a) => a.examId)
      ).size;

      let onlineAvgPercent: number | null = null;
      if (studentOnlineAttempts.length > 0) {
        let totalPercent = 0;
        studentOnlineAttempts.forEach((attempt) => {
          const totalExamMarks = attempt.exam.questions.reduce(
            (sum, q) => sum + q.marks,
            0
          );
          if (totalExamMarks > 0) {
            totalPercent += ((attempt.score || 0) / totalExamMarks) * 100;
          }
        });
        onlineAvgPercent = totalPercent / studentOnlineAttempts.length;
      }

      // Physical Marks Calculation (Average Score)
      const studentRegistrationIds = registrations
        .filter((r) => r.studentUserId === student.userId)
        .map((r) => r.id);

      const studentPhysicalMarks = physicalMarks.filter((m) =>
        studentRegistrationIds.includes(m.studentRegistrationId)
      );

      const attendedPhysicalCount = studentPhysicalMarks.length; // Assuming one mark per student per session

      let physicalAvg: number | null = null;
      if (studentPhysicalMarks.length > 0) {
        physicalAvg =
          studentPhysicalMarks.reduce((sum, m) => sum + m.score, 0) /
          studentPhysicalMarks.length;
      }

      // Overall Mark Calculation
      let overall: number | null = null;
      if (onlineAvgPercent !== null && physicalAvg !== null) {
        overall = (onlineAvgPercent + physicalAvg) / 2;
      } else if (onlineAvgPercent !== null) {
        overall = onlineAvgPercent;
      } else if (physicalAvg !== null) {
        overall = physicalAvg;
      }

      const attendedTotal = attendedOnlineCount + attendedPhysicalCount;
      const attendedAll =
        totalCourseExams > 0 && attendedTotal === totalCourseExams;

      return {
        userId: student.userId,
        studentPublicId: student.studentPublicId,
        name: student.name,
        onlineMark: onlineAvgPercent,
        physicalMark: physicalAvg,
        overallMark: overall,
        totalExams: totalCourseExams,
        attendedExams: attendedTotal,
        attendedAll,
      };
    });

    // 7. Paper breakdown logic
    const onlinePapers: PaperData[] = publishedExams.map((exam) => {
      const results: StudentMark[] = enrolledStudents.map((student) => {
        const attempt = onlineAttempts.find(
          (a) => a.studentId === student.userId && a.examId === exam.id
        );
        let mark: number | null = null;
        if (attempt) {
          const totalExamMarks = attempt.exam.questions.reduce(
            (sum, q) => sum + q.marks,
            0
          );
          mark =
            totalExamMarks > 0
              ? Number.parseFloat(
                  (((attempt.score || 0) / totalExamMarks) * 100).toFixed(1)
                )
              : 0;
        }
        return {
          studentId: student.userId,
          studentName: student.name,
          studentPublicId: student.studentPublicId,
          mark,
        };
      });
      return {
        id: exam.id,
        title: exam.title,
        type: "Online",
        results,
      };
    });

    const physicalPapers: PaperData[] = allPhysicalExamSessions.map(
      (session, index) => {
        const results: StudentMark[] = enrolledStudents.map((student) => {
          const studentRegistrationIds = registrations
            .filter((r) => r.studentUserId === student.userId)
            .map((r) => r.id);
          const marksForSession = physicalMarks.find(
            (m) =>
              studentRegistrationIds.includes(m.studentRegistrationId) &&
              m.examTitle === session.examTitle &&
              new Date(m.examDate).getTime() ===
                new Date(session.examDate).getTime()
          );
          return {
            studentId: student.userId,
            studentName: student.name,
            studentPublicId: student.studentPublicId,
            mark: marksForSession ? marksForSession.score : null,
          };
        });
        return {
          id: `physical-${index}`,
          title: session.examTitle,
          type: "Physical",
          results,
        };
      }
    );

    return convertToPlainObject({
      summary: studentAnalytics,
      papers: [...onlinePapers, ...physicalPapers],
    });
  } catch (error) {
    console.error("Failed to fetch course analytics:", error);
    throw new Error("Failed to fetch course analytics");
  }
}
