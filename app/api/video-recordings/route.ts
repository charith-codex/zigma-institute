import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getVideoRecordings,
  createVideoRecording,
} from "@/lib/actions/video-recording";

// Schema for validating POST body
const createSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  fileUrl: z.string().url("fileUrl must be a valid URL"),
  uploadedById: z.string().optional().nullable(),
  courseId: z.string().optional().nullable(),
  lessonId: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const recordings = await getVideoRecordings();
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
    const json = await req.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const created = await createVideoRecording(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create video recording", error);
    return NextResponse.json(
      { error: "Failed to create video recording" },
      { status: 500 }
    );
  }
}
