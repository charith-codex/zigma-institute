import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Brain, CheckCircle, FileText } from "lucide-react";

export const TutorialManager = () => {
  const [activeTab, setActiveTab] = useState<'summaries' | 'quizzes' | 'flashcards'>('summaries');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI Study Tools</h2>
          <p className="text-muted-foreground">Generate AI-powered summaries, quizzes, and flashcards from your class notes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted/50 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'summaries' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('summaries')}
        >
          <FileText className="w-4 h-4 mr-2" />
          Summaries
        </Button>
        <Button
          variant={activeTab === 'quizzes' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('quizzes')}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Quizzes
        </Button>
        <Button
          variant={activeTab === 'flashcards' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('flashcards')}
        >
          <Brain className="w-4 h-4 mr-2" />
          Flashcards
        </Button>
      </div>

      {/* AI Summaries Tab */}
      {activeTab === 'summaries' && (
        <div className="space-y-6">
          <Card className="border-2 border-dashed border-primary/20">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Generate AI Summaries</h3>
                  <p className="text-muted-foreground">
                    Upload your class notes or tutorials to generate concise AI-powered summaries
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Upload Notes
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Brain className="w-4 h-4" />
                    Generate from Text
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Quizzes Tab */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          <Card className="border-2 border-dashed border-primary/20">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Generate AI Quizzes</h3>
                  <p className="text-muted-foreground">
                    Create interactive quizzes from your study materials to test your knowledge
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Upload Material
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Brain className="w-4 h-4" />
                    Generate Quiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Flashcards Tab */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6">
          <Card className="border-2 border-dashed border-primary/20">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Generate AI Flashcards</h3>
                  <p className="text-muted-foreground">
                    Create interactive flashcards from your study materials for effective learning
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Upload Content
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Brain className="w-4 h-4" />
                    Generate Cards
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Force refresh to clear cache
export default TutorialManager;