"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createMeasurementSchema = z.object({
  patientId: z.string().min(1),
  measurementDate: z.string().min(1, "Informe a data da pesagem"),
  weightKg: z
    .string()
    .refine((v) => parseFloat(v) > 0, "Peso deve ser maior que 0"),
  fatPercentage: z.string().optional(),
  leanMassKg: z.string().optional(),
  notes: z.string().optional(),
});

export async function createMeasurement(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Nao autorizado" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = createMeasurementSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { patientId, measurementDate, weightKg, fatPercentage, leanMassKg, notes } =
    parsed.data;

  await prisma.bodyMeasurement.create({
    data: {
      patientId,
      measurementDate: new Date(measurementDate),
      weightKg: parseFloat(weightKg),
      fatPercentage:
        fatPercentage && parseFloat(fatPercentage) > 0
          ? parseFloat(fatPercentage)
          : null,
      leanMassKg:
        leanMassKg && parseFloat(leanMassKg) > 0
          ? parseFloat(leanMassKg)
          : null,
      notes: notes || null,
      createdById: session.user.id,
    },
  });

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

const updateMeasurementSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  measurementDate: z.string().min(1, "Informe a data da pesagem"),
  weightKg: z
    .string()
    .refine((v) => parseFloat(v) > 0, "Peso deve ser maior que 0"),
  fatPercentage: z.string().optional(),
  leanMassKg: z.string().optional(),
  notes: z.string().optional(),
});

export async function updateMeasurement(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Nao autorizado" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = updateMeasurementSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { id, patientId, measurementDate, weightKg, fatPercentage, leanMassKg, notes } =
    parsed.data;

  const existing = await prisma.bodyMeasurement.findUnique({ where: { id } });
  if (!existing) return { error: "Pesagem nao encontrada" };

  await prisma.bodyMeasurement.update({
    where: { id },
    data: {
      measurementDate: new Date(measurementDate),
      weightKg: parseFloat(weightKg),
      fatPercentage:
        fatPercentage && parseFloat(fatPercentage) > 0
          ? parseFloat(fatPercentage)
          : null,
      leanMassKg:
        leanMassKg && parseFloat(leanMassKg) > 0
          ? parseFloat(leanMassKg)
          : null,
      notes: notes || null,
    },
  });

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteMeasurement(id: string, patientId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Nao autorizado" };

  const existing = await prisma.bodyMeasurement.findUnique({ where: { id } });
  if (!existing) return { error: "Pesagem nao encontrada" };

  await prisma.bodyMeasurement.delete({ where: { id } });

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
