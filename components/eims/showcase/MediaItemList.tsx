import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ShowcaseMedia } from "@/lib/generated/prisma";

interface MediaItemListProps {
  items: ShowcaseMedia[];
  onEdit: (item: ShowcaseMedia) => void;
  onDelete: (id: string) => void;
}

export function MediaItemList({ items, onEdit, onDelete }: MediaItemListProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved media</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No media uploaded for this page yet. Add gallery items or hero images to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved media</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 rounded-lg border p-3">
            {item.imageUrl ? (
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="flex flex-1 flex-col justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{item.section}</Badge>
                  {item.category ? <Badge variant="outline">{item.category}</Badge> : null}
                  {item.year ? (
                    <Badge variant="outline" className="capitalize">
                      {item.year}
                    </Badge>
                  ) : null}
                </div>
                <p className="font-medium text-foreground">{item.title}</p>
                {item.description ? (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
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
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
