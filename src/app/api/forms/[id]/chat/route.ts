import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { FormFieldType } from "@/lib/validations/form";
import { dispatchFormWebhooks } from "@/lib/webhook-dispatcher";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Bounds that keep a public, LLM-backed endpoint from being abused
const MAX_CONVERSATION_MESSAGES = 80; // hard cap per conversation
const HISTORY_WINDOW = 12; // messages sent to the model per turn
const MAX_MESSAGE_LENGTH = 4000; // characters per message

interface RouteParams {
  params: {
    id: string;
  };
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Persist the full transcript after each turn so owners can monitor every
// conversation — including abandoned ones. Non-blocking: chat still works
// if the write fails.
async function persistConversation(opts: {
  conversationId?: string | null;
  formId: string;
  transcript: ChatMessage[];
  collectedData: Record<string, any>;
  isComplete: boolean;
  responseId?: string | null;
}): Promise<string | null> {
  try {
    const data = {
      messagesJson: opts.transcript as any,
      collectedJson: opts.collectedData as any,
      isComplete: opts.isComplete,
      responseId: opts.responseId || null,
    };

    if (opts.conversationId) {
      const updated = await prisma.conversation.updateMany({
        where: { id: opts.conversationId, formId: opts.formId },
        data,
      });
      if (updated.count > 0) return opts.conversationId;
    }

    const created = await prisma.conversation.create({
      data: { formId: opts.formId, ...data },
    });
    return created.id;
  } catch (err) {
    console.warn("Conversation persistence skipped:", err);
    return opts.conversationId || null;
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // Per-IP rate limit: this endpoint is public and each call costs an LLM request
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`chat:${id}:${clientIp}`, 20, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many messages. Please wait a moment before continuing." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: "Invalid chat payload" }, { status: 400 });
    }

    const rawMessages = body.messages as ChatMessage[];
    const collectedData = body.collectedData || {};
    const incomingConversationId: string | null =
      typeof body.conversationId === "string" ? body.conversationId : null;

    if (rawMessages.length > MAX_CONVERSATION_MESSAGES) {
      return NextResponse.json(
        { error: "This conversation is too long. Please restart the chat." },
        { status: 400 }
      );
    }
    if (rawMessages.some((m) => typeof m?.content !== "string" || m.content.length > MAX_MESSAGE_LENGTH)) {
      return NextResponse.json({ error: "Invalid chat payload" }, { status: 400 });
    }

    // Only the recent window is sent to the model; collectedData carries the
    // durable state, so older turns are not needed for extraction.
    const messages = rawMessages.slice(-HISTORY_WINDOW);

    // Fetch form
    const form = await prisma.form.findUnique({
      where: { id },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Draft forms are only chattable by their owner (editor preview)
    if (form.status !== "published") {
      let ownerId: string | null = null;
      try {
        ownerId = auth()?.userId ?? null;
      } catch (e) {}
      const isDemo = process.env.DEMO_MODE === "true" && form.userId === "demo_user";
      if (!isDemo && (!ownerId || ownerId !== form.userId)) {
        return NextResponse.json(
          { error: "This form is not currently available." },
          { status: 403 }
        );
      }
    }

    const fields = (form.fieldsJson as unknown as FormFieldType[]) || [];
    const apiKey = process.env.OPENAI_API_KEY;

    // Custom greeting: answer the opening handshake directly with the
    // configured welcome message instead of a generated one (no LLM call).
    if (messages.length <= 1 && form.botGreeting && form.botGreeting.trim()) {
      const firstField = fields.find(
        (f) => collectedData[f.id] === undefined || collectedData[f.id] === null || collectedData[f.id] === ""
      );
      const greeting = form.botGreeting.trim();
      const conversationId = await persistConversation({
        conversationId: incomingConversationId,
        formId: id,
        transcript: [...rawMessages, { role: "assistant", content: greeting }],
        collectedData,
        isComplete: false,
      });
      return NextResponse.json({
        reply: greeting,
        updatedData: collectedData,
        nextActiveFieldId: firstField?.id || null,
        isComplete: false,
        responseId: null,
        conversationId,
      });
    }

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
            // Only store what the model actually assessed — no optimistic
            // defaults that would misreport analytics or misfire webhooks
            const savedResponse = await prisma.response.create({
              data: {
                formId: id,
                dataJson: updatedData,
                sentiment: result.sentiment || null,
                leadScore: result.leadScore || null,
                aiSummary: result.aiSummary || null,
              },
            });
            responseId = savedResponse.id;

            // Trigger Enterprise outbound webhooks
            dispatchFormWebhooks({
              event: result.leadScore === "high" ? "lead.high" : result.sentiment === "negative" ? "sentiment.negative" : "response.created",
              formId: id,
              formTitle: form.title,
              responseId: savedResponse.id,
              data: updatedData,
              sentiment: result.sentiment || null,
              leadScore: result.leadScore || null,
              aiSummary: result.aiSummary || null,
              submittedAt: new Date().toISOString(),
            }).catch((e) => console.error("Chatbot webhook error:", e));
          } catch (dbErr) {
            console.error("Error saving chatbot response:", dbErr);
          }
        }

        const conversationId = await persistConversation({
          conversationId: incomingConversationId,
          formId: id,
          transcript: [...rawMessages, { role: "assistant", content: result.replyMessage }],
          collectedData: updatedData,
          isComplete: !!result.isComplete,
          responseId,
        });

        return NextResponse.json({
          reply: result.replyMessage,
          updatedData,
          nextActiveFieldId: result.nextActiveFieldId || null,
          isComplete: result.isComplete,
          responseId,
          conversationId,
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
        // Rule-based fallback did no AI analysis — store nothing rather
        // than fabricated sentiment/lead values
        const savedResponse = await prisma.response.create({
          data: {
            formId: id,
            dataJson: updatedData,
          },
        });
        responseId = savedResponse.id;
      } catch (err) {}

      const doneReply = "🎉 Thank you so much! I have recorded all your answers.";
      const conversationId = await persistConversation({
        conversationId: incomingConversationId,
        formId: id,
        transcript: [...rawMessages, { role: "assistant", content: doneReply }],
        collectedData: updatedData,
        isComplete: true,
        responseId,
      });

      return NextResponse.json({
        reply: doneReply,
        updatedData,
        nextActiveFieldId: null,
        isComplete: true,
        responseId,
        conversationId,
      });
    }

    const nextField = remainingUnanswered[0];
    const nextReply = `Could you please provide your ${nextField.label}?`;
    const conversationId = await persistConversation({
      conversationId: incomingConversationId,
      formId: id,
      transcript: [...rawMessages, { role: "assistant", content: nextReply }],
      collectedData: updatedData,
      isComplete: false,
    });

    return NextResponse.json({
      reply: nextReply,
      updatedData,
      nextActiveFieldId: nextField.id,
      isComplete: false,
      conversationId,
    });
  } catch (error: any) {
    console.error("Chatbot API error:", error);
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 });
  }
}
