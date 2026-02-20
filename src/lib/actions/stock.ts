"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createStockAdjustmentSchema = z.object({
  patientId: z.string().min(1),
  adjustmentMg: z
    .string()
    .refine((v) => parseFloat(v) !== 0, "Ajuste nao pode ser zero"),
  reason: z.string().min(1, "Informe o motivo"),
});

export async function createStockAdjustment(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Nao autorizado" };

  if ((session.user as any).role !== "ADMIN") {
    return { error: "Apenas administradores podem ajustar estoque" };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = createStockAdjustmentSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { patientId, adjustmentMg, reason } = parsed.data;

  await prisma.stockAdjustment.create({
    data: {
      patientId,
      adjustmentMg: parseFloat(adjustmentMg),
      reason,
      createdById: session.user.id,
    },
  });

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

const updateStockAdjustmentSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  adjustmentMg: z
    .string()
    .refine((v) => parseFloat(v) !== 0, "Ajuste nao pode ser zero"),
  reason: z.string().min(1, "Informe o motivo"),
});

export async function updateStockAdjustment(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Nao autorizado" };

  if ((session.user as any).role !== "ADMIN") {
    return { error: "Apenas administradores podem ajustar estoque" };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = updateStockAdjustmentSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { id, patientId, adjustmentMg, reason } = parsed.data;

  const existing = await prisma.stockAdjustment.findUnique({ where: { id } });
  if (!existing) return { error: "Ajuste nao encontrado" };

  await prisma.stockAdjustment.update({
    where: { id },
    data: {
      adjustmentMg: parseFloat(adjustmentMg),
      reason,
    },
  });

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteStockAdjustment(id: string, patientId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Nao autorizado" };

  if ((session.user as any).role !== "ADMIN") {
    return { error: "Apenas administradores podem ajustar estoque" };
  }

  const existing = await prisma.stockAdjustment.findUnique({ where: { id } });
  if (!existing) return { error: "Ajuste nao encontrado" };

  await prisma.stockAdjustment.delete({ where: { id } });

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
