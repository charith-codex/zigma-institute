import { z } from "zod";

export const statusOptions = [
  { label: "Active", value: "ACTIVE" as const },
  { label: "Inactive", value: "INACTIVE" as const },
];

export const genderOptions = [
  { label: "Male", value: "MALE" as const },
  { label: "Female", value: "FEMALE" as const },
];

export type FieldErrorState<T> = Partial<Record<keyof T, string>>;

export const formatDateForInput = (value?: string | null) =>
  value ? value.slice(0, 10) : "";

export const collectFieldErrors = <T>(issues: z.ZodIssue[]): FieldErrorState<T> => {
  const fieldErrors: Record<string, string> = {};

  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }

  return fieldErrors as FieldErrorState<T>;
};

export const clearFieldError = <T>(
  field: keyof T,
  setter: (updater: (prev: FieldErrorState<T>) => FieldErrorState<T>) => void
) => {
  setter((previous) => {
    if (!previous[field]) return previous;
    const next = { ...previous };
    delete next[field];
    return next;
  });
};
