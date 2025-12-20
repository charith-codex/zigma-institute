"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";

export interface StudentPerformanceData {
  physicalExams: {
    id: string;
    courseName: string;
    examTitle: string;
    score: number;
    recordedAt: Date;
    paperUrl: string;
  }[];
  onlineExams: {
    id: string;
    courseName: string;
    examTitle: string;
    score: number | null;
    totalMarks: number;
    submittedAt: Date | null;
    status: string;
  }[];
  courseAverages: Record<string, number>;
}

export async function getStudentPerformance(): Promise<
  | { success: true; data: StudentPerformanceData }
  | { success: false; message: string }
> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const userId = session.user.id;

    // 1. Fetch Student Profile to get studentPublicId
    // Some logic might rely on `Student` model relation
    const studentProfile = await prisma.student.findUnique({
      where: { userId },
    });

    // We need studentPublicId for Physical Exams if they are linked via that ID
    // or we can link via studentRegistration -> user connection if available.
    // Based on schema, PhysicalExamMark has studentRegistrationId and studentPublicId.
    // Ideally we find all registrations for this user, then find marks for those registrations.

    // Get all registrations for this user
    const registrations = await prisma.studentRegistration.findMany({
      where: { studentUserId: userId },
      select: { id: true, studentPublicId: true },
    });

    const registrationIds = registrations.map((r) => r.id);
    const publicIds = registrations
      .map((r) => r.studentPublicId)
      .filter((id): id is string => !!id);

    // If student has a direct student profile with public ID, add it too
    if (studentProfile?.studentPublicId) {
      publicIds.push(studentProfile.studentPublicId);
    }

    // 2. Fetch Physical Exam Marks
    // Using OR to match either registration ID or public ID is safest if data consistency is mixed
    const physicalMarks = await prisma.physicalExamMark.findMany({
      where: {
        OR: [
          { studentRegistrationId: { in: registrationIds } },
          { studentPublicId: { in: publicIds } },
        ],
      },
      include: {
        course: {
          select: { name: true },
        },
      },
      orderBy: { recordedAt: "desc" },
    });

    const formattedPhysicalExams = physicalMarks.map((mark) => ({
      id: mark.id,
      courseName: mark.course.name,
      examTitle: mark.examTitle,
      score: mark.score,
      recordedAt: mark.recordedAt,
      paperUrl: mark.paperUrl,
    }));

    // 3. Fetch Online Exam Attempts
    // Online exams are linked via ExamAttempt.studentId which usually is the User ID
    const onlineAttempts = await prisma.examAttempt.findMany({
      where: {
        studentId: userId,
        status: "GRADED", // Only show graded exams? Or all? Let's show submitted/graded.
      },
      include: {
        exam: {
          select: {
            title: true,
            course: { select: { name: true } },
            questions: { select: { marks: true } },
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    const formattedOnlineExams = onlineAttempts.map((attempt) => {
      const totalMarks = attempt.exam.questions.reduce(
        (sum, q) => sum + q.marks,
        0
      );
      return {
        id: attempt.id,
        courseName: attempt.exam.course?.name || "General",
        examTitle: attempt.exam.title,
        score: attempt.score,
        totalMarks,
        submittedAt: attempt.submittedAt,
        status: attempt.status,
      };
    });

    // 4. Calculate Course Averages
    // We need to get all PHYSICAL and ONLINE exam marks for each course
    const allPhysicalMarks = await prisma.physicalExamMark.findMany({
      select: {
        courseId: true,
        score: true,
      },
    });

    const allOnlineAttempts = await prisma.examAttempt.findMany({
      where: { status: "GRADED" },
      select: {
        score: true,
        exam: {
          select: {
            courseId: true,
            questions: { select: { marks: true } },
          },
        },
      },
    });

    const courseStats: Record<string, { totalScore: number; count: number }> =
      {};

    // Process physical marks
    allPhysicalMarks.forEach((mark) => {
      if (!courseStats[mark.courseId]) {
        courseStats[mark.courseId] = { totalScore: 0, count: 0 };
      }
      courseStats[mark.courseId].totalScore += mark.score;
      courseStats[mark.courseId].count += 1;
    });

    // Process online attempts
    allOnlineAttempts.forEach((attempt) => {
      const courseId = attempt.exam.courseId;
      if (!courseId) return;

      const totalMarks = attempt.exam.questions.reduce(
        (sum, q) => sum + q.marks,
        0
      );
      if (totalMarks === 0) return;

      const percentage = (attempt.score || 0) / totalMarks;

      if (!courseStats[courseId]) {
        courseStats[courseId] = { totalScore: 0, count: 0 };
      }
      // Store physical as 0-100, online percentage * 100 for consistency
      courseStats[courseId].totalScore += percentage * 100;
      courseStats[courseId].count += 1;
    });

    const courseAverages: Record<string, number> = {};
    Object.entries(courseStats).forEach(([courseId, stats]) => {
      courseAverages[courseId] =
        stats.count > 0 ? stats.totalScore / stats.count : 0;
    });

    return {
      success: true,
      data: convertToPlainObject({
        physicalExams: formattedPhysicalExams,
        onlineExams: formattedOnlineExams,
        courseAverages,
      }),
    };
  } catch (error) {
    console.error("Error fetching student performance:", error);
    return {
      success: false,
      message: "Failed to load performance data.",
    };
  }
}
