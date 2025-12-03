import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@/lib/uploadthing";
import type { ShowcasePage } from "@/lib/generated/prisma";

export type MediaFormState = {
  id?: string;
  page: ShowcasePage;
  section: string;
  title: string;
  description: string;
  category: string;
  year?: number;
  imageUrl?: string;
  imageKey?: string;
  order: number;
};

type MediaItemFormProps = {
  value: MediaFormState;
  onChange: (value: MediaFormState) => void;
  onSubmit: () => void;
  onReset: () => void;
  submitting: boolean;
};

export function MediaItemForm({
  value,
  onChange,
  onSubmit,
  onReset,
  submitting,
}: MediaItemFormProps) {
  const hasImage = useMemo(() => Boolean(value.imageUrl), [value.imageUrl]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media & Gallery Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="media-section">Section</Label>
            <Input
              id="media-section"
              value={value.section}
              onChange={(event) =>
                onChange({ ...value, section: event.target.value })
              }
              placeholder="gallery, module, hero"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="media-order">Order</Label>
            <Input
              id="media-order"
              type="number"
              min={0}
              value={value.order}
              onChange={(event) =>
                onChange({ ...value, order: Number(event.target.value) })
              }
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="media-title">Title</Label>
            <Input
              id="media-title"
              value={value.title}
              onChange={(event) =>
                onChange({ ...value, title: event.target.value })
              }
              placeholder="Island Top Ranking Student"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="media-category">Category</Label>
            <Input
              id="media-category"
              value={value.category}
              onChange={(event) =>
                onChange({ ...value, category: event.target.value })
              }
              placeholder="achievement, student, institute"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="media-year">Year</Label>
            <Input
              id="media-year"
              type="number"
              min={0}
              value={value.year ?? ""}
              onChange={(event) =>
                onChange({ ...value, year: Number(event.target.value) || undefined })
              }
              placeholder="2025"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="media-description">Description</Label>
            <Textarea
              id="media-description"
              value={value.description}
              onChange={(event) =>
                onChange({ ...value, description: event.target.value })
              }
              rows={3}
              placeholder="Optional notes"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Image Upload</Label>
          <div className="flex items-center gap-3">
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(files) => {
                const file = files?.[0];
                if (file) {
                  onChange({
                    ...value,
                    imageUrl: file.url,
                    imageKey: file.key,
                  });
                }
              }}
              onUploadError={() => {
                onChange({ ...value, imageUrl: undefined, imageKey: undefined });
              }}
            />
            {hasImage && value.imageUrl ? (
              <span className="text-sm text-muted-foreground break-all">
                {value.imageUrl}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                Upload a JPG/PNG under 4MB.
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onSubmit}
            disabled={submitting || value.section === "" || !value.title || !value.imageUrl}
          >
            {value.id ? "Update media" : "Add media"}
          </Button>
          <Button type="button" variant="outline" onClick={onReset} disabled={submitting}>
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
