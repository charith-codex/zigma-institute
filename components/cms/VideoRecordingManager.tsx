"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PlayCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlayer } from "@/components/lms/VideoPlayer";

interface VideoRecording {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
}

interface VideoRecordingManagerProps {
  lessonId?: string;
  lessonTitle?: string;
  readOnly?: boolean;
}

export function VideoRecordingManager({
  lessonId,
  lessonTitle,
  readOnly = false,
}: VideoRecordingManagerProps) {
  const [videos, setVideos] = useState<VideoRecording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    fileUrl: "",
  });
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const selectedVideo = useMemo(() => {
    return videos.find((video) => video.id === selectedVideoId) ?? null;
  }, [selectedVideoId, videos]);

  const fetchVideos = useCallback(
    async (options?: { showLoading?: boolean }) => {
      if (!lessonId) {
        setVideos([]);
        setIsLoading(false);
        return;
      }

      if (options?.showLoading) setIsLoading(true);

      try {
        const endpoint = `/api/video-recordings?lessonId=${encodeURIComponent(
          lessonId
        )}`;
        const response = await fetch(endpoint, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch video recordings");

        const data = (await response.json()) as VideoRecording[];
        setVideos(data);
        setSelectedVideoId((previous) => {
          if (previous && data.some((video) => video.id === previous)) {
            return previous;
          }
          return data[0]?.id ?? null;
        });
      } catch (error) {
        console.error(error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to fetch video recordings"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [lessonId]
  );

  useEffect(() => {
    void fetchVideos({ showLoading: true });
  }, [fetchVideos]);

  useEffect(() => {
    if (!lessonId) {
      setSelectedVideoId(null);
    }
  }, [lessonId]);

  const handleSubmit = async () => {
    if (!lessonId) {
      toast.error("Select a lesson before adding a video.");
      return;
    }

    try {
      const { title, description, fileUrl } = formState;
      if (!title || !fileUrl) {
        toast.error("Title and video URL are required.");
        return;
      }

      const endpoint = `/api/video-recordings?lessonId=${encodeURIComponent(
        lessonId
      )}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, fileUrl, lessonId }),
      });

      if (!response.ok) throw new Error("Failed to add video recording");

      toast.success("Video recording added successfully.");
      setFormState({ title: "", description: "", fileUrl: "" });
      setIsDialogOpen(false);
      await fetchVideos();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add video"
      );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle>
            Video Recordings{lessonTitle ? ` • ${lessonTitle}` : ""}
          </CardTitle>
          <CardDescription>
            Add and view your recorded sessions or tutorials
            {lessonTitle ? ` for ${lessonTitle}` : ""}.
          </CardDescription>
        </div>

        {!readOnly && (
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              if (open && !lessonId) {
                toast.error("Select a lesson before adding a video.");
                return;
              }
              setIsDialogOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button disabled={!lessonId}>
                <PlayCircle className="mr-2 h-4 w-4" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add a Video Recording</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="video-title">Title</Label>
                  <Input
                    id="video-title"
                    placeholder="e.g. React Hooks Tutorial"
                    value={formState.title}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video-description">Description</Label>
                  <Textarea
                    id="video-description"
                    placeholder="Add a short note (optional)"
                    value={formState.description}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video-url">Video URL</Label>
                  <Input
                    id="video-url"
                    placeholder="https://example.com/video.mp4"
                    value={formState.fileUrl}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        fileUrl: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  Save Video
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>

      <CardContent>
        {!lessonId ? (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-sm text-muted-foreground">
            Select a lesson to view or add recordings.
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-sm text-muted-foreground">
            <PlayCircle className="h-8 w-8" />
            <p>No video recordings added yet.</p>
            <p>Use the add button above to include your first video.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="rounded-lg border bg-muted/30 p-4">
              {selectedVideo ? (
                <VideoPlayer
                  src={selectedVideo.fileUrl}
                  title={selectedVideo.title}
                  description={selectedVideo.description ?? undefined}
                />
              ) : (
                <div className="flex min-h-60 items-center justify-center text-sm text-muted-foreground">
                  Select a video to start playing.
                </div>
              )}
            </div>
            <div className="space-y-2">
              {videos.map((video) => {
                const isActive = video.id === selectedVideoId;
                return (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => setSelectedVideoId(video.id)}
                    className={`w-full rounded-lg border p-4 text-left transition hover:bg-muted/60 ${
                      isActive ? "border-primary bg-primary/10" : "bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {video.title}
                        </p>
                        {video.description && (
                          <p className="text-sm text-muted-foreground">
                            {video.description}
                          </p>
                        )}
                      </div>
                      <PlayCircle
                        className={`h-4 w-4 ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default VideoRecordingManager;
