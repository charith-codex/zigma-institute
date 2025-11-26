"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ProfileImageUploader } from "../ProfileImageUploader";
import { formatDateForInput, type FieldErrorState } from "./form-utils";

export type UserFieldType = "text" | "email" | "password" | "date" | "select" | "image";

export interface UserFieldOption<Value> {
  label: string;
  value: Value;
}

export interface UserFieldConfig<FormValues extends Record<string, unknown>> {
  key: keyof FormValues;
  label: string;
  type: UserFieldType;
  options?: UserFieldOption<FormValues[keyof FormValues]>[];
  description?: string;
}

interface BaseFormProps<FormValues extends Record<string, unknown>> {
  values: FormValues;
  errors: FieldErrorState<FormValues>;
  fields: UserFieldConfig<FormValues>[];
  onChange: <Key extends keyof FormValues>(key: Key, value: FormValues[Key]) => void;
  onClearError: (key: keyof FormValues) => void;
}

type UserAddFormProps<FormValues extends Record<string, unknown>> = BaseFormProps<FormValues>;

interface UserEditFormProps<FormValues extends Record<string, unknown>> extends BaseFormProps<FormValues> {
  passwordValue?: string;
  passwordLabel?: string;
  passwordDescription?: string;
  passwordError?: string;
  onPasswordChange?: (value: string) => void;
}

export function UserAddForm<FormValues extends Record<string, unknown>>({
  values,
  errors,
  fields,
  onChange,
  onClearError,
}: UserAddFormProps<FormValues>) {
  return (
    <FormFields
      values={values}
      errors={errors}
      fields={fields}
      onChange={onChange}
      onClearError={onClearError}
    />
  );
}

export function UserEditForm<FormValues extends Record<string, unknown>>({
  values,
  errors,
  fields,
  onChange,
  onClearError,
  passwordValue,
  passwordLabel = "Password",
  passwordDescription,
  passwordError,
  onPasswordChange,
}: UserEditFormProps<FormValues>) {
  return (
    <FormFields
      values={values}
      errors={errors}
      fields={fields}
      onChange={onChange}
      onClearError={onClearError}
      passwordValue={passwordValue}
      passwordLabel={passwordLabel}
      passwordDescription={passwordDescription}
      passwordError={passwordError}
      onPasswordChange={onPasswordChange}
    />
  );
}

interface FormFieldsProps<FormValues extends Record<string, unknown>>
  extends BaseFormProps<FormValues> {
  passwordValue?: string;
  passwordLabel?: string;
  passwordDescription?: string;
  passwordError?: string;
  onPasswordChange?: (value: string) => void;
}

function FormFields<FormValues extends Record<string, unknown>>({
  values,
  errors,
  fields,
  onChange,
  onClearError,
  passwordValue,
  passwordLabel,
  passwordDescription,
  passwordError,
  onPasswordChange,
}: FormFieldsProps<FormValues>) {
  const standardFields = fields.filter((field) => field.type !== "image");
  const imageField = fields.find((field) => field.type === "image");

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {standardFields.map((field) => (
          <div key={String(field.key)} className="space-y-2">
            <Label htmlFor={String(field.key)}>{field.label}</Label>
            {renderField({
              field,
              values,
              onChange,
              onClearError,
            })}
            {renderError(errors[field.key])}
            {field.description ? (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            ) : null}
          </div>
        ))}
      </div>

      {passwordValue !== undefined && onPasswordChange ? (
        <div className="space-y-2 pt-2">
          <Label htmlFor="reset-password">{passwordLabel}</Label>
          <Input
            id="reset-password"
            type="password"
            value={passwordValue}
            onChange={(event) => onPasswordChange(event.target.value)}
          />
          {passwordDescription ? (
            <p className="text-xs text-muted-foreground">{passwordDescription}</p>
          ) : null}
          {renderError(passwordError)}
        </div>
      ) : null}

      {imageField ? (
        <div className="space-y-2 pt-2">
          <Label>{imageField.label}</Label>
          <ProfileImageUploader
            value={(values[imageField.key] as string | null | undefined) ?? ""}
            onChange={(url) => {
              onChange(imageField.key, (url ?? "") as FormValues[keyof FormValues]);
              onClearError(imageField.key);
            }}
          />
          {renderError(errors[imageField.key])}
        </div>
      ) : null}
    </>
  );
}

type RenderFieldProps<FormValues extends Record<string, unknown>> = Pick<
  FormFieldsProps<FormValues>,
  "values" | "onChange" | "onClearError"
> & {
  field: UserFieldConfig<FormValues>;
};

function renderField<FormValues extends Record<string, unknown>>({
  field,
  values,
  onChange,
  onClearError,
}: RenderFieldProps<FormValues>) {
  const value = values[field.key];

  switch (field.type) {
    case "select": {
      const options = field.options ?? [];

      return (
        <Select
          value={value !== undefined && value !== null ? String(value) : undefined}
          onValueChange={(selected) => {
            onChange(field.key, selected as FormValues[keyof FormValues]);
            onClearError(field.key);
          }}
        >
          <SelectTrigger id={String(field.key)}>
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={String(option.value)} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    case "date":
      return (
        <Input
          id={String(field.key)}
          type="date"
          value={typeof value === "string" ? formatDateForInput(value) : ""}
          onChange={(event) => {
            onChange(field.key, event.target.value as FormValues[keyof FormValues]);
            onClearError(field.key);
          }}
        />
      );
    case "password":
      return (
        <Input
          id={String(field.key)}
          type="password"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => {
            onChange(field.key, event.target.value as FormValues[keyof FormValues]);
            onClearError(field.key);
          }}
        />
      );
    default:
      return (
        <Input
          id={String(field.key)}
          type={field.type === "email" ? "email" : "text"}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => {
            onChange(field.key, event.target.value as FormValues[keyof FormValues]);
            onClearError(field.key);
          }}
        />
      );
  }
}

function renderError(message?: string) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}
