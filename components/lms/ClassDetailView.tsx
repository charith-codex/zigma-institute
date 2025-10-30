import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  BookOpen,
  Video,
  FileText,
  Download,
  Play,
  Eye,
  Clock,
  X,
} from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";
import { WeekNavigation } from "./WeekNavigation";

interface ClassDetailViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  classData: any;
  onBack: () => void;
}

export const ClassDetailView = ({
  classData,
  onBack,
}: ClassDetailViewProps) => {
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  // Demo video sources
  const demoVideoSources = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  ];

  // Hardcoded weekly data for the class
  const weeklyData = Array.from({ length: classData.weeks }, (_, index) => {
    const weekNum = index + 1;
    return {
      id: `week-${weekNum}`,
      order: weekNum,
      title: `Introduction to ${
        classData.name.split(" ")[0]
      } - Week ${weekNum}`,
      description: `Week ${weekNum} course materials and assignments`,
      startDate: new Date(2024, 0, weekNum * 7).toISOString(),
      endDate: new Date(2024, 0, weekNum * 7 + 6).toISOString(),
      isActive: weekNum <= classData.completedWeeks + 1,
      materialCount: Math.floor(Math.random() * 8) + 4, // 4-12 materials per week
      materials: {
        tutorials: [
          {
            id: `t${weekNum}-1`,
            name: `Lecture Notes - Week ${weekNum}`,
            type: "pdf",
            size: "2.3 MB",
            viewed: Math.random() > 0.5,
          },
          {
            id: `t${weekNum}-2`,
            name: `Reading Assignment ${weekNum}`,
            type: "pdf",
            size: "1.8 MB",
            viewed: Math.random() > 0.5,
          },
        ],
        recordings: [
          {
            id: `r${weekNum}-1`,
            name: `Lecture Recording - Week ${weekNum}`,
            duration: "1h 25m",
            viewed: Math.random() > 0.5,
            progress: Math.floor(Math.random() * 100),
            videoSrc: demoVideoSources[0],
            instructor: classData.instructor,
            classDate: new Date(2024, 0, weekNum * 7).toLocaleDateString(),
            description: `Complete lecture recording for week ${weekNum} covering the fundamental concepts and practical examples.`,
          },
          {
            id: `r${weekNum}-2`,
            name: `Lab Session ${weekNum}`,
            duration: "45m",
            viewed: Math.random() > 0.5,
            progress: Math.floor(Math.random() * 100),
            videoSrc: demoVideoSources[1],
            instructor: classData.instructor,
            classDate: new Date(2024, 0, weekNum * 7 + 2).toLocaleDateString(),
            description: `Hands-on laboratory session with practical exercises and problem-solving activities.`,
          },
        ],
        assignments: [
          {
            id: `a${weekNum}-1`,
            name: `Assignment ${weekNum}`,
            dueDate: new Date(2024, 0, weekNum * 7 + 5).toLocaleDateString(),
            status: Math.random() > 0.5 ? "submitted" : "pending",
          },
          {
            id: `a${weekNum}-2`,
            name: `Quiz ${weekNum}`,
            dueDate: new Date(2024, 0, weekNum * 7 + 7).toLocaleDateString(),
            status: Math.random() > 0.5 ? "completed" : "available",
          },
        ],
        others: [
          {
            id: `o${weekNum}-1`,
            name: `Supplementary Material ${weekNum}`,
            type: "pdf",
            size: "950 KB",
          },
          {
            id: `o${weekNum}-2`,
            name: `Reference Links Week ${weekNum}`,
            type: "link",
          },
        ],
      },
    };
  });

  // Set first week as default
  if (!selectedWeek && weeklyData.length > 0) {
    setSelectedWeek(weeklyData[0].id);
  }

  const currentWeek = weeklyData.find((week) => week.id === selectedWeek);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MaterialCard = ({
    material,
    type,
  }: {
    material: any;
    type: string;
  }) => {
    const getIcon = () => {
      switch (type) {
        case "tutorials":
          return <FileText className="w-4 h-4" />;
        case "recordings":
          return <Video className="w-4 h-4" />;
        case "assignments":
          return <BookOpen className="w-4 h-4" />;
        default:
          return <Download className="w-4 h-4" />;
      }
    };

    const getStatusBadge = () => {
      if (type === "recordings") {
        return material.viewed ? (
          <Badge variant="outline" className="text-xs">
            {material.progress}% watched
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            Not watched
          </Badge>
        );
      }
      if (type === "assignments") {
        return (
          <Badge
            variant={
              material.status === "submitted" || material.status === "completed"
                ? "default"
                : "outline"
            }
            className="text-xs"
          >
            {material.status}
          </Badge>
        );
      }
      if (type === "tutorials") {
        return material.viewed ? (
          <Badge variant="default" className="text-xs">
            Viewed
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            New
          </Badge>
        );
      }
      return null;
    };

    return (
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              {getIcon()}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{material.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {material.duration && (
                  <>
                    <Clock className="w-3 h-3" />
                    <span>{material.duration}</span>
                  </>
                )}
                {material.size && <span>{material.size}</span>}
                {material.dueDate && <span>Due: {material.dueDate}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Button size="sm" variant="ghost">
              {type === "recordings" ? (
                <Play className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Week Navigation */}
      <div className="w-80 border-r border-border">
        <div className="p-4 border-b border-border">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Classes
          </Button>

          <div className="space-y-2">
            <h2 className="font-semibold text-lg">{classData.name}</h2>
            <p className="text-sm text-muted-foreground">
              {classData.code} • {classData.instructor}
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{classData.progress}%</span>
              </div>
              <Progress value={classData.progress} className="h-2" />
            </div>
          </div>
        </div>

        <WeekNavigation
          weeks={weeklyData}
          selectedWeek={selectedWeek}
          onSelectWeek={(weekId) => {
            setSelectedWeek(weekId);
            setSelectedVideo(null); // Clear selected video when switching weeks
          }}
        />
      </div>

      {/* Right Content Area */}
      <div className="flex-1 p-6 overflow-auto bg-muted/20">
        {currentWeek ? (
          <div className="space-y-6">
            {/* Video Recordings - Large Section */}
            {selectedVideo ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedVideo(null)}
                    className="text-sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Recordings List
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedVideo(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <VideoPlayer
                  src={selectedVideo.videoSrc}
                  title={selectedVideo.name}
                  description={selectedVideo.description}
                  duration={selectedVideo.duration}
                  instructor={selectedVideo.instructor}
                  classDate={selectedVideo.classDate}
                />
              </div>
            ) : (
              <Card className="min-h-[300px] bg-muted/50 border-dashed">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Video className="w-5 h-5" />
                    Video Recordings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentWeek.materials.recordings.map((material) => (
                    <Card
                      key={material.id}
                      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedVideo(material)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Play className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {material.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{material.duration}</span>
                              <span>•</span>
                              <span>{material.instructor}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {material.viewed ? (
                            <Badge variant="outline" className="text-xs">
                              {material.progress}% watched
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Not watched
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                  {currentWeek.materials.recordings.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No recordings available for this week</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Bottom Three Sections */}
            <div className="grid grid-cols-3 gap-6">
              {/* Tutes */}
              <Card className="bg-muted/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Tutes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentWeek.materials.tutorials.map((material) => (
                    <div
                      key={material.id}
                      className="p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium truncate">
                            {material.name}
                          </span>
                        </div>
                        {material.viewed && (
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                        )}
                      </div>
                      {material.size && (
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          {material.size}
                        </p>
                      )}
                    </div>
                  ))}
                  {currentWeek.materials.tutorials.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      No tutorials available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Papers */}
              <Card className="bg-muted/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Papers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentWeek.materials.assignments.map((material) => (
                    <div
                      key={material.id}
                      className="p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium truncate">
                            {material.name}
                          </span>
                        </div>
                        <Badge
                          variant={
                            material.status === "submitted" ||
                            material.status === "completed"
                              ? "default"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {material.status}
                        </Badge>
                      </div>
                      {material.dueDate && (
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          Due: {material.dueDate}
                        </p>
                      )}
                    </div>
                  ))}
                  {currentWeek.materials.assignments.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      No papers available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Other Study Materials */}
              <Card className="bg-muted/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">
                    Other Study Materials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentWeek.materials.others.map((material) => (
                    <div
                      key={material.id}
                      className="p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium truncate">
                          {material.name}
                        </span>
                      </div>
                      {material.size && (
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          {material.size}
                        </p>
                      )}
                    </div>
                  ))}
                  {currentWeek.materials.others.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      No materials available
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Select a Week</h3>
            <p className="text-muted-foreground">
              Choose a week from the sidebar to view materials
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
