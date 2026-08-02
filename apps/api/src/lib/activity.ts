import { prisma } from "./prisma.js";

export async function logActivity(input: {
  type: string;
  message: string;
  actorId?: string | null;
  actorName?: string | null;
  meta?: Record<string, unknown> | null;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        type: input.type,
        message: input.message,
        actorId: input.actorId || null,
        actorName: input.actorName || null,
        meta: input.meta ? JSON.stringify(input.meta) : null,
      },
    });
  } catch (err) {
    console.warn("[activity] failed to log:", err);
  }
}
