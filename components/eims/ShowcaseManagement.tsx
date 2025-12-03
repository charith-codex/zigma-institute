"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import type {
  ShowcaseContent,
  ShowcaseMedia,
  ShowcasePage,
} from "@/lib/generated/prisma";
import {
  deleteShowcaseContent,
  deleteShowcaseMedia,
  getShowcaseData,
  saveShowcaseContent,
  saveShowcaseMedia,
} from "@/lib/actions/showcase";
import { ContentBlockForm, type ContentFormState } from "./showcase/ContentBlockForm";
import { MediaItemForm, type MediaFormState } from "./showcase/MediaItemForm";
import { ContentBlockList } from "./showcase/ContentBlockList";
import { MediaItemList } from "./showcase/MediaItemList";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Globe, Image as ImageIcon, Pencil } from "lucide-react";

const pageOptions: Array<{ id: ShowcasePage; label: string; hint: string }> = [
  { id: "HOME", label: "Home", hint: "Hero, stats, timelines" },
  { id: "COURSES", label: "Courses", hint: "Highlights, steps" },
  { id: "GALLERY", label: "Gallery", hint: "Achievements & media" },
  { id: "CONTACT", label: "Contact", hint: "Contact info & hero" },
  { id: "ABOUT", label: "About", hint: "Mission, values, team" },
];

const createDefaultContentForm = (page: ShowcasePage): ContentFormState => ({
  page,
  section: "",
  title: "",
  subtitle: "",
  body: "",
  ctaLabel: "",
  ctaHref: "",
  order: 0,
});

const createDefaultMediaForm = (page: ShowcasePage): MediaFormState => ({
  page,
  section: "",
  title: "",
  description: "",
  category: "",
  year: undefined,
  imageUrl: undefined,
  imageKey: undefined,
  order: 0,
});

const sortByOrder = <T extends { order: number; createdAt: Date | string }>(items: T[]) =>
  [...items].sort(
    (a, b) =>
      a.order - b.order || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

export function ShowcaseManagement() {
  const [activePage, setActivePage] = useState<ShowcasePage>("HOME");
  const [contentForm, setContentForm] = useState<ContentFormState>(
    createDefaultContentForm("HOME")
  );
  const [mediaForm, setMediaForm] = useState<MediaFormState>(
    createDefaultMediaForm("HOME")
  );
  const [contents, setContents] = useState<ShowcaseContent[]>([]);
  const [media, setMedia] = useState<ShowcaseMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await getShowcaseData();
      setContents(data.contents);
      setMedia(data.media);
      setLoading(false);
    };

    void loadData();
  }, []);

  const activeContents = useMemo(
    () => sortByOrder(contents.filter((item) => item.page === activePage)),
    [contents, activePage]
  );

  const activeMedia = useMemo(
    () => sortByOrder(media.filter((item) => item.page === activePage)),
    [media, activePage]
  );

  const resetForms = (page: ShowcasePage) => {
    setContentForm(createDefaultContentForm(page));
    setMediaForm(createDefaultMediaForm(page));
  };

  const handleContentSubmit = () => {
    startTransition(async () => {
      const result = await saveShowcaseContent(contentForm);
      if (!result.success) {
        toast({ title: result.error, variant: "destructive" });
        return;
      }

      setContents((prev) => {
        const filtered = prev.filter((item) => item.id !== result.data.id);
        return sortByOrder([...filtered, result.data]);
      });
      toast({
        title: contentForm.id ? "Content updated" : "Content added",
        description: "Showcase page copy saved.",
      });
      setContentForm(createDefaultContentForm(activePage));
    });
  };

  const handleMediaSubmit = () => {
    startTransition(async () => {
      const result = await saveShowcaseMedia(mediaForm);
      if (!result.success) {
        toast({ title: result.error, variant: "destructive" });
        return;
      }

      setMedia((prev) => {
        const filtered = prev.filter((item) => item.id !== result.data.id);
        return sortByOrder([...filtered, result.data]);
      });
      toast({
        title: mediaForm.id ? "Media updated" : "Media added",
        description: "Images ready for the public pages.",
      });
      setMediaForm(createDefaultMediaForm(activePage));
    });
  };

  const handleDeleteContent = (id: string) => {
    startTransition(async () => {
      const result = await deleteShowcaseContent(id);
      if (!result.success) {
        toast({ title: result.error, variant: "destructive" });
        return;
      }
      setContents((prev) => prev.filter((item) => item.id !== id));
      toast({ title: "Content removed" });
    });
  };

  const handleDeleteMedia = (id: string) => {
    startTransition(async () => {
      const result = await deleteShowcaseMedia(id);
      if (!result.success) {
        toast({ title: result.error, variant: "destructive" });
        return;
      }
      setMedia((prev) => prev.filter((item) => item.id !== id));
      toast({ title: "Media removed" });
    });
  };

  const handlePageChange = (page: string) => {
    const nextPage = page as ShowcasePage;
    setActivePage(nextPage);
    resetForms(nextPage);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary">
          <Globe className="h-5 w-5" />
          <span className="text-sm font-medium">Website Management</span>
        </div>
        <h1 className="text-2xl font-bold leading-tight">Showcase site content</h1>
        <p className="text-muted-foreground">
          Manage hero copy, highlights, gallery media, and contact details for the public site. Use sections like
          <span className="mx-1 font-semibold">hero</span>, <span className="mx-1 font-semibold">stat</span>,
          <span className="mx-1 font-semibold">timeline</span>, or <span className="mx-1 font-semibold">gallery</span>
          to mirror the live pages.
        </p>
      </div>

      <Tabs value={activePage} onValueChange={handlePageChange} className="space-y-4">
        <TabsList className="flex w-full flex-wrap">
          {pageOptions.map((page) => (
            <TabsTrigger key={page.id} value={page.id} className="flex-1 min-w-[120px]">
              <div className="flex items-center justify-between gap-2">
                <span>{page.label}</span>
                <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                  {page.hint}
                </Badge>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {pageOptions.map((page) => (
          <TabsContent key={page.id} value={page.id} className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <Pencil className="h-4 w-4" />
              <span>Editing {page.label} page</span>
              <Separator orientation="vertical" className="h-4" />
              <span>{page.hint}</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Common sections: hero, stat, highlight, timeline, gallery.</span>
            </div>

            {loading ? (
              <div className="flex items-center gap-3 rounded-lg border p-4 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading saved content...</span>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                <ContentBlockForm
                  title="Content blocks"
                  value={contentForm}
                  onChange={(value) => setContentForm({ ...value, page: page.id })}
                  onSubmit={handleContentSubmit}
                  onReset={() => setContentForm(createDefaultContentForm(page.id))}
                  submitting={isPending}
                />

                <MediaItemForm
                  value={mediaForm}
                  onChange={(value) => setMediaForm({ ...value, page: page.id })}
                  onSubmit={handleMediaSubmit}
                  onReset={() => setMediaForm(createDefaultMediaForm(page.id))}
                  submitting={isPending}
                />

                <div className="space-y-4">
                  <ContentBlockList
                    items={activeContents}
                    onEdit={(item) => setContentForm({
                      id: item.id,
                      page: item.page,
                      section: item.section,
                      title: item.title ?? "",
                      subtitle: item.subtitle ?? "",
                      body: item.body ?? "",
                      ctaLabel: item.ctaLabel ?? "",
                      ctaHref: item.ctaHref ?? "",
                      order: item.order,
                    })}
                    onDelete={handleDeleteContent}
                  />

                  <MediaItemList
                    items={activeMedia}
                    onEdit={(item) => setMediaForm({
                      id: item.id,
                      page: item.page,
                      section: item.section,
                      title: item.title,
                      description: item.description ?? "",
                      category: item.category ?? "",
                      year: item.year ?? undefined,
                      imageUrl: item.imageUrl,
                      imageKey: item.imageKey ?? undefined,
                      order: item.order,
                    })}
                    onDelete={handleDeleteMedia}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              <span>
                Upload new showcase images, replace hero banners, or rotate Island Top Ranking Students by saving a new media item
                with the <strong>gallery</strong> section and a year.
              </span>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
