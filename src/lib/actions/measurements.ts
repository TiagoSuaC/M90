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
  return { success: true };
}
