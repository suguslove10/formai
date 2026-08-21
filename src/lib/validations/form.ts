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

export const ConditionalRule = z.object({
  fieldId: z.string(),
  operator: z.enum(["equals", "not_equals", "contains", "greater_than", "less_than", "is_not_empty"]),
  value: z.any().optional(),
});

export type ConditionalRuleType = z.infer<typeof ConditionalRule>;

export const FormField = z.object({
  id: z.string(),
  type: FieldType,
  label: z.string().min(1, "Field label is required"),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(), // for select/radio/checkbox
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  page: z.number().default(1).optional(), // for multi-step wizard forms (Page 1, Page 2...)
  conditionalRule: ConditionalRule.optional(), // conditional show/hide logic
});

export type FormFieldType = z.infer<typeof FormField>;

export const FormSchema = z.object({
  title: z.string().min(1, "Form title is required"),
  description: z.string().optional(),
  fields: z.array(FormField).min(1, "At least one field is required").max(30, "Maximum 30 fields allowed"),
});

export type FormSchemaType = z.infer<typeof FormSchema>;

// Schema for updating form settings and fields
export const UpdateFormSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  fields: z.array(FormField).min(1).max(30).optional(),
  status: z.enum(["draft", "published"]).optional(),
  botName: z.string().optional(),
  botGreeting: z.string().optional(),
  botPersona: z.string().optional(),
  botAvatar: z.string().max(16).optional(),
  botAvatarUrl: z
    .string()
    .max(2048)
    .refine((v) => v === "" || /^https?:\/\//i.test(v), "Avatar image must be an http(s) URL")
    .optional(),
  knowledgeBase: z.string().optional(),
  
  // Enterprise settings
  customDomain: z.string().optional(),
  removeBranding: z.boolean().optional(),
  isMultiStep: z.boolean().optional(),
  themeColor: z.string().optional(),
  webhookUrl: z.string().optional(),
});

// Schema for submitting form responses (includes standard fields + optional UTM parameters)
export const SubmitResponseSchema = z.record(z.any());
