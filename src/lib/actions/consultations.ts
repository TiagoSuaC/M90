"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createConsultationSchema = z.object({
  patientId: z.string().min(1),
  type: z.enum(["ENDOCRINO", "NUTRI"]),
  consultationDate: z.string().min(1, "Informe a data da consulta"),
  professional: z.string().min(1, "Informe o profissional"),
  notes: z.string().optional(),
  dietNotes: z.string().optional(),
  trainingNotes: z.string().optional(),
  sleepNotes: z.string().optional(),
  hydrationNotes: z.string().optional(),
  otherNotes: z.string().optional(),
  countsInPackage: z.string().optional(),
});

export async function createConsultation(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Nao autorizado" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = createConsultationSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const {
    patientId, type, consultationDate, professional, notes, countsInPackage,
    dietNotes, trainingNotes, sleepNotes, hydrationNotes, otherNotes,
  } = parsed.data;

  await prisma.consultation.create({
    data: {
      patientId,
      type,
      consultationDate: new Date(consultationDate),
      professional,
      notes: notes || null,
      ...(type === "ENDOCRINO" && {
        dietNotes: dietNotes || null,
        trainingNotes: trainingNotes || null,
        sleepNotes: sleepNotes || null,
        hydrationNotes: hydrationNotes || null,
        otherNotes: otherNotes || null,
      }),
      countsInPackage: countsInPackage === "true",
      createdById: session.user.id,
    },
  });

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

const updateConsultationSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  type: z.enum(["ENDOCRINO", "NUTRI"]),
  consultationDate: z.string().min(1, "Informe a data da consulta"),
  professional: z.string().min(1, "Informe o profissional"),
  notes: z.string().optional(),
  dietNotes: z.string().optional(),
  trainingNotes: z.string().optional(),
  sleepNotes: z.string().optional(),
  hydrationNotes: z.string().optional(),
  otherNotes: z.string().optional(),
  countsInPackage: z.string().optional(),
});

export async function updateConsultation(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Nao autorizado" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = updateConsultationSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const {
    id, patientId, type, consultationDate, professional, notes, countsInPackage,
    dietNotes, trainingNotes, sleepNotes, hydrationNotes, otherNotes,
  } = parsed.data;

  const existing = await prisma.consultation.findUnique({ where: { id } });
  if (!existing) return { error: "Consulta nao encontrada" };

  await prisma.consultation.update({
    where: { id },
    data: {
      type,
      consultationDate: new Date(consultationDate),
      professional,
      notes: notes || null,
      dietNotes: type === "ENDOCRINO" ? (dietNotes || null) : null,
      trainingNotes: type === "ENDOCRINO" ? (trainingNotes || null) : null,
      sleepNotes: type === "ENDOCRINO" ? (sleepNotes || null) : null,
      hydrationNotes: type === "ENDOCRINO" ? (hydrationNotes || null) : null,
      otherNotes: type === "ENDOCRINO" ? (otherNotes || null) : null,
      countsInPackage: countsInPackage === "true",
    },
  });

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteConsultation(id: string, patientId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Nao autorizado" };

  const existing = await prisma.consultation.findUnique({ where: { id } });
  if (!existing) return { error: "Consulta nao encontrada" };

  await prisma.consultation.delete({ where: { id } });

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
