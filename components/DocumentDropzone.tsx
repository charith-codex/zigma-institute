"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { FileCheck2, FileText, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { useUploadThing } from "@/lib/uploadthing";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DocumentDropzoneProps {
  onUploadComplete: (payload: {
    url: string;
    name: string;
    size: number;
    type: string;
  }) => void;
  className?: string;
  disabled?: boolean;
}

const MAX_DOCUMENT_SIZE = 16 * 1024 * 1024; // 16MB
const ACCEPTED_FILE_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [
    ".pptx",
  ],
};

type UploadStatus = "idle" | "uploading" | "success";

export default function DocumentDropzone({
  onUploadComplete,
  className,
  disabled = false,
}: DocumentDropzoneProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>("idle");

  const { startUpload, isUploading } = useUploadThing("documentUploader", {
    uploadProgressGranularity: "fine",
    onUploadBegin: () => {
      setStatus("uploading");
      setProgress(0);
    },
    onUploadProgress: (value) => {
      setProgress(Math.max(0, Math.min(100, Math.round(value))));
    },
    onClientUploadComplete: (result) => {
      const file = result?.[0];
      if (file?.url && file?.name) {
        setProgress(100);
        setStatus("success");
        toast.success("Document uploaded");
        onUploadComplete({
          url: file.url,
          name: file.name,
          size: file.size ?? 0,
          type: file.type ?? "",
        });
      } else {
        resetStateWithError();
      }
    },
    onUploadError: (error) => {
      console.error("Document upload failed", error);
      resetStateWithError(error.message);
    },
  });

  const resetStateWithError = (message?: string) => {
    setStatus("idle");
    setProgress(0);
    if (message) {
      toast.error(message);
    } else {
      toast.error("Upload failed. Please try again.");
    }
  };

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length || isUploading) {
        return;
      }

      const [file] = acceptedFiles;

      try {
        const uploadResult = await startUpload([file]);
        if (!uploadResult) {
          resetStateWithError();
        }
      } catch (error) {
        console.error("Document upload error", error);
        resetStateWithError();
      }
    },
    [isUploading, startUpload]
  );

  const handleReject = useCallback((rejections: FileRejection[]) => {
    const fallback =
      "Only PDF, Word, Excel, or PowerPoint files under 16MB are allowed.";
    const message = rejections[0]?.errors[0]?.message ?? fallback;
    toast.error(message);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    onDropRejected: handleReject,
    multiple: false,
    disabled: disabled || isUploading,
    maxFiles: 1,
    maxSize: MAX_DOCUMENT_SIZE,
    accept: ACCEPTED_FILE_TYPES,
  });

  const showProgress = status !== "idle" || progress > 0;

  return (
    <div
      {...getRootProps({
        className: cn(
          "flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-muted/30 px-6 text-center text-sm text-muted-foreground transition-all hover:border-muted-foreground",
          isDragActive && "border-primary bg-primary/5 text-primary",
          (disabled || isUploading) && "pointer-events-none opacity-70",
          className
        ),
      })}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {status === "success" ? (
          <FileCheck2 className="h-10 w-10 text-primary" aria-hidden />
        ) : (
          <UploadCloud className="h-10 w-10 text-primary" aria-hidden />
        )}
        <div className="space-y-1">
          <p className="text-base font-medium text-foreground">
            {isDragActive ? "Drop the document" : "Upload a course document"}
          </p>
          <p>PDF, Word, Excel, or PowerPoint up to 16MB.</p>
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
                <FileText className="h-3.5 w-3.5" />
                {progress}%
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
