import { NextResponse } from "next/server";
import { hashSync } from "bcrypt-ts-edge";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { generateAndUploadIdCard } from "@/lib/student-registration/generate-id-card";
import { generateAndStoreStudentQrCode } from "@/lib/student-registration/qr-code";
import { generateStudentPublicId } from "@/lib/student-registration/identifiers";
import { generateRandomPassword } from "@/lib/student-registration/password";
import { registrationRequestSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const session = await auth();

  const isAuthorizedRole = ["ADMIN", "MANAGER"].includes(
    session?.user?.role ?? ""
  );

  if (!session?.user || !isAuthorizedRole) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parseResult = registrationRequestSchema.safeParse(payload);

  if (!parseResult.success) {
    const message = parseResult.error.issues
      .map((issue) => issue.message)
      .join("\n");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const data = parseResult.data;

  const courses = await prisma.course.findMany({
    where: { id: { in: data.courses } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, currency: true, priceInCents: true },
  });

  if (courses.length === 0) {
    return NextResponse.json(
      { error: "Selected courses could not be found." },
      { status: 404 }
    );
  }

  const missingCourses = data.courses.filter(
    (courseId) => !courses.some((course) => course.id === courseId)
  );

  if (missingCourses.length > 0) {
    return NextResponse.json(
      { error: "One or more selected courses are unavailable." },
      { status: 400 }
    );
  }

  const currency = courses[0]?.currency ?? "usd";
  const hasMixedCurrencies = courses.some(
    (course) => course.currency.toLowerCase() !== currency.toLowerCase()
  );

  if (hasMixedCurrencies) {
    return NextResponse.json(
      { error: "All selected courses must share the same currency." },
      { status: 400 }
    );
  }

  const totalAmountInCents = courses.reduce(
    (sum, course) => sum + (course.priceInCents ?? 0),
    0
  );

  const dob = new Date(data.dateOfBirth);

  if (Number.isNaN(dob.valueOf())) {
    return NextResponse.json(
      { error: "Date of birth is invalid." },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "A user with this email already exists." },
      { status: 409 }
    );
  }

  const plainPassword = generateRandomPassword();
  const hashedPassword = hashSync(plainPassword, 10);

  try {
    const { registrationId, studentPublicId } = await prisma.$transaction(
      async (tx) => {
        const newPublicId = await generateStudentPublicId(tx);

        const user = await tx.user.create({
          data: {
            name: data.name.trim(),
            email: data.email,
            password: hashedPassword,
            phone: data.phone,
            dob: dob,
            address: data.address ?? undefined,
            gender: data.gender ?? undefined,
            role: "STUDENT",
            profileImage: data.studentPhoto.url,
          },
        });

        await tx.student.create({
          data: {
            userId: user.id,
            studentPublicId: newPublicId,
            parentEmail: data.guardianEmail,
          },
        });

        const registration = await tx.studentRegistration.create({
          data: {
            name: data.name.trim(),
            email: data.email,
            phone: data.phone,
            address: data.address ?? null,
            gender: data.gender ?? null,
            dateOfBirth: dob,
            guardianEmail: data.guardianEmail,
            studentPhotoUrl: data.studentPhoto.url,
            studentPhotoKey: data.studentPhoto.key,
            totalAmountInCents,
            currency,
            status: "APPROVED",
            studentUserId: user.id,
            studentPublicId: newPublicId,
          },
        });

        await tx.studentRegistrationCourse.createMany({
          data: courses.map((course) => ({
            registrationId: registration.id,
            courseId: course.id,
          })),
        });

        await tx.enrollment.createMany({
          data: courses.map((course) => ({
            studentId: user.id,
            courseId: course.id,
          })),
          skipDuplicates: true,
        });

        return { registrationId: registration.id, studentPublicId: newPublicId };
      }
    );

    await generateAndStoreStudentQrCode(registrationId);
    const idCardResult = await generateAndUploadIdCard(registrationId);

    return NextResponse.json({
      registrationId,
      studentPublicId,
      temporaryPassword: plainPassword,
      idCardUrl: idCardResult.success ? idCardResult.idCardUrl ?? null : null,
    });
  } catch (error) {
    console.error("Failed to create student registration (admin)", error);
    return NextResponse.json(
      { error: "Unable to create student right now." },
      { status: 500 }
    );
  }
}
