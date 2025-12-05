"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { CheckCircle2, ImageIcon, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { useUploadThing } from "@/lib/uploadthing";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  onUploadComplete: (url: string) => void;
  className?: string;
  disabled?: boolean;
}

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB limit to mirror server rules

export default function ImageDropzone({
  onUploadComplete,
  className,
  disabled = false,
}: ImageDropzoneProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "success">(
    "idle"
  );

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    uploadProgressGranularity: "fine",
    onUploadBegin: () => {
      setStatus("uploading");
      setProgress(0);
    },
    onUploadProgress: (value) => {
      setProgress(Math.max(0, Math.min(100, Math.round(value))));
    },
    onClientUploadComplete: (result) => {
      const fileUrl = result?.[0]?.url;
      if (fileUrl) {
        setProgress(100);
        setStatus("success");
        toast.success("Image uploaded");
        onUploadComplete(fileUrl);
      } else {
        setStatus("idle");
        toast.error("Upload failed. Please try again.");
      }
    },
    onUploadError: (error) => {
      console.error("Cover image upload failed", error);
      setStatus("idle");
      setProgress(0);
      toast.error(error.message || "Upload failed. Please try again.");
    },
  });

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length || isUploading) {
        return;
      }

      const [file] = acceptedFiles;

      try {
        const uploadResult = await startUpload([file]);
        if (!uploadResult) {
          setStatus("idle");
          setProgress(0);
          toast.error("Upload failed. Please try again.");
        }
      } catch (error) {
        console.error("Cover image upload error", error);
        setStatus("idle");
        setProgress(0);
        toast.error("Upload failed. Please try again.");
      }
    },
    [isUploading, startUpload]
  );

  const handleReject = useCallback((rejections: FileRejection[]) => {
    const message =
      rejections[0]?.errors[0]?.message ||
      "File not accepted. Please upload a valid image under 4MB.";
    toast.error(message);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    onDropRejected: handleReject,
    multiple: false,
    disabled: disabled || isUploading,
    maxFiles: 1,
    maxSize: MAX_IMAGE_SIZE,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/avif": [],
    },
  });

  const showProgress = status !== "idle" || progress > 0;

  return (
    <div
      {...getRootProps({
        className: cn(
          "flex h-44 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-muted/30 px-6 text-center text-sm text-muted-foreground transition-all hover:border-muted-foreground",
          isDragActive && "border-primary bg-primary/5 text-primary",
          (disabled || isUploading) && "pointer-events-none opacity-70",
          className
        ),
      })}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {status === "success" ? (
          <CheckCircle2 className="h-10 w-10 text-primary" aria-hidden />
        ) : (
          <UploadCloud className="h-10 w-10 text-primary" aria-hidden />
        )}
        <div className="space-y-1">
          <p className="text-base font-medium text-foreground">
            {isDragActive ? "Drop the image" : "Drag & drop or click to upload"}
          </p>
          <p>JPEG, PNG, WebP, or AVIF up to 4MB.</p>
        </div>
      </div>
      {showProgress && (
        <div className="mt-4 flex w-full flex-col gap-2">
          <Progress value={progress} />
          <div className="flex items-center justify-between text-xs">
            <span>
              {status === "uploading"
                ? `Uploading ${progress}%`
                : status === "success"
                  ? "Upload complete"
                  : ""}
            </span>
            {status !== "success" && (
              <span className="flex items-center gap-1">
                <ImageIcon className="h-3.5 w-3.5" />
                {progress}%
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
