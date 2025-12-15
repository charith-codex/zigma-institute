"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  startTransition,
  useState,
  useTransition,
  type ComponentType,
  type ReactNode,
} from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Award,
  Medal,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import ImageDropzone from "@/components/ImageDropzone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useShowcaseGallery } from "@/hooks/useShowcaseGallery";
import {
  createInstituteAchievement,
  createShowcaseStudent,
  deleteInstituteAchievement,
  deleteShowcaseStudent,
  updateInstituteAchievement,
  updateShowcaseStudent,
} from "@/lib/actions/showcase";
import { showcaseActionInitialState } from "@/lib/actions/showcaseState";
import {
  achievementIconSchema,
  instituteAchievementFormSchema,
  type InstituteAchievementFormValues,
  showcaseStudentFormSchema,
  type ShowcaseStudentFormValues,
} from "@/lib/validators";
import type { InstituteAchievement, ShowcaseStudent } from "@/types";

const achievementIcons: Record<
  string,
  ComponentType<{ className?: string }>
> = {
  Trophy,
  Zap,
  Target,
  Award,
  Users,
  TrendingUp,
  Medal,
  Star,
};

const colorStyles: Record<
  string,
  { text: string; background: string; badge: string }
> = {
  yellow: {
    text: "text-yellow-700",
    background: "bg-yellow-50",
    badge: "bg-yellow-100 text-yellow-800",
  },
  blue: {
    text: "text-blue-700",
    background: "bg-blue-50",
    badge: "bg-blue-100 text-blue-800",
  },
  green: {
    text: "text-green-700",
    background: "bg-green-50",
    badge: "bg-green-100 text-green-800",
  },
  purple: {
    text: "text-purple-700",
    background: "bg-purple-50",
    badge: "bg-purple-100 text-purple-800",
  },
  orange: {
    text: "text-orange-700",
    background: "bg-orange-50",
    badge: "bg-orange-100 text-orange-800",
  },
  emerald: {
    text: "text-emerald-700",
    background: "bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-800",
  },
  pink: {
    text: "text-pink-700",
    background: "bg-pink-50",
    badge: "bg-pink-100 text-pink-800",
  },
};

const studentResolver = zodResolver(showcaseStudentFormSchema);

const achievementResolver = zodResolver(instituteAchievementFormSchema);

const defaultStudentValues = (): ShowcaseStudentFormValues => ({
  name: "",
  grade: "",
  subject: "",
  position: "",
  score: "",
  year: new Date().getFullYear(),
  district: "",
  avatarUrl: "",
  category: "ISLAND",
  sortOrder: 0,
});

const defaultAchievementValues = (): InstituteAchievementFormValues => ({
  title: "",
  category: "",
  year: new Date().getFullYear(),
  description: "",
  icon: "Trophy",
  accentColor: "yellow",
  sortOrder: 0,
});

interface FormShellProps {
  title: string;
  children: ReactNode;
  actionLabel: string;
  isPending: boolean;
  onCancel?: () => void;
  submitDisabled?: boolean;
}

function FormShell({
  title,
  children,
  actionLabel,
  isPending,
  onCancel,
  submitDisabled,
}: FormShellProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {children}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending || submitDisabled}>
              {isPending ? "Saving..." : actionLabel}
            </Button>
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StudentFormProps {
  initialData?: ShowcaseStudent | null;
  onSuccess: () => Promise<void> | void;
  onCancelEdit?: () => void;
}

function ShowcaseStudentForm({
  initialData,
  onSuccess,
  onCancelEdit,
}: StudentFormProps) {
  const [state, formAction, pending] = useActionState(
    initialData ? updateShowcaseStudent : createShowcaseStudent,
    showcaseActionInitialState
  );

  const form = useForm<ShowcaseStudentFormValues>({
    resolver: studentResolver,
    defaultValues: initialData
      ? {
          name: initialData.name,
          grade: initialData.grade,
          subject: initialData.subject,
          position: initialData.position,
          score: initialData.score ?? "",
          year: initialData.year,
          district: initialData.district ?? "",
          avatarUrl: initialData.avatarUrl ?? "",
          category: initialData.category,
          sortOrder: initialData.sortOrder,
        }
      : defaultStudentValues(),
  });

  useEffect(() => {
    if (state.success) {
      toast({ title: state.message });
      form.reset(defaultStudentValues());
      onSuccess();
    } else if (state.message) {
      toast({
        title: "Unable to save student",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [form, onSuccess, state.message, state.success]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        grade: initialData.grade,
        subject: initialData.subject,
        position: initialData.position,
        score: initialData.score ?? "",
        year: initialData.year,
        district: initialData.district ?? "",
        avatarUrl: initialData.avatarUrl ?? "",
        category: initialData.category,
        sortOrder: initialData.sortOrder,
      });
    } else {
      form.reset(defaultStudentValues());
    }
  }, [form, initialData]);

  const onSubmit = form.handleSubmit((values) => {
    const formData = new FormData();
    if (initialData) {
      formData.append("id", initialData.id);
    }

    formData.append("name", values.name.trim());
    formData.append("grade", values.grade.trim());
    formData.append("subject", values.subject.trim());
    formData.append("position", values.position.trim());
    formData.append("score", values.score?.trim() ?? "");
    formData.append("year", values.year.toString());
    formData.append("district", values.district?.trim() ?? "");
    formData.append("avatarUrl", values.avatarUrl?.trim() ?? "");
    formData.append("category", values.category);
    formData.append("sortOrder", values.sortOrder.toString());

    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <FormShell
        title={initialData ? "Edit Student" : "Add Showcase Student"}
        actionLabel={initialData ? "Update" : "Save"}
        isPending={pending}
        onCancel={
          initialData
            ? () => {
                form.reset(defaultStudentValues());
                onCancelEdit?.();
              }
            : undefined
        }
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="student-name">Name</FieldLabel>
            <Input
              id="student-name"
              {...form.register("name")}
              disabled={pending}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="student-grade">Grade</FieldLabel>
            <Input
              id="student-grade"
              {...form.register("grade")}
              disabled={pending}
            />
            <FieldError errors={[form.formState.errors.grade]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="student-subject">Subject</FieldLabel>
            <Input
              id="student-subject"
              {...form.register("subject")}
              disabled={pending}
            />
            <FieldError errors={[form.formState.errors.subject]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="student-position">Position</FieldLabel>
            <Input
              id="student-position"
              {...form.register("position")}
              disabled={pending}
            />
            <FieldError errors={[form.formState.errors.position]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="student-score">Score</FieldLabel>
            <Input
              id="student-score"
              {...form.register("score")}
              disabled={pending}
            />
            <FieldError errors={[form.formState.errors.score]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="student-year">Year</FieldLabel>
            <Input
              id="student-year"
              type="number"
              min={2000}
              max={3000}
              {...form.register("year", { valueAsNumber: true })}
              disabled={pending}
            />
            <FieldError errors={[form.formState.errors.year]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="student-category">Category</FieldLabel>
            <Select
              value={form.watch("category")}
              onValueChange={(value) =>
                form.setValue("category", value as ShowcaseStudent["category"])
              }
              disabled={pending}
            >
              <SelectTrigger id="student-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ISLAND">Island Top Ranking</SelectItem>
                <SelectItem value="DISTRICT">District Top Ranking</SelectItem>
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.category]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="student-district">
              District (for district rankings)
            </FieldLabel>
            <Input
              id="student-district"
              {...form.register("district")}
              disabled={pending}
            />
            <FieldError errors={[form.formState.errors.district]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="student-sort-order">Display Order</FieldLabel>
            <Input
              id="student-sort-order"
              type="number"
              min={0}
              {...form.register("sortOrder", { valueAsNumber: true })}
              disabled={pending}
            />
            <FieldError errors={[form.formState.errors.sortOrder]} />
          </Field>
          <Field>
            <FieldLabel>Student Image</FieldLabel>
            <FieldContent>
              <ImageDropzone
                disabled={pending}
                onUploadComplete={(url) =>
                  form.setValue("avatarUrl", url, { shouldValidate: true })
                }
              />
              {form.watch("avatarUrl") ? (
                <div className="relative mt-2 h-20 w-20 overflow-hidden rounded-lg">
                  <Image
                    src={form.watch("avatarUrl") ?? ""}
                    alt="Uploaded student avatar"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              ) : null}
            </FieldContent>
            <FieldError errors={[form.formState.errors.avatarUrl]} />
          </Field>
        </FieldGroup>
      </FormShell>
    </form>
  );
}

interface AchievementFormProps {
  initialData?: InstituteAchievement | null;
  onSuccess: () => Promise<void> | void;
  onCancelEdit?: () => void;
}

function AchievementForm({
  initialData,
  onSuccess,
  onCancelEdit,
}: AchievementFormProps) {
  const [state, formAction, pending] = useActionState(
    initialData ? updateInstituteAchievement : createInstituteAchievement,
    showcaseActionInitialState
  );

  const form = useForm<InstituteAchievementFormValues>({
    resolver: achievementResolver,
    defaultValues: initialData
      ? {
          title: initialData.title,
          category: initialData.category,
          year: initialData.year,
          description: initialData.description,
          icon:
            (initialData.icon as InstituteAchievementFormValues["icon"]) ??
            "Trophy",
          accentColor: initialData.accentColor,
          sortOrder: initialData.sortOrder,
        }
      : defaultAchievementValues(),
  });

  const iconOptions = useMemo(() => achievementIconSchema.options, []);

  useEffect(() => {
    if (state.success) {
      toast({ title: state.message });
      form.reset(defaultAchievementValues());
      onSuccess();
    } else if (state.message) {
      toast({
        title: "Unable to save achievement",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [form, onSuccess, state.message, state.success]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        category: initialData.category,
        year: initialData.year,
        description: initialData.description,
        icon:
          (initialData.icon as InstituteAchievementFormValues["icon"]) ??
          "Trophy",
        accentColor: initialData.accentColor,
        sortOrder: initialData.sortOrder,
      });
    } else {
      form.reset(defaultAchievementValues());
    }
  }, [form, initialData]);

  const onSubmit = form.handleSubmit((values) => {
    const formData = new FormData();
    if (initialData) {
      formData.append("id", initialData.id);
    }

    formData.append("title", values.title.trim());
    formData.append("category", values.category.trim());
    formData.append("year", values.year.toString());
    formData.append("description", values.description.trim());
    formData.append("icon", values.icon);
    formData.append("accentColor", values.accentColor);
    formData.append("sortOrder", values.sortOrder.toString());

    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <FormShell
        title={initialData ? "Edit Achievement" : "Add Achievement"}
        actionLabel={initialData ? "Update" : "Save"}
        isPending={pending}
        onCancel={
          initialData
            ? () => {
                form.reset(defaultAchievementValues());
                onCancelEdit?.();
              }
            : undefined
        }
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="achievement-title">Title</FieldLabel>
            <Input
              id="achievement-title"
              {...form.register("title")}
              disabled={pending}
            />
            <FieldError errors={[form.formState.errors.title]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="achievement-category">Category</FieldLabel>
            <Input
              id="achievement-category"
              {...form.register("category")}
              disabled={pending}
            />
            <FieldError errors={[form.formState.errors.category]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="achievement-year">Year</FieldLabel>
            <Input
              id="achievement-year"
              type="number"
              min={2000}
              max={3000}
              {...form.register("year", { valueAsNumber: true })}
              disabled={pending}
            />
            <FieldError errors={[form.formState.errors.year]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="achievement-icon">Icon</FieldLabel>
            <Select
              value={form.watch("icon")}
              onValueChange={(value) =>
                form.setValue(
                  "icon",
                  value as InstituteAchievementFormValues["icon"]
                )
              }
              disabled={pending}
            >
              <SelectTrigger id="achievement-icon">
                <SelectValue placeholder="Select icon" />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((icon) => (
                  <SelectItem key={icon} value={icon}>
                    {icon}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.icon]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="achievement-accent">Accent Color</FieldLabel>
            <Select
              value={form.watch("accentColor")}
              onValueChange={(value) => form.setValue("accentColor", value)}
              disabled={pending}
            >
              <SelectTrigger id="achievement-accent">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(colorStyles).map((colorKey) => (
                  <SelectItem key={colorKey} value={colorKey}>
                    {colorKey}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.accentColor]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="achievement-sort-order">
              Display Order
            </FieldLabel>
            <Input
              id="achievement-sort-order"
              type="number"
              min={0}
              {...form.register("sortOrder", { valueAsNumber: true })}
              disabled={pending}
            />
            <FieldError errors={[form.formState.errors.sortOrder]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="achievement-description">
              Description
            </FieldLabel>
            <Textarea
              id="achievement-description"
              rows={3}
              {...form.register("description")}
              disabled={pending}
            />
            <FieldError errors={[form.formState.errors.description]} />
          </Field>
        </FieldGroup>
      </FormShell>
    </form>
  );
}

interface StudentListProps {
  title: string;
  students: ShowcaseStudent[];
  onEdit: (student: ShowcaseStudent) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function StudentList({
  title,
  students,
  onEdit,
  onDelete,
  isDeleting,
}: StudentListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground">No students yet.</p>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-muted">
                  {student.avatarUrl ? (
                    <Image
                      src={student.avatarUrl}
                      alt={student.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold">
                      {student.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{student.name}</span>
                    <Badge variant="secondary">{student.position}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {student.grade} • {student.subject}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {student.district
                      ? `${student.district} District`
                      : "Island Wide"}{" "}
                    · {student.year}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(student)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(student.id)}
                  disabled={isDeleting}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

interface AchievementListProps {
  achievements: InstituteAchievement[];
  onEdit: (achievement: InstituteAchievement) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function AchievementList({
  achievements,
  onEdit,
  onDelete,
  isDeleting,
}: AchievementListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Institute Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {achievements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No achievements yet.</p>
        ) : (
          achievements.map((achievement) => {
            const IconComponent = achievementIcons[achievement.icon] ?? Award;
            const colors =
              colorStyles[achievement.accentColor] ?? colorStyles.yellow;
            return (
              <div
                key={achievement.id}
                className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${colors.background}`}
                  >
                    <IconComponent className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{achievement.title}</span>
                      <Badge className={colors.badge}>
                        {achievement.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.year}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(achievement)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(achievement.id)}
                    disabled={isDeleting}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export function ShowcaseGalleryManager() {
  const { students, achievements, loading, refetch } = useShowcaseGallery();
  const [editingStudent, setEditingStudent] = useState<ShowcaseStudent | null>(
    null
  );
  const [editingAchievement, setEditingAchievement] =
    useState<InstituteAchievement | null>(null);
  const [isDeletingStudent, startDeleteStudent] = useTransition();
  const [isDeletingAchievement, startDeleteAchievement] = useTransition();

  const islandStudents = useMemo(
    () => students.filter((student) => student.category === "ISLAND"),
    [students]
  );
  const districtStudents = useMemo(
    () => students.filter((student) => student.category === "DISTRICT"),
    [students]
  );

  const handleDeleteStudent = (id: string) => {
    startDeleteStudent(async () => {
      const formData = new FormData();
      formData.append("id", id);
      const result = await deleteShowcaseStudent(
        showcaseActionInitialState,
        formData
      );
      if (result.success) {
        toast({ title: result.message });
        if (editingStudent?.id === id) {
          setEditingStudent(null);
        }
        await refetch();
      } else if (result.message) {
        toast({
          title: "Unable to delete student",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleDeleteAchievement = (id: string) => {
    startDeleteAchievement(async () => {
      const formData = new FormData();
      formData.append("id", id);
      const result = await deleteInstituteAchievement(
        showcaseActionInitialState,
        formData
      );
      if (result.success) {
        toast({ title: result.message });
        if (editingAchievement?.id === id) {
          setEditingAchievement(null);
        }
        await refetch();
      } else if (result.message) {
        toast({
          title: "Unable to delete achievement",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  const resetEditing = async () => {
    setEditingStudent(null);
    setEditingAchievement(null);
    await refetch();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <ShowcaseStudentForm
          initialData={editingStudent}
          onSuccess={resetEditing}
          onCancelEdit={() => setEditingStudent(null)}
        />
        <AchievementForm
          initialData={editingAchievement}
          onSuccess={resetEditing}
          onCancelEdit={() => setEditingAchievement(null)}
        />
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-2">
        <StudentList
          title="Island Top Ranking"
          students={islandStudents}
          onEdit={(student) => setEditingStudent(student)}
          onDelete={handleDeleteStudent}
          isDeleting={isDeletingStudent}
        />
        <StudentList
          title="District Top Ranking"
          students={districtStudents}
          onEdit={(student) => setEditingStudent(student)}
          onDelete={handleDeleteStudent}
          isDeleting={isDeletingStudent}
        />
      </div>

      <AchievementList
        achievements={achievements}
        onEdit={(achievement) => setEditingAchievement(achievement)}
        onDelete={handleDeleteAchievement}
        isDeleting={isDeletingAchievement}
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">
          Loading showcase data...
        </p>
      ) : null}
    </div>
  );
}
