import { prisma } from "@/lib/prisma";
import { calculateMetrics, type PatientData, type PatientMetrics } from "@/lib/patient-calculations";
import { Decimal } from "@prisma/client/runtime/library";

const patientInclude = {
  clinic: true,
  packageTemplate: true,
  applications: {
    orderBy: { applicationDate: "desc" as const },
  },
  indications: {
    orderBy: { startDate: "desc" as const },
  },
  consultations: {
    orderBy: { consultationDate: "desc" as const },
  },
  measurements: {
    orderBy: { measurementDate: "desc" as const },
  },
  stockAdjustments: {
    orderBy: { createdAt: "desc" as const },
  },
};

function toNumber(val: Decimal | number): number {
  return typeof val === "number" ? val : val.toNumber();
}

export type PatientWithRelations = NonNullable<
  Awaited<ReturnType<typeof getPatientById>>
>;

export type PatientWithMetrics = PatientWithRelations & {
  metrics: PatientMetrics;
};

function buildPatientData(patient: any): PatientData {
  return {
    startDate: new Date(patient.startDate),
    status: patient.status,
    packageTemplate: {
      durationWeeks: patient.packageTemplate.durationWeeks,
      tirzepatidaTotalMg: toNumber(patient.packageTemplate.tirzepatidaTotalMg),
      consultasEndocrinoTotal: patient.packageTemplate.consultasEndocrinoTotal,
      consultasNutriTotal: patient.packageTemplate.consultasNutriTotal,
    },
    applications: patient.applications.map((a: any) => ({
      applicationDate: new Date(a.applicationDate),
      doseMg: toNumber(a.doseMg),
    })),
    indications: patient.indications.map((i: any) => ({
      startDate: new Date(i.startDate),
      doseMgPerApplication: toNumber(i.doseMgPerApplication),
      frequencyDays: i.frequencyDays,
      createdAt: new Date(i.createdAt),
    })),
    consultations: patient.consultations.map((c: any) => ({
      type: c.type as "ENDOCRINO" | "NUTRI",
      consultationDate: new Date(c.consultationDate),
      countsInPackage: c.countsInPackage,
    })),
    stockAdjustments: patient.stockAdjustments.map((s: any) => ({
      adjustmentMg: toNumber(s.adjustmentMg),
    })),
  };
}

export async function getPatientById(id: string) {
  return prisma.patient.findUnique({
    where: { id },
    include: patientInclude,
  });
}

export async function getPatientWithMetrics(
  id: string
): Promise<PatientWithMetrics | null> {
  const patient = await getPatientById(id);
  if (!patient) return null;

  const data = buildPatientData(patient);
  const metrics = calculateMetrics(data);

  return { ...patient, metrics };
}

export async function getPatientsWithMetrics(filters?: {
  clinicId?: string;
  status?: string;
  lowStock?: boolean;
}): Promise<PatientWithMetrics[]> {
  const where: any = {};

  if (filters?.clinicId) {
    where.clinicId = filters.clinicId;
  }
  if (filters?.status) {
    where.status = filters.status;
  }

  const patients = await prisma.patient.findMany({
    where,
    include: patientInclude,
    orderBy: { createdAt: "desc" },
  });

  const results = patients.map((patient) => {
    const data = buildPatientData(patient);
    const metrics = calculateMetrics(data);
    return { ...patient, metrics };
  });

  if (filters?.lowStock) {
    return results.filter((p) => p.metrics.mgRemaining <= 20);
  }

  return results;
}

export async function getClinics() {
  return prisma.clinic.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getPackageTemplates() {
  return prisma.packageTemplate.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
}
