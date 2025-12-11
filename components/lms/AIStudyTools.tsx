"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, Target } from "lucide-react";
import { FlashcardGenerator } from "./FlashcardGenerator";
import { SummaryGenerator } from "./SummaryGenerator";
import { StudyPlanGenerator } from "./StudyPlanGenerator";

export const AIStudyTools = () => {
  const [activeTab, setActiveTab] = useState<
    "flashcards" | "summaries" | "study-plans"
  >("flashcards");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">AI Study Tools</h1>
        <p className="text-muted-foreground mb-6">
          Use AI-powered tools to enhance your learning experience
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-muted/50 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "flashcards" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("flashcards")}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Flashcards
        </Button>
        <Button
          variant={activeTab === "summaries" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("summaries")}
        >
          <FileText className="w-4 h-4 mr-2" />
          Summaries
        </Button>
        <Button
          variant={activeTab === "study-plans" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("study-plans")}
        >
          <Target className="w-4 h-4 mr-2" />
          Study Plans
        </Button>
      </div>

      {/* Content */}
      {activeTab === "flashcards" && <FlashcardGenerator />}
      {activeTab === "summaries" && <SummaryGenerator />}
      {activeTab === "study-plans" && <StudyPlanGenerator />}
    </div>
  );
};

export default AIStudyTools;
