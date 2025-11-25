"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

export const DailyQuotes = () => {
  const [currentQuote, setCurrentQuote] = useState<{
    text: string;
    author: string;
  } | null>(null);

  useEffect(() => {
    const fetchQuoteFromApi = async () => {
      try {
        const res = await fetch("/api/quotes");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        console.log(data);
        if (Array.isArray(data) && data.length) {
          const item: any = data[0];
          const text = item.q ?? item.quote ?? "";
          const author = item.a ?? item.author ?? "Unknown";
          setCurrentQuote({ text, author });
        }
      } catch (err) {
        console.error("Failed to fetch quote:", err);
      }
    };

    fetchQuoteFromApi();
  }, []);

  return (
    <Card className="relative overflow-hidden bg-linear-to-br from-primary/5 via-background to-secondary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Quote className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Daily Motivation</h3>
          </div>
        </div>

        {currentQuote ? (
          <div className="space-y-4">
            <blockquote className="text-2xl px-10 font-bold text-foreground leading-relaxed italic">
              {currentQuote.text}
            </blockquote>
            <div className="flex justify-end">
              <cite className="text-sm text-muted-foreground font-medium not-italic">
                — {currentQuote.author}
              </cite>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            Loading quote...
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-primary/5 to-transparent rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-linear-to-tr from-secondary/5 to-transparent rounded-full translate-y-12 -translate-x-12" />
      </CardContent>
    </Card>
  );
};
