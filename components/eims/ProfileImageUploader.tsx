"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadButton } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { XIcon, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  label?: string;
}

export function ProfileImageUploader({
  value,
  onChange,
  disabled,
  label = "Profile image",
}: ProfileImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "relative h-20 w-20 overflow-hidden rounded-md border bg-muted flex items-center justify-center",
            !value && "text-muted-foreground"
          )}
        >
          {value ? (
            <Image
              src={value}
              alt="Profile"
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <ImageIcon className="h-8 w-8" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <UploadButton
            endpoint="imageUploader"
            appearance={{
              button: cn("w-full justify-center", isUploading && "opacity-70"),
            }}
            content={{
              button({ ready }) {
                if (isUploading) return "Uploading...";
                return ready
                  ? value
                    ? "Change image"
                    : "Upload image"
                  : "Connecting...";
              },
            }}
            onUploadBegin={() => setIsUploading(true)}
            onClientUploadComplete={(res) => {
              setIsUploading(false);
              const fileUrl = res?.[0]?.url;
              if (fileUrl) {
                onChange(fileUrl);
              }
            }}
            onUploadError={(err) => {
              setIsUploading(false);
              console.error("Profile image upload failed", err);
            }}
            disabled={disabled || isUploading}
          />
          {value && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange("")}
                disabled={disabled || isUploading}
              >
                <XIcon className="mr-2 h-4 w-4" /> Remove
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            JPG/PNG up to ~5MB. Square images look best.
          </p>
        </div>
      </div>
    </div>
  );
}
