import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const { content, type = "brief" } = await req.json();

    if (!content) {
      return Response.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    let prompt = "";
    if (type === "brief") {
      prompt = `Provide a brief summary (3-5 sentences) of the following content:\n\n${content}`;
    } else if (type === "detailed") {
      prompt = `Provide a detailed summary with key points and main concepts of the following content:\n\n${content}`;
    } else {
      prompt = `Summarize the following content:\n\n${content}`;
    }

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt,
    });

    return Response.json({ summary: text });
  } catch (error) {
    console.error("Error generating summary:", error);
    return Response.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
