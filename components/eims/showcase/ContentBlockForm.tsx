import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ShowcasePage } from "@/lib/generated/prisma";

export type ContentFormState = {
  id?: string;
  page: ShowcasePage;
  section: string;
  title: string;
  subtitle: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  order: number;
};

type ContentBlockFormProps = {
  value: ContentFormState;
  onChange: (value: ContentFormState) => void;
  onSubmit: () => void;
  onReset: () => void;
  submitting: boolean;
  title: string;
};

export function ContentBlockForm({
  value,
  onChange,
  onSubmit,
  onReset,
  submitting,
  title,
}: ContentBlockFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="section">Section</Label>
            <Input
              id="section"
              value={value.section}
              onChange={(event) =>
                onChange({ ...value, section: event.target.value })
              }
              placeholder="hero, stat, highlight"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
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
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={value.title}
              onChange={(event) =>
                onChange({ ...value, title: event.target.value })
              }
              placeholder="Heading text"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={value.subtitle}
              onChange={(event) =>
                onChange({ ...value, subtitle: event.target.value })
              }
              placeholder="Optional subtitle"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Body</Label>
          <Textarea
            id="body"
            value={value.body}
            onChange={(event) => onChange({ ...value, body: event.target.value })}
            rows={3}
            placeholder="Description or supporting copy"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ctaLabel">CTA Label</Label>
            <Input
              id="ctaLabel"
              value={value.ctaLabel}
              onChange={(event) =>
                onChange({ ...value, ctaLabel: event.target.value })
              }
              placeholder="Optional button label"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ctaHref">CTA Link</Label>
            <Input
              id="ctaHref"
              value={value.ctaHref}
              onChange={(event) =>
                onChange({ ...value, ctaHref: event.target.value })
              }
              placeholder="/student-registration"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={onSubmit} disabled={submitting || value.section === ""}>
            {value.id ? "Update block" : "Add block"}
          </Button>
          <Button type="button" variant="outline" onClick={onReset} disabled={submitting}>
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
