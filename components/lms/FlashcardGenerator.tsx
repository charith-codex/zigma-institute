"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sparkles, RefreshCw, ChevronRight, ChevronLeft } from "lucide-react";

type Flashcard = {
  question: string;
  answer: string;
};

export const FlashcardGenerator = () => {
  const [content, setContent] = useState("");
  const [count, setCount] = useState(5);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFlashcards = async () => {
    if (!content.trim()) {
      setError("Please enter some content to generate flashcards");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, count }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate flashcards");
      }

      setFlashcards(data.flashcards);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Flashcard Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Study Content</label>
          <Textarea
            placeholder="Paste your study material here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Number of Flashcards</label>
          <Input
            type="number"
            min="1"
            max="20"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 5)}
            className="w-32"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          onClick={generateFlashcards}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Flashcards
            </>
          )}
        </Button>

        {flashcards.length > 0 && (
          <div className="space-y-4 mt-6">
            <div className="text-sm text-muted-foreground text-center">
              Card {currentIndex + 1} of {flashcards.length}
            </div>

            <div
              className="h-64 cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {!isFlipped ? (
                <div className="w-full h-full bg-primary/5 border-2 border-primary rounded-lg p-6 flex items-center justify-center transition-opacity duration-300">
                  <div className="text-center space-y-2">
                    <p className="text-xs text-muted-foreground uppercase">
                      Question
                    </p>
                    <p className="text-lg font-medium">
                      {flashcards[currentIndex].question}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-secondary/5 border-2 border-secondary rounded-lg p-6 flex items-center justify-center transition-opacity duration-300">
                  <div className="text-center space-y-2">
                    <p className="text-xs text-muted-foreground uppercase">
                      Answer
                    </p>
                    <p className="text-lg">{flashcards[currentIndex].answer}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={prevCard}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                Flip Card
              </Button>
              <Button
                variant="outline"
                onClick={nextCard}
                disabled={currentIndex === flashcards.length - 1}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FlashcardGenerator;
