import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ShowcaseContent } from "@/lib/generated/prisma";

interface ContentBlockListProps {
  items: ShowcaseContent[];
  onEdit: (item: ShowcaseContent) => void;
  onDelete: (id: string) => void;
}

export function ContentBlockList({ items, onEdit, onDelete }: ContentBlockListProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved content</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No content blocks yet. Add hero, stat, or highlight text for this page.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{item.section}</Badge>
                <span className="text-xs text-muted-foreground">Order {item.order}</span>
              </div>
              <p className="font-medium text-foreground">{item.title ?? "Untitled"}</p>
              {item.body ? (
                <p className="text-sm text-muted-foreground line-clamp-2">{item.body}</p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
