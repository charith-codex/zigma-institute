"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

type FieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FieldContext = React.createContext<FieldContextValue>(
  {} as FieldContextValue,
)

const Field = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FieldContext.Provider>
  )
}

type FieldItemContextValue = {
  id: string
}

const FieldItemContext = React.createContext<FieldItemContextValue>(
  {} as FieldItemContextValue,
)

const useFieldContext = () => {
  const fieldContext = React.useContext(FieldContext)
  const itemContext = React.useContext(FieldItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFieldContext should be used within <Field>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-field-item`,
    formDescriptionId: `${id}-field-item-description`,
    formMessageId: `${id}-field-item-message`,
    ...fieldState,
  }
}

function FieldItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()

  return (
    <FieldItemContext.Provider value={{ id }}>
      <div
        data-slot="field-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FieldItemContext.Provider>
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFieldContext()

  return (
    <Label
      data-slot="field-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FieldControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFieldContext()

  return (
    <Slot
      data-slot="field-control"
      id={formItemId}
      aria-describedby={
        !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFieldContext()

  return (
    <p
      data-slot="field-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function FieldMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFieldContext()
  const body = error ? String(error?.message ?? "") : props.children

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="field-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  )
}

type FieldsetProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>
  children: React.ReactNode
  className?: string
}

function Fieldset<TFieldValues extends FieldValues>({
  form,
  children,
  className,
}: FieldsetProps<TFieldValues>) {
  return (
    <FormProvider {...form}>
      <div className={className}>{children}</div>
    </FormProvider>
  )
}

export {
  Fieldset,
  Field,
  FieldItem,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldMessage,
  useFieldContext,
}
