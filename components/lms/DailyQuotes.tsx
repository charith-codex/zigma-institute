import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Quote } from "lucide-react";

const motivationalQuotes = [
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius"
  },
  {
    text: "Learning never exhausts the mind.",
    author: "Leonardo da Vinci"
  },
  {
    text: "The expert in anything was once a beginner.",
    author: "Helen Hayes"
  },
  {
    text: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis"
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins"
  },
  {
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein"
  },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier"
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  }
];

export const DailyQuotes = () => {
  const [currentQuote, setCurrentQuote] = useState(() => {
    // Get quote based on current date for consistency
    const today = new Date().getDate();
    return motivationalQuotes[today % motivationalQuotes.length];
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshQuote = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
      setCurrentQuote(motivationalQuotes[randomIndex]);
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Quote className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Daily Motivation</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshQuote}
            disabled={isRefreshing}
            className="h-8 w-8 p-0 hover:bg-primary/10"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="space-y-4">
          <blockquote className="text-lg font-medium text-foreground leading-relaxed italic">
            "{currentQuote.text}"
          </blockquote>
          <div className="flex justify-end">
            <cite className="text-sm text-muted-foreground font-medium not-italic">
              — {currentQuote.author}
            </cite>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/5 to-transparent rounded-full translate-y-12 -translate-x-12" />
      </CardContent>
    </Card>
  );
};