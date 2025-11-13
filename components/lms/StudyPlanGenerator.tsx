"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, RefreshCw, Sparkles } from "lucide-react";

export default function StudyPlanGenerator() {
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("2 weeks");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [plan, setPlan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePlan = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic to create a study plan");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/study-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, duration, difficulty }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate study plan");
      }

      setPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-accent" />
          AI Study Plan Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Topic to Study</label>
          <Input
            placeholder="e.g., Python Programming, Calculus, World History"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Duration</label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 week">1 Week</SelectItem>
                <SelectItem value="2 weeks">2 Weeks</SelectItem>
                <SelectItem value="1 month">1 Month</SelectItem>
                <SelectItem value="3 months">3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty Level</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button onClick={generatePlan} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Study Plan
            </>
          )}
        </Button>

        {plan && (
          <div className="mt-6 p-6 bg-accent/5 border border-accent/20 rounded-lg">
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2 text-accent">
              <Target className="w-4 h-4" />
              Your Personalized Study Plan
            </h4>
            <div className="text-sm leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert [&>*]:mb-3 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-medium [&_ul]:ml-4 [&_ol]:ml-4 [&_li]:mb-1">
              {plan}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
