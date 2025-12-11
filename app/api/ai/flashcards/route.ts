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

    const prompt = `Generate exactly ${count} flashcards from the following content. Format each flashcard as a JSON object with "question" and "answer" fields.

Content: ${content}

IMPORTANT: Return ONLY a valid JSON array, nothing else. No explanations, no markdown formatting.
Return format: [{"question": "...", "answer": "..."}, ...]`;

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
    });

    // Parse the JSON response - handle markdown code blocks and extra text
    let cleanedText = text.trim();
    
    // Remove markdown code blocks if present
    if (cleanedText.includes("```json")) {
      cleanedText = cleanedText.replace(/```json\s*/g, "").replace(/```\s*/g, "");
    } else if (cleanedText.includes("```")) {
      cleanedText = cleanedText.replace(/```\s*/g, "");
    }
    
    // Try to extract JSON array if wrapped in text
    const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }
    
    const flashcards = JSON.parse(cleanedText.trim());
    
    // Validate the response structure
    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      throw new Error("Invalid flashcards format");
    }
    
    // Ensure each flashcard has question and answer
    const validFlashcards = flashcards.filter(
      (card: { question?: string; answer?: string }) =>
        card.question && card.answer
    );
    
    if (validFlashcards.length === 0) {
      throw new Error("No valid flashcards generated");
    }

    return Response.json({ flashcards: validFlashcards });
  } catch (error) {
    console.error("Error generating flashcards:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to generate flashcards";
    
    if (error instanceof SyntaxError) {
      errorMessage = "Invalid response format from AI. Please try again.";
    } else if (error instanceof Error) {
      if (error.message.includes("Invalid flashcards format")) {
        errorMessage = "AI did not return valid flashcards. Please try again.";
      } else if (error.message.includes("No valid flashcards")) {
        errorMessage = "No valid flashcards were generated. Please try with different content.";
      }
    }
    
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
