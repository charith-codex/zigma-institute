import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar } from "lucide-react";
import { Week } from "./WeekManager";

interface WeekNavigationProps {
  weeks: Week[];
  selectedWeek?: string;
  onSelectWeek: (weekId: string) => void;
}

export function WeekNavigation({ weeks, selectedWeek, onSelectWeek }: WeekNavigationProps) {
  const sortedWeeks = weeks.sort((a, b) => a.order - b.order);

  if (weeks.length === 0) {
    return (
      <div className="p-4 text-center">
        <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No weeks available</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-2">
        {sortedWeeks.map((week) => (
          <Button
            key={week.id}
            variant={selectedWeek === week.id ? "default" : "ghost"}
            className={`w-full justify-start h-auto p-3 ${
              selectedWeek === week.id 
                ? "bg-gradient-primary text-white shadow-medium" 
                : "hover:bg-primary/5"
            }`}
            onClick={() => onSelectWeek(week.id)}
          >
            <div className="flex flex-col items-start w-full">
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`font-medium text-sm ${
                  selectedWeek === week.id ? 'text-white' : ''
                }`}>
                  Week {week.order}
                </span>
                <Badge 
                  variant={selectedWeek === week.id ? "secondary" : "outline"} 
                  className="text-xs"
                >
                  {week.materialCount}
                </Badge>
              </div>
              <span className={`text-xs truncate w-full text-left ${
                selectedWeek === week.id 
                  ? 'text-white/80' 
                  : 'text-muted-foreground'
              }`}>
                {week.title}
              </span>
              {week.startDate && (
                <div className={`flex items-center gap-1 mt-1 text-xs ${
                  selectedWeek === week.id 
                    ? 'text-white/70' 
                    : 'text-muted-foreground'
                }`}>
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(week.startDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}