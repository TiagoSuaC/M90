"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createIndicationSchema = z.object({
  patientId: z.string().min(1),
  startDate: z.string().min(1, "Informe a data de inicio"),
  doseMgPerApplication: z
    .string()
    .refine((v) => parseFloat(v) > 0, "Dose deve ser maior que 0"),
  frequencyDays: z.string().refine(
    (v) => parseInt(v) > 0,
    "Frequencia deve ser maior que 0"
  ),
  notes: z.string().optional(),
});

export async function createIndication(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Nao autorizado" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = createIndicationSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { patientId, startDate, doseMgPerApplication, frequencyDays, notes } =
    parsed.data;

  await prisma.medicalIndication.create({
    data: {
      patientId,
      startDate: new Date(startDate),
      doseMgPerApplication: parseFloat(doseMgPerApplication),
      frequencyDays: parseInt(frequencyDays),
      notes: notes || null,
      createdById: session.user.id,
    },
  });

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
