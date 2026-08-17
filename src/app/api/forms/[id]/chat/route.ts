import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { FormFieldType } from "@/lib/validations/form";

interface RouteParams {
  params: {
    id: string;
  };
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => null);

    if (!body || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: "Invalid chat payload" }, { status: 400 });
    }

    const { messages, collectedData = {} } = body;

    // Fetch form
    const form = await prisma.form.findUnique({
      where: { id },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Allow previewing both draft and published forms in chat
    const fields = (form.fieldsJson as unknown as FormFieldType[]) || [];
    const apiKey = process.env.OPENAI_API_KEY;

    const botName = form.botName || "FormAI Assistant";
    const botPersona = form.botPersona || "friendly";
    const knowledgeBase = form.knowledgeBase ? `\n\n### Custom Knowledge Base & Business FAQs:\n${form.knowledgeBase}` : "";

    // Comprehensive system prompt with Persona, Knowledge Base, and Multi-Entity Extraction
    const systemPrompt = `You are ${botName}, an intelligent conversational AI agent collecting information for "${form.title}".
Form Purpose: ${form.description || "Collect user responses conversational style."}
Tone & Persona: ${botPersona}${knowledgeBase}

### Questions to Collect:
${JSON.stringify(fields, null, 2)}

### Currently Collected Answers so far:
${JSON.stringify(collectedData, null, 2)}

### Superpowers & Instructions:
1. **Multi-Entity Extraction**: If the user provides multiple answers in a single response (e.g. "I'm Sarah, email is sarah@co.com and rating is 5"), extract ALL of them simultaneously into 'extractedFields'!
2. **Knowledge Base Q&A**: If the user asks a question about the business, services, pricing, or instructions, answer clearly using the Knowledge Base above, then seamlessly guide them to the next unanswered question.
3. **One Conversational Step at a Time**: Only ask for the next missing question. Keep your replies concise, warm, and natural.
4. **Completion**: When all mandatory questions have been answered, thank the user warmly.

Always call the tool 'update_form_progress' with your reply, any newly extracted field values, next question ID, and completion status.`;

    const CHAT_TOOL = {
      type: "function" as const,
      function: {
        name: "update_form_progress",
        description: "Update the conversation with the next bot reply, extracted field data, and completion status.",
        parameters: {
          type: "object",
          properties: {
            replyMessage: {
              type: "string",
              description: "The friendly message to display to the user in chat.",
            },
            extractedFields: {
              type: "object",
              description: "Key-value map of any newly extracted field answers from the user's latest response. Can extract multiple fields at once.",
            },
            nextActiveFieldId: {
              type: "string",
              description: "The ID of the next field you are asking for, or null if all done.",
            },
            isComplete: {
              type: "boolean",
              description: "Set to true ONLY when all mandatory required fields have been successfully collected.",
            },
            sentiment: {
              type: "string",
              enum: ["positive", "neutral", "negative"],
              description: "Estimated respondent sentiment from the conversation.",
            },
            leadScore: {
              type: "string",
              enum: ["high", "medium", "low"],
              description: "Estimated lead / interest quality score.",
            },
            aiSummary: {
              type: "string",
              description: "A 1-sentence concise executive summary of the respondent's submission.",
            },
          },
          required: ["replyMessage", "extractedFields", "isComplete"],
          additionalProperties: false,
        },
      },
    };

    if (apiKey && apiKey.startsWith("sk-")) {
      const openai = new OpenAI({ apiKey });
      const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

      const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...messages.map((m: ChatMessage) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      const completion = await openai.chat.completions.create({
        model,
        messages: openAiMessages,
        tools: [CHAT_TOOL],
        tool_choice: { type: "function", function: { name: "update_form_progress" } },
        temperature: 0.5,
      });

      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
      if (toolCall && toolCall.type === "function" && toolCall.function?.arguments) {
        const result = JSON.parse(toolCall.function.arguments);
        const updatedData = { ...collectedData, ...result.extractedFields };

        let responseId: string | null = null;
        // If complete, persist response with AI Sentiment, Lead Score & Summary in PostgreSQL
        if (result.isComplete) {
          try {
            const savedResponse = await prisma.response.create({
              data: {
                formId: id,
                dataJson: updatedData,
                sentiment: result.sentiment || "positive",
                leadScore: result.leadScore || "high",
                aiSummary: result.aiSummary || `Completed submission for ${form.title}`,
              },
            });
            responseId = savedResponse.id;
          } catch (dbErr) {
            console.error("Error saving chatbot response:", dbErr);
          }
        }

        return NextResponse.json({
          reply: result.replyMessage,
          updatedData,
          nextActiveFieldId: result.nextActiveFieldId || null,
          isComplete: result.isComplete,
          responseId,
          sentiment: result.sentiment,
          leadScore: result.leadScore,
          aiSummary: result.aiSummary,
        });
      }
    }

    // Fallback rule-based flow
    const unansweredFields = fields.filter((f) => collectedData[f.id] === undefined || collectedData[f.id] === null || collectedData[f.id] === "");
    const lastUserMsg = messages[messages.length - 1]?.content || "";

    const updatedData = { ...collectedData };
    if (messages.length > 1 && unansweredFields.length > 0) {
      const currentField = unansweredFields[0];
      updatedData[currentField.id] = lastUserMsg;
    }

    const remainingUnanswered = fields.filter((f) => updatedData[f.id] === undefined || updatedData[f.id] === null || updatedData[f.id] === "");

    if (remainingUnanswered.length === 0) {
      let responseId: string | null = null;
      try {
        const savedResponse = await prisma.response.create({
          data: { 
            formId: id, 
            dataJson: updatedData,
            sentiment: "positive",
            leadScore: "high",
            aiSummary: `Submitted ${fields.length} responses for ${form.title}`,
          },
        });
        responseId = savedResponse.id;
      } catch (err) {}

      return NextResponse.json({
        reply: "🎉 Thank you so much! I have recorded all your answers.",
        updatedData,
        nextActiveFieldId: null,
        isComplete: true,
        responseId,
      });
    }

    const nextField = remainingUnanswered[0];
    return NextResponse.json({
      reply: `Could you please provide your ${nextField.label}?`,
      updatedData,
      nextActiveFieldId: nextField.id,
      isComplete: false,
    });
  } catch (error: any) {
    console.error("Chatbot API error:", error);
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 });
  }
}
