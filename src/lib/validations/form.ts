import { z } from "zod";

export const FieldType = z.enum([
  "text",
  "email",
  "number",
  "textarea",
  "select",
  "checkbox",
  "radio",
  "rating",
  "file",
  "date",
]);

export type FieldTypeEnum = z.infer<typeof FieldType>;

export const FormField = z.object({
  id: z.string(),
  type: FieldType,
  label: z.string().min(1, "Field label is required"),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(), // for select/radio/checkbox
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
});

export type FormFieldType = z.infer<typeof FormField>;

export const FormSchema = z.object({
  title: z.string().min(1, "Form title is required"),
  description: z.string().optional(),
  fields: z.array(FormField).min(1, "At least one field is required").max(15, "Maximum 15 fields allowed"),
});

export type FormSchemaType = z.infer<typeof FormSchema>;

// Schema for updating form settings and fields
export const UpdateFormSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  fields: z.array(FormField).min(1).max(15).optional(),
  status: z.enum(["draft", "published"]).optional(),
  botName: z.string().optional(),
  botGreeting: z.string().optional(),
  botPersona: z.string().optional(),
  knowledgeBase: z.string().optional(),
});

// Schema for submitting form responses
export const SubmitResponseSchema = z.record(z.any());
