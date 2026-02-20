"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addWeeks } from "date-fns";

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

// --- Plan-based actions ---

const phaseSchema = z.object({
  id: z.string().optional(),
  durationWeeks: z.number().int().min(1, "Duracao minima de 1 semana"),
  doseMg: z.number().positive("Dose deve ser maior que 0"),
  frequencyDays: z.number().int().positive(),
  notes: z.string().optional(),
});

const saveIndicationPlanSchema = z.object({
  patientId: z.string().min(1),
  startDate: z.string().min(1, "Informe a data de inicio"),
  phases: z.array(phaseSchema).min(1, "Adicione pelo menos uma fase"),
});

export async function saveIndicationPlan(input: {
  patientId: string;
  startDate: string;
  phases: {
    id?: string;
    durationWeeks: number;
    doseMg: number;
    frequencyDays: number;
    notes?: string;
  }[];
}) {
  const session = await auth();
  if (!session?.user) return { error: "Nao autorizado" };

  const parsed = saveIndicationPlanSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { patientId, startDate, phases } = parsed.data;
  const planStart = new Date(startDate);

  // Compute each phase's start date from cumulative weeks
  let cumulativeWeeks = 0;
  const phasesWithDates = phases.map((phase, index) => {
    const phaseStartDate = addWeeks(planStart, cumulativeWeeks);
    cumulativeWeeks += phase.durationWeeks;
    return {
      ...phase,
      phaseOrder: index,
      startDate: phaseStartDate,
    };
  });

  // Get existing indication IDs for this patient
  const existingIndications = await prisma.medicalIndication.findMany({
    where: { patientId },
    select: { id: true },
  });
  const existingIds = new Set(existingIndications.map((i) => i.id));

  // Determine which phases to update, create, or delete
  const submittedIds = new Set(
    phasesWithDates.filter((p) => p.id).map((p) => p.id!)
  );
  const idsToDelete = [...existingIds].filter((id) => !submittedIds.has(id));

  await prisma.$transaction(async (tx) => {
    // Delete removed phases
    if (idsToDelete.length > 0) {
      await tx.medicalIndication.deleteMany({
        where: { id: { in: idsToDelete }, patientId },
      });
    }

    // Update or create each phase
    for (const phase of phasesWithDates) {
      if (phase.id && existingIds.has(phase.id)) {
        await tx.medicalIndication.update({
          where: { id: phase.id },
          data: {
            phaseOrder: phase.phaseOrder,
            startDate: phase.startDate,
            durationWeeks: phase.durationWeeks,
            doseMgPerApplication: phase.doseMg,
            frequencyDays: phase.frequencyDays,
            notes: phase.notes || null,
          },
        });
      } else {
        await tx.medicalIndication.create({
          data: {
            patientId,
            phaseOrder: phase.phaseOrder,
            startDate: phase.startDate,
            durationWeeks: phase.durationWeeks,
            doseMgPerApplication: phase.doseMg,
            frequencyDays: phase.frequencyDays,
            notes: phase.notes || null,
            createdById: session.user.id,
          },
        });
      }
    }
  });

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteIndication(indicationId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Nao autorizado" };

  const indication = await prisma.medicalIndication.findUnique({
    where: { id: indicationId },
    select: { patientId: true },
  });

  if (!indication) return { error: "Indicacao nao encontrada" };

  await prisma.medicalIndication.delete({
    where: { id: indicationId },
  });

  revalidatePath(`/patients/${indication.patientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
