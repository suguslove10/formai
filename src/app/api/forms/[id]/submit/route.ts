import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FormFieldType } from "@/lib/validations/form";
import { dispatchFormWebhooks } from "@/lib/webhook-dispatcher";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { checkPlanLimit } from "@/lib/billing";
import OpenAI from "openai";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // Per-IP rate limit: public endpoint, and each submission can trigger a
    // paid AI analysis call plus webhook dispatches
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`submit:${id}:${clientIp}`, 15, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid submission data" }, { status: 400 });
    }

    // Fetch form and check published status
    const form = await prisma.form.findUnique({
      where: { id },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (form.status !== "published") {
      return NextResponse.json({ error: "This form is currently not accepting submissions." }, { status: 403 });
    }

    // Check Plan Response Limits for the Form Owner
    const planCheck = await checkPlanLimit(form.userId, "add_response");
    if (!planCheck.allowed) {
      console.log(`[PLAN_LIMIT_HIT] formId=${id} ownerId=${form.userId} action=add_response`);
      return NextResponse.json(
        { error: "This business has reached their monthly capacity. Please check back later or contact them directly." },
        { status: 403 }
      );
    }

    const fields = (form.fieldsJson as unknown as FormFieldType[]) || [];
    const errors: Record<string, string> = {};
    const sanitizedData: Record<string, any> = {};

    // Validate each field
    for (const field of fields) {
      const value = body[field.id];

      // Check required
      if (field.required) {
        if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
          errors[field.id] = `${field.label} is required`;
          continue;
        }
      }

      // If value is provided, validate by field type
      if (value !== undefined && value !== null && value !== "") {
        switch (field.type) {
          case "email": {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (typeof value !== "string" || !emailRegex.test(value)) {
              errors[field.id] = "Please enter a valid email address";
            } else {
              sanitizedData[field.id] = value.trim().toLowerCase();
            }
            break;
          }
          case "number": {
            const num = Number(value);
            if (isNaN(num)) {
              errors[field.id] = "Please enter a valid number";
            } else {
              sanitizedData[field.id] = num;
            }
            break;
          }
          case "rating": {
            const rating = Number(value);
            if (isNaN(rating) || rating < 1 || rating > 5) {
              errors[field.id] = "Rating must be between 1 and 5";
            } else {
              sanitizedData[field.id] = rating;
            }
            break;
          }
          case "select":
          case "radio": {
            if (field.options && field.options.length > 0) {
              if (!field.options.includes(String(value))) {
                errors[field.id] = "Please select a valid option from the list";
              } else {
                sanitizedData[field.id] = value;
              }
            } else {
              sanitizedData[field.id] = value;
            }
            break;
          }
          case "checkbox": {
            if (Array.isArray(value)) {
              sanitizedData[field.id] = value;
            } else if (typeof value === "boolean") {
              sanitizedData[field.id] = value;
            } else {
              sanitizedData[field.id] = [value];
            }
            break;
          }
          case "date": {
            const parsedDate = new Date(value);
            if (isNaN(parsedDate.getTime())) {
              errors[field.id] = "Please enter a valid date";
            } else {
              sanitizedData[field.id] = value;
            }
            break;
          }
          default:
            sanitizedData[field.id] = value;
            break;
        }
      } else {
        sanitizedData[field.id] = null;
      }
    }

    // Preserve UTM and tracking parameters
    const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "referrer"];
    utmKeys.forEach((k) => {
      if (body[k]) {
        sanitizedData[k] = body[k];
      }
    });

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          fieldErrors: errors,
        },
        { status: 422 }
      );
    }

    // Calculate AI Sentiment & Summary if OpenAI is available. When the
    // analysis doesn't run, store nulls — never fabricated values that would
    // skew analytics or fire "lead.high" webhooks for every submission.
    let sentiment: string | null = null;
    let leadScore: string | null = null;
    let aiSummary: string | null = null;

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey.startsWith("sk-")) {
      try {
        const openai = new OpenAI({ apiKey });
        const analysis = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an executive CRM analyst. Analyze this form response data and output JSON with: sentiment (positive, neutral, or negative), leadScore (high, medium, or low), and aiSummary (1 concise sentence summary).",
            },
            {
              role: "user",
              content: `Form Title: ${form.title}\nResponses:\n${JSON.stringify(sanitizedData, null, 2)}`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        });

        const parsedAnalysis = JSON.parse(analysis.choices[0]?.message?.content || "{}");
        if (parsedAnalysis.sentiment) sentiment = parsedAnalysis.sentiment;
        if (parsedAnalysis.leadScore) leadScore = parsedAnalysis.leadScore;
        if (parsedAnalysis.aiSummary) aiSummary = parsedAnalysis.aiSummary;
      } catch (aiErr) {
        console.warn("AI analysis skipped on submission:", aiErr);
      }
    }

    // Save submission response to PostgreSQL
    const responseRecord = await prisma.response.create({
      data: {
        formId: id,
        dataJson: sanitizedData,
        sentiment,
        leadScore,
        aiSummary,
      },
    });

    // Asynchronously dispatch outbound Webhooks & Slack alerts
    dispatchFormWebhooks({
      event: leadScore === "high" ? "lead.high" : sentiment === "negative" ? "sentiment.negative" : "response.created",
      formId: id,
      formTitle: form.title,
      responseId: responseRecord.id,
      data: sanitizedData,
      sentiment,
      leadScore,
      aiSummary,
      submittedAt: new Date().toISOString(),
    }).catch((e) => console.error("Webhook dispatch error:", e));

    return NextResponse.json({
      success: true,
      responseId: responseRecord.id,
      message: "Form response submitted successfully",
    });
  } catch (error: any) {
    console.error("Error submitting form response:", error);
    return NextResponse.json({ error: "Failed to submit form response. Please try again." }, { status: 500 });
  }
}
