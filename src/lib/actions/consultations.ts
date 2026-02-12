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

  const { patientId, type, consultationDate, professional, notes, countsInPackage } =
    parsed.data;

  await prisma.consultation.create({
    data: {
      patientId,
      type,
      consultationDate: new Date(consultationDate),
      professional,
      notes: notes || null,
      countsInPackage: countsInPackage === "true",
      createdById: session.user.id,
    },
  });

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
