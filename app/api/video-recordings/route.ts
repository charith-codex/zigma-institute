import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";

import {
  getVideoRecordings,
  createVideoRecording,
} from "@/lib/actions/video-recording";

import { prisma } from "@/db/prisma";

// Schema for validating POST body
const createSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  fileUrl: z.string().url("fileUrl must be a valid URL"),
  lessonId: z.string().min(1, "lessonId is required"),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const lessonId = url.searchParams.get("lessonId");

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 }
      );
    }

    const recordings = await getVideoRecordings(lessonId);
    return NextResponse.json(recordings);
  } catch (error) {
    console.error("Failed to fetch video recordings", error);
    return NextResponse.json(
      { error: "Failed to fetch video recordings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user ID from the database using the email from session
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const created = await createVideoRecording({
      ...parsed.data,
      uploadedById: dbUser.id,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create video recording", error);
    return NextResponse.json(
      { error: "Failed to create video recording" },
      { status: 500 }
    );
  }
}
