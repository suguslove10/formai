import { prisma } from "@/lib/prisma";

export interface AuditLogEntry {
  userId: string;
  workspaceId?: string | null;
  action: 
    | "FORM_CREATED"
    | "FORM_UPDATED"
    | "FORM_PUBLISHED"
    | "FORM_UNPUBLISHED"
    | "FORM_DELETED"
    | "RESPONSES_VIEWED"
    | "RESPONSES_EXPORTED"
    | "WEBHOOK_CREATED"
    | "WEBHOOK_DELETED"
    | "MEMBER_INVITED"
    | "ROLE_UPDATED";
  resource: string;
  details?: Record<string, any>;
  ipAddress?: string | null;
}

export async function logAuditEvent(entry: AuditLogEntry) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        workspaceId: entry.workspaceId || null,
        action: entry.action,
        resource: entry.resource,
        details: entry.details || {},
        ipAddress: entry.ipAddress || null,
      },
    });
  } catch (err) {
    // Non-blocking for primary application flows
    console.warn("Failed to write audit log:", err);
  }
}
