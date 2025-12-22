import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { answerSchema, submissionSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");

    const attempts = await prisma.examAttempt.findMany({
      where: {
        examId: examId ?? undefined,
        studentId: studentId ?? undefined,
        status:
          status === "IN_PROGRESS" ||
          status === "SUBMITTED" ||
          status === "GRADED"
            ? status
            : undefined,
      },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            status: true,
            course: { select: { name: true } },
          },
        },
        answers: {
          orderBy: { createdAt: "asc" },
          include: { question: true },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    const studentIds = [...new Set(attempts.map((a) => a.studentId))];
    const students = await prisma.student.findMany({
      where: { userId: { in: studentIds } },
      select: { userId: true, studentPublicId: true },
    });

    const studentMap = new Map(
      students.map((s) => [s.userId, s.studentPublicId])
    );

    const sanitizedAttempts = attempts.map((attempt) => ({
      ...attempt,
      exam: attempt.exam
        ? {
            id: attempt.exam.id,
            title: attempt.exam.title,
            status: attempt.exam.status,
            courseName: attempt.exam.course?.name ?? null,
          }
        : null,
      studentPublicId: studentMap.get(attempt.studentId) ?? null,
    }));

    return NextResponse.json({
      attempts: JSON.parse(JSON.stringify(sanitizedAttempts)),
    });
  } catch (error) {
    console.error("Failed to fetch exam attempts", error);
    return NextResponse.json(
      { error: "Unable to fetch exam attempts. Please try again later." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = submissionSchema.parse(payload);

    const exam = await prisma.examPaper.findUnique({
      where: { id: data.examId },
      include: {
        questions: {
          include: { question: true },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (exam.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "This exam is not currently available" },
        { status: 409 }
      );
    }

    const existingAttempt = await prisma.examAttempt.findFirst({
      where: {
        examId: data.examId,
        studentId: data.studentId,
      },
    });

    if (existingAttempt) {
      return NextResponse.json(
        { error: "You have already submitted this exam." },
        { status: 409 }
      );
    }

    const questionMap = new Map(
      exam.questions.map((item) => [item.questionId, item])
    );

    let mcqScore = 0;

    const answerPayload = data.answers.map((answer) => {
      const examQuestion = questionMap.get(answer.questionId);

      if (!examQuestion) {
        throw new Error(
          `Question ${answer.questionId} is not part of this exam`
        );
      }

      if (examQuestion.question.type !== answer.type) {
        throw new Error(`Question type mismatch for ${answer.questionId}`);
      }

      if (answer.type === "MCQ" && !answer.selectedOption) {
        throw new Error(
          `A selected option is required for question ${answer.questionId}`
        );
      }

      let isCorrect: boolean | null = null;
      let marksAwarded: number | null = null;

      if (answer.type === "MCQ") {
        const selected = answer.selectedOption?.trim() ?? "";
        const correct = examQuestion.question.correctAnswer?.trim() ?? "";
        isCorrect =
          selected.localeCompare(correct, undefined, {
            sensitivity: "accent",
          }) === 0;
        marksAwarded = isCorrect ? examQuestion.marks : 0;
        mcqScore += marksAwarded ?? 0;
      }

      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption ?? null,
        answerText: answer.answerText ?? null,
        isCorrect,
        marksAwarded,
      };
    });

    const attempt = await prisma.examAttempt.create({
      data: {
        examId: data.examId,
        studentId: data.studentId,
        studentName: data.studentName ?? null,
        status: "SUBMITTED",
        submittedAt: new Date(),
        score: mcqScore,
        answers: {
          create: answerPayload,
        },
      },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            status: true,
            course: { select: { name: true } },
          },
        },
        answers: {
          orderBy: { createdAt: "asc" },
          include: { question: true },
        },
      },
    });

    const student = await prisma.student.findUnique({
      where: { userId: attempt.studentId },
      select: { studentPublicId: true },
    });

    const sanitizedAttempt = {
      ...attempt,
      studentPublicId: student?.studentPublicId ?? null,
      exam: attempt.exam
        ? {
            id: attempt.exam.id,
            title: attempt.exam.title,
            status: attempt.exam.status,
            courseName: attempt.exam.course?.name ?? null,
          }
        : null,
    };

    const evaluation = attempt.answers.map((answer) => ({
      answerId: answer.id,
      questionId: answer.questionId,
      type: answer.question.type,
      isCorrect: answer.isCorrect,
      marksAwarded: answer.marksAwarded,
      correctAnswer: answer.question.correctAnswer,
      explanation: answer.question.explanation,
      sampleAnswer: answer.question.sampleAnswer,
      studentAnswer: answer.answerText ?? answer.selectedOption ?? "",
    }));

    return NextResponse.json({
      attempt: JSON.parse(JSON.stringify(sanitizedAttempt)),
      evaluation: JSON.parse(JSON.stringify(evaluation)),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join("\n") },
        { status: 400 }
      );
    }

    console.error("Failed to submit exam", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Unable to submit exam. Please try again later." },
      { status: 500 }
    );
  }
}
