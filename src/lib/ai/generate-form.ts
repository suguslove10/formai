import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { FormSchema, type FormSchemaType } from "@/lib/validations/form";

const SYSTEM_PROMPT = `You are FormAI, an expert AI form designer. Your goal is to convert user requests into clean, intuitive, and professional form structures.

### Field-Type Judgment Rules:
1. **email**: Use for any email address field.
2. **radio**: Use for mutually exclusive binary choices (e.g., Yes/No, Agree/Disagree) or 2-3 short exclusive options.
3. **select**: Use for single-choice dropdowns with 2-6 predefined choices (e.g., Department, Role, Country).
4. **checkbox**: Use for multi-select options or standalone consent agreements.
5. **textarea**: Use for open-ended feedback, suggestions, long comments, or descriptions (> 1 sentence).
6. **text**: Use for short single-line strings like Full Name, Company, City, Job Title.
7. **number**: Use for quantities, ages, years of experience, budget amounts.
8. **rating**: Use for 1-5 satisfaction, NPS scores, or review ratings.
9. **file**: Use for resumes, CVs, screenshots, ID uploads, receipts, or attachments.
10. **date**: Use for dates of birth, event dates, appointment requests, deadlines.

### Field Count & Structure:
- Provide between 4 to 10 fields unless the user's prompt explicitly requests fewer or more.
- Generate unique, meaningful, snake_case string IDs for each field (e.g. "applicant_name", "rating_experience").
- Always provide 'options' array when type is 'select', 'radio', or 'checkbox'.

### Few-Shot Examples:

Example 1:
User: "Customer satisfaction survey for a coffee shop"
Output:
{
  "title": "Coffee Shop Customer Feedback",
  "description": "Help us brew a better experience! Please share your thoughts on your recent visit.",
  "fields": [
    { "id": "visit_date", "type": "date", "label": "Date of your visit", "required": true },
    { "id": "order_type", "type": "radio", "label": "Did you dine in or take away?", "required": true, "options": ["Dine-in", "Takeaway", "Delivery"] },
    { "id": "coffee_quality", "type": "rating", "label": "How would you rate the taste and quality of your coffee?", "required": true },
    { "id": "service_speed", "type": "select", "label": "Speed of service", "required": true, "options": ["Very fast", "Reasonable", "A bit slow", "Too slow"] },
    { "id": "favorite_item", "type": "text", "label": "What was your favorite item ordered?", "required": false, "placeholder": "e.g. Oat Milk Flat White" },
    { "id": "comments", "type": "textarea", "label": "Any additional suggestions or feedback?", "required": false, "placeholder": "Tell us anything we can do better..." }
  ]
}

Example 2:
User: "Software engineer job application form"
Output:
{
  "title": "Senior Software Engineer Application",
  "description": "Join our engineering team. Please provide your details and experience below.",
  "fields": [
    { "id": "full_name", "type": "text", "label": "Full Name", "required": true, "placeholder": "Jane Doe" },
    { "id": "email", "type": "email", "label": "Email Address", "required": true, "placeholder": "jane@example.com" },
    { "id": "years_experience", "type": "number", "label": "Years of professional software experience", "required": true },
    { "id": "primary_stack", "type": "select", "label": "Primary Tech Stack", "required": true, "options": ["TypeScript / Next.js", "Python / Django", "Go / Microservices", "Rust / Systems", "Java / Spring"] },
    { "id": "github_portfolio", "type": "text", "label": "GitHub or Portfolio URL", "required": false, "placeholder": "https://github.com/..." },
    { "id": "resume_file", "type": "file", "label": "Upload Resume / CV (PDF preferred)", "required": true },
    { "id": "cover_note", "type": "textarea", "label": "Why do you want to join our team?", "required": false }
  ]
}
`;

const FORM_JSON_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Engaging and clear title of the form",
    },
    description: {
      type: "string",
      description: "Concise description or instructions for respondents",
    },
    fields: {
      type: "array",
      description: "List of 4 to 10 form fields tailored to the user's request",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique snake_case identifier for the field",
          },
          type: {
            type: "string",
            enum: [
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
            ],
            description: "The specific input component type",
          },
          label: {
            type: "string",
            description: "Human-readable label for the question or field",
          },
          required: {
            type: "boolean",
            description: "Whether filling this field is mandatory",
          },
          options: {
            type: "array",
            items: { type: "string" },
            description: "Required list of choices when type is select, radio, or checkbox",
          },
          placeholder: {
            type: "string",
            description: "Helpful placeholder text for the input",
          },
          helpText: {
            type: "string",
            description: "Subtle guidance or context below the field",
          },
        },
        required: ["id", "type", "label", "required"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "fields"],
  additionalProperties: false,
};

export async function generateFormFromPrompt(userPrompt: string): Promise<FormSchemaType> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // 1. Prioritize OpenAI if OPENAI_API_KEY is configured
  if (openaiKey && openaiKey.startsWith("sk-")) {
    const openai = new OpenAI({ apiKey: openaiKey });
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    try {
      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_form_schema",
              description: "Create a structured form schema with title, description, and an array of typed fields.",
              parameters: FORM_JSON_SCHEMA,
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_form_schema" } },
        temperature: 0.7,
      });

      const toolCall = response.choices[0]?.message?.tool_calls?.[0];
      if (toolCall && toolCall.type === "function" && toolCall.function?.arguments) {
        const rawJson = JSON.parse(toolCall.function.arguments);
        const parsed = FormSchema.safeParse(rawJson);
        if (parsed.success) {
          return parsed.data;
        }
      }
    } catch (openaiErr: any) {
      console.warn("OpenAI generation error:", openaiErr.message);
    }
  }

  // 2. Use Anthropic if ANTHROPIC_API_KEY is provided
  if (anthropicKey && anthropicKey.startsWith("sk-ant-")) {
    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const model = process.env.ANTHROPIC_MODEL || "claude-3-7-sonnet-20250219";

    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
        tools: [
          {
            name: "create_form_schema",
            description: "Create a structured form schema with title, description, and an array of typed fields.",
            input_schema: FORM_JSON_SCHEMA as any,
          },
        ],
        tool_choice: { type: "tool", name: "create_form_schema" },
      });

      const toolUse = response.content.find((b) => b.type === "tool_use");
      if (toolUse && toolUse.type === "tool_use") {
        const parsed = FormSchema.safeParse(toolUse.input);
        if (parsed.success) {
          return parsed.data;
        }
      }
    } catch (anthropicErr: any) {
      console.warn("Anthropic generation error:", anthropicErr.message);
    }
  }

  // 3. Fallback Smart Generator
  const promptLower = userPrompt.toLowerCase();
  const title = userPrompt.length > 50 ? userPrompt.substring(0, 47) + "..." : userPrompt;

  if (promptLower.includes("feedback") || promptLower.includes("survey") || promptLower.includes("satisfaction") || promptLower.includes("coffee")) {
    return {
      title: "Customer Satisfaction Survey",
      description: "We value your feedback. Please take a minute to tell us about your experience.",
      fields: [
        { id: "full_name", type: "text", label: "Your Full Name", required: false, placeholder: "Alex Johnson" },
        { id: "email", type: "email", label: "Email Address", required: true, placeholder: "alex@example.com" },
        { id: "visit_date", type: "date", label: "Date of Visit", required: true },
        { id: "overall_rating", type: "rating", label: "How satisfied were you overall?", required: true },
        { id: "recommend_likely", type: "radio", label: "Would you recommend us to colleagues or friends?", required: true, options: ["Definitely", "Maybe", "No"] },
        { id: "service_area", type: "select", label: "Which department or service did you use?", required: true, options: ["Customer Support", "Sales Consultation", "Product Experience", "Billing"] },
        { id: "detailed_comments", type: "textarea", label: "What can we do to improve?", required: false, placeholder: "Tell us anything we can do better..." },
      ],
    };
  }

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    description: `Form created for: "${userPrompt}"`,
    fields: [
      { id: "responder_name", type: "text", label: "Your Full Name", required: true, placeholder: "e.g. John Smith" },
      { id: "contact_email", type: "email", label: "Contact Email", required: true, placeholder: "name@company.com" },
      { id: "category_choice", type: "select", label: "Category / Topic", required: true, options: ["General Inquiry", "Feature Request", "Urgent Support", "Other"] },
      { id: "experience_score", type: "rating", label: "Rate your experience (1 to 5)", required: true },
      { id: "feedback_text", type: "textarea", label: "Detailed Notes or Response", required: false, placeholder: "Share any details or comments..." },
    ],
  };
}
