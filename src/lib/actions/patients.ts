"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createPatientSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  clinicId: z.string().min(1, "Selecione uma unidade"),
  packageTemplateId: z.string().min(1, "Selecione um pacote"),
  startDate: z.string().min(1, "Informe a data de inicio"),
  notes: z.string().optional(),
  // Initial indication
  initialDoseMg: z.string().optional(),
  initialFrequencyDays: z.string().optional(),
});

export async function createPatient(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Nao autorizado" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = createPatientSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { fullName, clinicId, packageTemplateId, startDate, notes, initialDoseMg, initialFrequencyDays } = parsed.data;

  const patient = await prisma.patient.create({
    data: {
      fullName,
      clinicId,
      packageTemplateId,
      startDate: new Date(startDate),
      notes: notes || null,
      createdById: session.user.id,
      ...(initialDoseMg && parseFloat(initialDoseMg) > 0
        ? {
            indications: {
              create: {
                startDate: new Date(startDate),
                doseMgPerApplication: parseFloat(initialDoseMg),
                frequencyDays: initialFrequencyDays
                  ? parseInt(initialFrequencyDays)
                  : 7,
                createdById: session.user.id,
              },
            },
          }
        : {}),
    },
  });

  revalidatePath("/dashboard");
  redirect(`/patients/${patient.id}`);
}

const updatePatientSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  clinicId: z.string().min(1, "Selecione uma unidade"),
  startDate: z.string().min(1, "Informe a data de inicio"),
  notes: z.string().optional(),
});

export async function updatePatient(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Nao autorizado" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = updatePatientSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { id, fullName, clinicId, startDate, notes } = parsed.data;

  await prisma.patient.update({
    where: { id },
    data: {
      fullName,
      clinicId,
      startDate: new Date(startDate),
      notes: notes || null,
    },
  });

  revalidatePath(`/patients/${id}`);
  revalidatePath("/dashboard");
  redirect(`/patients/${id}`);
}

export async function updatePatientStatus(patientId: string, status: string) {
  const session = await auth();
  if (!session?.user) return { error: "Nao autorizado" };

  await prisma.patient.update({
    where: { id: patientId },
    data: { status: status as any },
  });

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/dashboard");
}
