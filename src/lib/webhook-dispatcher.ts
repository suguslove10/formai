import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { isSafePublicUrl } from "@/lib/url-guard";

const FETCH_TIMEOUT_MS = 10_000;

// Stable per-form signing secret for the quick webhookUrl field (dedicated
// Webhook records carry their own secret column).
function quickWebhookSecret(formId: string): string {
  const signingKey = process.env.WEBHOOK_SIGNING_SECRET || "formai-webhook-signing";
  return crypto.createHmac("sha256", signingKey).update(formId).digest("hex");
}

export interface WebhookPayload {
  event: "response.created" | "lead.high" | "sentiment.negative";
  formId: string;
  formTitle: string;
  responseId: string;
  data: Record<string, any>;
  sentiment?: string | null;
  leadScore?: string | null;
  aiSummary?: string | null;
  submittedAt: string;
}

export async function dispatchFormWebhooks(payload: WebhookPayload) {
  try {
    // 1. Fetch form specific webhooks
    const form = await prisma.form.findUnique({
      where: { id: payload.formId },
      include: {
        webhooks: {
          where: { isActive: true },
        },
      },
    });

    if (!form) return;

    // Collect endpoints: configured Webhook models + form.webhookUrl quick endpoint
    const targets: { url: string; secret: string; events?: string[] }[] = [];

    if (form.webhookUrl && form.webhookUrl.trim().startsWith("http")) {
      targets.push({
        url: form.webhookUrl.trim(),
        secret: quickWebhookSecret(form.id),
        events: ["response.created", "lead.high", "sentiment.negative"],
      });
    }

    form.webhooks.forEach((wh) => {
      targets.push({
        url: wh.url,
        secret: wh.secret,
        events: wh.events,
      });
    });

    if (targets.length === 0) return;

    // 2. Dispatch asynchronously to each target
    const promises = targets.map(async (target) => {
      try {
        if (!(await isSafePublicUrl(target.url))) {
          console.warn(`Webhook blocked (unsafe destination): ${target.url}`);
          return;
        }

        const isSlack = target.url.includes("hooks.slack.com");
        const isDiscord = target.url.includes("discord.com/api/webhooks");

        let bodyToSend: any = payload;
        let headers: Record<string, string> = {
          "Content-Type": "application/json",
          "User-Agent": "FormAI-Webhook-Dispatcher/1.0",
        };

        if (isSlack) {
          // Format rich Slack Notification Block Card
          bodyToSend = {
            text: `🎉 New FormAI Submission on *${payload.formTitle}*`,
            blocks: [
              {
                type: "header",
                text: {
                  type: "plain_text",
                  text: `📝 New Submission: ${payload.formTitle}`,
                  emoji: true,
                },
              },
              {
                type: "section",
                fields: [
                  {
                    type: "mrkdwn",
                    text: `*AI Sentiment:*\n${payload.sentiment === "positive" ? "🟢 Positive" : payload.sentiment === "negative" ? "🔴 Negative" : "🟡 Neutral"}`,
                  },
                  {
                    type: "mrkdwn",
                    text: `*Lead Priority:*\n${payload.leadScore === "high" ? "🔥 High" : "⚡ Standard"}`,
                  },
                ],
              },
              payload.aiSummary
                ? {
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text: `*AI Summary:* _"${payload.aiSummary}"_`,
                    },
                  }
                : null,
            ].filter(Boolean),
          };
        } else if (isDiscord) {
          // Format Discord Rich Embed Card
          bodyToSend = {
            username: "FormAI Bot",
            embeds: [
              {
                title: `📝 New Submission: ${payload.formTitle}`,
                color: payload.leadScore === "high" ? 0x7c3aed : 0x10b981,
                fields: [
                  { name: "Sentiment", value: payload.sentiment || "Neutral", inline: true },
                  { name: "Lead Score", value: payload.leadScore || "Standard", inline: true },
                  { name: "Summary", value: payload.aiSummary || "Completed submission", inline: false },
                ],
                timestamp: new Date().toISOString(),
              },
            ],
          };
        } else {
          // Standard JSON Webhook with HMAC SHA-256 signature
          const rawString = JSON.stringify(payload);
          const signature = crypto
            .createHmac("sha256", target.secret)
            .update(rawString)
            .digest("hex");

          headers["X-FormAI-Signature"] = signature;
          headers["X-FormAI-Event"] = payload.event;
        }

        await fetch(target.url, {
          method: "POST",
          headers,
          body: JSON.stringify(bodyToSend),
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
      } catch (dispatchErr) {
        console.error(`Webhook delivery error to ${target.url}:`, dispatchErr);
      }
    });

    await Promise.allSettled(promises);
  } catch (err) {
    console.error("Error in dispatchFormWebhooks:", err);
  }
}
