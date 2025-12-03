import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchShowcasePage } from "@/lib/showcase-data";
import type { ShowcaseContent, ShowcaseMedia } from "@/lib/generated/prisma";

const sortContent = (items: ShowcaseContent[]) =>
  [...items].sort(
    (a, b) =>
      a.order - b.order ||
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

const sortMedia = (items: ShowcaseMedia[]) =>
  [...items].sort(
    (a, b) =>
      a.order - b.order ||
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

export default async function Gallery() {
  const { contents, media } = await fetchShowcasePage("GALLERY");

  const heroBlock = contents.find((item) => item.section === "hero");
  const highlights = sortContent(contents.filter((item) => item.section === "highlight"));
  const galleryItems = sortMedia(media);

  const categories = Array.from(
    new Set(galleryItems.map((item) => item.category || "achievement"))
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <Badge className="mb-4">{heroBlock?.subtitle ?? "Gallery & Achievements"}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {heroBlock?.title ?? "Showcasing our community"}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {heroBlock?.body ??
                "Explore student victories, institute milestones, and the memories we create together."}
            </p>
          </div>
        </div>
      </div>

      <section className="py-12">
        <div className="container mx-auto px-4 space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <Card key={item.id} className="h-full">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  {item.subtitle ? (
                    <Badge variant="outline" className="w-fit">
                      {item.subtitle}
                    </Badge>
                  ) : null}
                </CardHeader>
                <CardContent>
                  <CardDescription>{item.body}</CardDescription>
                </CardContent>
              </Card>
            ))}
            {highlights.length === 0 ? (
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Ready for your stories</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Add highlight content blocks in Website Management to celebrate special awards, rankings, or institute news.
                  </CardDescription>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30 border-t">
        <div className="container mx-auto px-4 space-y-10">
          {categories.map((category) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold capitalize">
                    {category} highlights
                  </h2>
                  <p className="text-muted-foreground">
                    Update these cards from Website Management to reflect new intakes and annual achievements.
                  </p>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {galleryItems
                  .filter((item) => (item.category || "achievement") === category)
                  .map((item) => (
                    <Card key={item.id} className="h-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{item.title}</CardTitle>
                          <Badge variant="secondary" className="capitalize">
                            {item.year ?? ""}
                          </Badge>
                        </div>
                        {item.category ? (
                          <Badge variant="outline" className="w-fit capitalize">
                            {item.category}
                          </Badge>
                        ) : null}
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <CardDescription>{item.description}</CardDescription>
                        <p className="text-xs text-muted-foreground break-all">
                          {item.imageUrl}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
          {galleryItems.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No gallery items yet</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Upload images with categories like achievement or student to display them here. Add the year to keep Island Top Ranking Students current.
                </CardDescription>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
