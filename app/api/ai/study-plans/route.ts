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

    const prompt = `Create a ${duration || "2-week"} study plan for learning "${topic}" at ${difficulty} level. Include:
1. Weekly breakdown of topics to cover
2. Daily study goals
3. Recommended resources
4. Practice exercises
5. Milestones and checkpoints

Format the response as a structured study plan.`;

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
