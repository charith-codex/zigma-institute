import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const { topic, duration, difficulty = "intermediate" } = await req.json();

    if (!topic) {
      return Response.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const prompt = `Create a concise ${duration || "2-week"} short mini study plan for learning "${topic}" at ${difficulty} level.

Format as a clear, organized plan with:
• Weekly breakdown (use headers like "Week 1:", "Week 2:")
• Daily study goals (bullet points, keep brief)
• Key milestones
• Recommended practice

Keep it concise and well-formatted with clear sections. give response as table`;

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt,
    });

    return Response.json({ plan: text });
  } catch (error) {
    console.error("Error generating study plan:", error);
    return Response.json(
      { error: "Failed to generate study plan" },
      { status: 500 }
    );
  }
}
