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
    orderBy: [{ startDate: "desc" as const }, { createdAt: "desc" as const }],
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

export type SortField =
  | "fullName"
  | "clinic"
  | "weeksElapsed"
  | "mgRemaining"
  | "nextApplicationDate"
  | "status";

export type SortOrder = "asc" | "desc";

const dbSortFields: Record<string, any> = {
  fullName: { fullName: "placeholder" },
  clinic: { clinic: { name: "placeholder" } },
  status: { status: "placeholder" },
};

export async function getPatientsWithMetrics(filters?: {
  clinicId?: string;
  status?: string;
  lowStock?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}): Promise<PatientWithMetrics[]> {
  const where: any = {};

  if (filters?.clinicId) {
    where.clinicId = filters.clinicId;
  }
  if (filters?.status) {
    where.status = filters.status;
  }
  if (filters?.search) {
    where.fullName = { contains: filters.search, mode: "insensitive" };
  }
  if (filters?.dateFrom || filters?.dateTo) {
    where.startDate = {};
    if (filters.dateFrom) {
      where.startDate.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.startDate.lte = new Date(filters.dateTo + "T23:59:59.999Z");
    }
  }

  const sortBy = filters?.sortBy;
  const sortOrder = filters?.sortOrder || "asc";

  let orderBy: any = { createdAt: "desc" };
  if (sortBy && dbSortFields[sortBy]) {
    orderBy = JSON.parse(
      JSON.stringify(dbSortFields[sortBy]).replace('"placeholder"', `"${sortOrder}"`)
    );
  }

  const patients = await prisma.patient.findMany({
    where,
    include: patientInclude,
    orderBy,
  });

  let results = patients.map((patient) => {
    const data = buildPatientData(patient);
    const metrics = calculateMetrics(data);
    return { ...patient, metrics };
  });

  if (filters?.lowStock) {
    results = results.filter((p) => p.metrics.mgRemaining <= 20);
  }

  // Sort by computed fields (post-query)
  if (sortBy && !dbSortFields[sortBy]) {
    results.sort((a, b) => {
      let valA: number | string | null;
      let valB: number | string | null;

      switch (sortBy) {
        case "weeksElapsed":
          valA = a.metrics.weeksElapsed;
          valB = b.metrics.weeksElapsed;
          break;
        case "mgRemaining":
          valA = a.metrics.mgRemaining;
          valB = b.metrics.mgRemaining;
          break;
        case "nextApplicationDate":
          valA = a.metrics.nextApplicationDate?.getTime() ?? null;
          valB = b.metrics.nextApplicationDate?.getTime() ?? null;
          break;
        default:
          return 0;
      }

      if (valA === null && valB === null) return 0;
      if (valA === null) return 1;
      if (valB === null) return -1;

      const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
      return sortOrder === "desc" ? -cmp : cmp;
    });
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
