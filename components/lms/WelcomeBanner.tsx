"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Quote } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface WelcomeBannerProps {
  onDismiss?: () => void;
  dismissible?: boolean;
}

export function WelcomeBanner({
  onDismiss,
  dismissible = true,
}: WelcomeBannerProps) {
  const { data: session } = useSession();
  const [isDismissed, setIsDismissed] = useState(false);
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const userName = session?.user?.name || "Student";

  if (isDismissed) return null;

  return (
    <Card className="relative overflow-hidden bg-linear-to-br from-primary/10 via-primary/5 to-background border-primary/20">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl -ml-24 -mb-24" />

      <CardContent className="relative py-3 sm:pt-4 sm:px-8">
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            {/* Greeting */}
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                {getGreeting()}, {userName}!
              </h2>
            </div>
          </div>

          {/* Daily Quote Section */}
          <div className="pt-6 border-2 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Quote className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">
                Daily Motivation
              </h3>
            </div>

            {currentQuote ? (
              <div className="space-y-3">
                <blockquote className="text-lg text-center sm:text-xl text-yellow-600 dark:text-yellow-500 font-medium leading-relaxed italic">
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
