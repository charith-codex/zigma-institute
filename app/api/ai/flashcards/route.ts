import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const { content, count = 5 } = await req.json();

    if (!content) {
      return Response.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const prompt = `Generate ${count} flashcards from the following content. Format each flashcard as a JSON object with "question" and "answer" fields. Return only a JSON array of flashcards.

Content: ${content}

Return format: [{"question": "...", "answer": "..."}, ...]`;

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt,
    });

    // Parse the JSON response
    const flashcards = JSON.parse(text.trim());

    return Response.json({ flashcards });
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return Response.json(
      { error: "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}
