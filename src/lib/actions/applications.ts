"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createApplicationSchema = z.object({
  patientId: z.string().min(1),
  applicationDate: z.string().min(1, "Informe a data da aplicacao"),
  doseMg: z.string().refine((v) => parseFloat(v) > 0, "Dose deve ser maior que 0"),
  notes: z.string().optional(),
});

export async function createApplication(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Nao autorizado" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = createApplicationSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { patientId, applicationDate, doseMg, notes } = parsed.data;

  // Validate stock
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      packageTemplate: true,
      applications: true,
      stockAdjustments: true,
    },
  });

  if (!patient) return { error: "Paciente nao encontrado" };

  const totalApplied = patient.applications.reduce(
    (sum, a) => sum + a.doseMg.toNumber(),
    0
  );
  const totalAdjusted = patient.stockAdjustments.reduce(
    (sum, a) => sum + a.adjustmentMg.toNumber(),
    0
  );
  const remaining =
    patient.packageTemplate.tirzepatidaTotalMg.toNumber() +
    totalAdjusted -
    totalApplied;

  if (parseFloat(doseMg) > remaining) {
    return {
      error: `Dose (${doseMg}mg) excede estoque disponivel (${remaining.toFixed(1)}mg)`,
    };
  }

  await prisma.application.create({
    data: {
      patientId,
      applicationDate: new Date(applicationDate),
      doseMg: parseFloat(doseMg),
      notes: notes || null,
      administeredBy: session.user.name,
    },
  });

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

const updateApplicationSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  applicationDate: z.string().min(1, "Informe a data da aplicacao"),
  doseMg: z.string().refine((v) => parseFloat(v) > 0, "Dose deve ser maior que 0"),
  notes: z.string().optional(),
});

export async function updateApplication(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Nao autorizado" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = updateApplicationSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { id, patientId, applicationDate, doseMg, notes } = parsed.data;

  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing) return { error: "Aplicacao nao encontrada" };

  // Validate stock (exclude current application from total)
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      packageTemplate: true,
      applications: true,
      stockAdjustments: true,
    },
  });

  if (!patient) return { error: "Paciente nao encontrado" };

  const totalApplied = patient.applications
    .filter((a) => a.id !== id)
    .reduce((sum, a) => sum + a.doseMg.toNumber(), 0);
  const totalAdjusted = patient.stockAdjustments.reduce(
    (sum, a) => sum + a.adjustmentMg.toNumber(),
    0
  );
  const remaining =
    patient.packageTemplate.tirzepatidaTotalMg.toNumber() +
    totalAdjusted -
    totalApplied;

  if (parseFloat(doseMg) > remaining) {
    return {
      error: `Dose (${doseMg}mg) excede estoque disponivel (${remaining.toFixed(1)}mg)`,
    };
  }

  await prisma.application.update({
    where: { id },
    data: {
      applicationDate: new Date(applicationDate),
      doseMg: parseFloat(doseMg),
      notes: notes || null,
    },
  });

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteApplication(id: string, patientId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Nao autorizado" };

  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing) return { error: "Aplicacao nao encontrada" };

  await prisma.application.delete({ where: { id } });

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
