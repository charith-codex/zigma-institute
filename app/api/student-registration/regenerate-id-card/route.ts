import { NextResponse } from "next/server";
import { z } from "zod";

import { generateAndUploadIdCard } from "@/lib/student-registration/generate-id-card";

const regenerateSchema = z.object({
  registrationId: z.string().min(1),
});

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const data = regenerateSchema.safeParse(payload);

  if (!data.success) {
    const message = data.error.issues.map((issue) => issue.message).join("\n");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  console.log(`Regenerating ID card for registration ${data.data.registrationId}`);
  
  const result = await generateAndUploadIdCard(data.data.registrationId);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Failed to generate ID card" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    idCardUrl: result.idCardUrl,
  });
}
