import { prisma } from "@/lib/prisma";
import { PlanType } from "@prisma/client";

export const UPGRADE_CONTACT = {
  email: "sugugalag@gmail.com",
  whatsapp: "8660844123",
  whatsappLink: "https://wa.me/918660844123?text=Hi!%20I%20want%20to%20upgrade%20my%20FormAI%20plan.",
};

export interface PlanConfig {
  name: string;
  maxForms: number; // Max total active bots/forms allowed in DB
  maxResponsesPerMonth: number; // Max total responses across all forms per calendar month
  removeBranding: boolean;
  ragTraining: boolean;
  multiWorkspace: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanConfig> = {
  FREE: {
    name: "Free Plan",
    maxForms: 1,
    maxResponsesPerMonth: 50,
    removeBranding: false,
    ragTraining: false,
    multiWorkspace: false,
  },
  PRO: {
    name: "Pro Plan",
    maxForms: 5,
    maxResponsesPerMonth: Infinity,
    removeBranding: true,
    ragTraining: true,
    multiWorkspace: false,
  },
  AGENCY: {
    name: "Agency Plan",
    maxForms: Infinity,
    maxResponsesPerMonth: Infinity,
    removeBranding: true,
    ragTraining: true,
    multiWorkspace: true,
  },
};

/**
 * Returns the effective PlanType for a user object.
 * If planExpiresAt has passed, automatically downgrades evaluation to FREE.
 */
export function getUserEffectivePlan(user: {
  plan: PlanType;
  planExpiresAt?: Date | string | null;
}): PlanType {
  if (user.planExpiresAt) {
    const expiryDate = new Date(user.planExpiresAt);
    if (!isNaN(expiryDate.getTime()) && expiryDate.getTime() < Date.now()) {
      return "FREE";
    }
  }
  return user.plan || "FREE";
}

export interface PlanCheckResult {
  allowed: boolean;
  plan: PlanType;
  limits: PlanConfig;
  reason?: string;
}

/**
 * Enforces plan limits for creating bots/forms or recording responses.
 * - 'create_bot': Counts current live forms in DB for userId.
 * - 'add_response': Counts responses recorded in current calendar month for userId.
 */
export async function checkPlanLimit(
  userId: string,
  action: "create_bot" | "add_response"
): Promise<PlanCheckResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    const currentPlan: PlanType = user ? getUserEffectivePlan(user) : "FREE";
    const limits = PLAN_LIMITS[currentPlan];

    if (action === "create_bot") {
      if (limits.maxForms !== Infinity) {
        // Counts existing live forms in DB owned by this user
        const existingCount = await prisma.form.count({
          where: { userId },
        });

        if (existingCount >= limits.maxForms) {
          return {
            allowed: false,
            plan: currentPlan,
            limits,
            reason: `You have reached your limit of ${limits.maxForms} ${
              limits.maxForms === 1 ? "bot/form" : "bots/forms"
            } on the ${limits.name}. Please upgrade to create more.`,
          };
        }
      }
    } else if (action === "add_response") {
      if (limits.maxResponsesPerMonth !== Infinity) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const monthlyResponseCount = await prisma.response.count({
          where: {
            form: { userId },
            createdAt: { gte: startOfMonth },
          },
        });

        if (monthlyResponseCount >= limits.maxResponsesPerMonth) {
          return {
            allowed: false,
            plan: currentPlan,
            limits,
            reason: `This form has reached the monthly limit of ${limits.maxResponsesPerMonth} responses on the ${limits.name}.`,
          };
        }
      }
    }

    return {
      allowed: true,
      plan: currentPlan,
      limits,
    };
  } catch (error) {
    console.error("Error checking plan limit:", error);
    // Safe fallback: allow action if DB check fails transiently
    return {
      allowed: true,
      plan: "FREE",
      limits: PLAN_LIMITS.FREE,
    };
  }
}

export interface UserPlanUsage {
  plan: PlanType;
  effectivePlan: PlanType;
  isExpired: boolean;
  planActivatedAt: Date | null;
  planExpiresAt: Date | null;
  planNotes: string | null;
  limits: PlanConfig;
  formsUsed: number;
  formsLimit: number;
  monthlyResponsesUsed: number;
  monthlyResponsesLimit: number;
}

/**
 * Returns comprehensive plan and usage metadata for dashboard rendering.
 */
export async function getUserPlanAndUsage(userId: string): Promise<UserPlanUsage> {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  const rawPlan: PlanType = user?.plan || "FREE";
  const effectivePlan: PlanType = user ? getUserEffectivePlan(user) : "FREE";
  const isExpired =
    !!user?.planExpiresAt && new Date(user.planExpiresAt).getTime() < Date.now();
  const limits = PLAN_LIMITS[effectivePlan];

  // Active form count
  const formsUsed = await prisma.form.count({
    where: { userId },
  });

  // Current calendar month response count
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyResponsesUsed = await prisma.response.count({
    where: {
      form: { userId },
      createdAt: { gte: startOfMonth },
    },
  });

  return {
    plan: rawPlan,
    effectivePlan,
    isExpired,
    planActivatedAt: user?.planActivatedAt || null,
    planExpiresAt: user?.planExpiresAt || null,
    planNotes: user?.planNotes || null,
    limits,
    formsUsed,
    formsLimit: limits.maxForms,
    monthlyResponsesUsed,
    monthlyResponsesLimit: limits.maxResponsesPerMonth,
  };
}
