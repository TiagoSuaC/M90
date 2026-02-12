import { differenceInDays, differenceInWeeks, addDays, addWeeks } from "date-fns";

export interface PatientData {
  startDate: Date;
  status: string;
  packageTemplate: {
    durationWeeks: number;
    tirzepatidaTotalMg: number;
    consultasEndocrinoTotal: number;
    consultasNutriTotal: number;
  };
  applications: { applicationDate: Date; doseMg: number }[];
  indications: {
    startDate: Date;
    doseMgPerApplication: number;
    frequencyDays: number;
    createdAt: Date;
  }[];
  consultations: {
    type: "ENDOCRINO" | "NUTRI";
    consultationDate: Date;
    countsInPackage: boolean;
  }[];
  stockAdjustments: { adjustmentMg: number }[];
}

export interface Alert {
  type: "STOCK_LOW" | "MEDICATION_ENDING" | "RETURN_PENDING" | "PACKAGE_ENDING";
  severity: "GREEN" | "YELLOW" | "RED";
  message: string;
}

export interface PatientMetrics {
  weeksElapsed: number;
  weeksRemaining: number;
  expectedEndDate: Date;

  endocrinoCompleted: number;
  endocrinoRemaining: number;
  nutriCompleted: number;
  nutriRemaining: number;

  mgAppliedTotal: number;
  mgAdjusted: number;
  mgRemaining: number;

  currentIndication: { doseMg: number; frequencyDays: number } | null;
  estimatedApplicationsLeft: number;
  estimatedDaysLeft: number;
  estimatedMedicationEndDate: Date | null;
  nextApplicationDate: Date | null;

  alerts: Alert[];
}

export function calculateMetrics(
  data: PatientData,
  now: Date = new Date()
): PatientMetrics {
  const { startDate, packageTemplate: pkg } = data;

  // Weeks
  const weeksElapsed = Math.max(0, differenceInWeeks(now, startDate));
  const weeksRemaining = Math.max(0, pkg.durationWeeks - weeksElapsed);
  const expectedEndDate = addWeeks(startDate, pkg.durationWeeks);

  // Consultations
  const endocrinoCompleted = data.consultations.filter(
    (c) => c.type === "ENDOCRINO" && c.countsInPackage
  ).length;
  const endocrinoRemaining = Math.max(
    0,
    pkg.consultasEndocrinoTotal - endocrinoCompleted
  );

  const nutriCompleted = data.consultations.filter(
    (c) => c.type === "NUTRI" && c.countsInPackage
  ).length;
  const nutriRemaining = Math.max(0, pkg.consultasNutriTotal - nutriCompleted);

  // Medication
  const mgAppliedTotal = data.applications.reduce(
    (sum, a) => sum + a.doseMg,
    0
  );
  const mgAdjusted = data.stockAdjustments.reduce(
    (sum, a) => sum + a.adjustmentMg,
    0
  );
  const mgRemaining = Math.max(
    0,
    pkg.tirzepatidaTotalMg + mgAdjusted - mgAppliedTotal
  );

  // Current indication (most recent by startDate that is <= now)
  const validIndications = data.indications
    .filter((ind) => ind.startDate <= now)
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  const currentIndication = validIndications.length > 0
    ? {
        doseMg: validIndications[0].doseMgPerApplication,
        frequencyDays: validIndications[0].frequencyDays,
      }
    : null;

  // Projection
  let estimatedApplicationsLeft = 0;
  let estimatedDaysLeft = 0;
  let estimatedMedicationEndDate: Date | null = null;
  let nextApplicationDate: Date | null = null;

  if (currentIndication && currentIndication.doseMg > 0) {
    estimatedApplicationsLeft = Math.floor(mgRemaining / currentIndication.doseMg);
    estimatedDaysLeft = estimatedApplicationsLeft * currentIndication.frequencyDays;
    estimatedMedicationEndDate =
      estimatedDaysLeft > 0 ? addDays(now, estimatedDaysLeft) : null;

    // Next application date: last application date + frequency, or now if no applications
    const sortedApps = [...data.applications].sort(
      (a, b) =>
        new Date(b.applicationDate).getTime() -
        new Date(a.applicationDate).getTime()
    );

    if (sortedApps.length > 0) {
      nextApplicationDate = addDays(
        new Date(sortedApps[0].applicationDate),
        currentIndication.frequencyDays
      );
    } else {
      nextApplicationDate = now > startDate ? now : startDate;
    }
  }

  // Alerts
  const alerts: Alert[] = [];

  // Stock alerts
  if (mgRemaining <= 10) {
    alerts.push({
      type: "STOCK_LOW",
      severity: "RED",
      message: `Estoque critico: ${mgRemaining.toFixed(1)}mg restantes`,
    });
  } else if (mgRemaining <= 20) {
    alerts.push({
      type: "STOCK_LOW",
      severity: "YELLOW",
      message: `Estoque baixo: ${mgRemaining.toFixed(1)}mg restantes`,
    });
  }

  // Medication projection alerts
  if (currentIndication && estimatedDaysLeft > 0) {
    if (estimatedDaysLeft <= 7) {
      alerts.push({
        type: "MEDICATION_ENDING",
        severity: "RED",
        message: `Medicacao acaba em ~${estimatedDaysLeft} dias`,
      });
    } else if (estimatedDaysLeft <= 14) {
      alerts.push({
        type: "MEDICATION_ENDING",
        severity: "YELLOW",
        message: `Medicacao acaba em ~${estimatedDaysLeft} dias`,
      });
    }
  }

  // Return pending alerts (consultation pending > 4 weeks)
  const returnThresholdWeeks = 4;
  const lastEndocrino = data.consultations
    .filter((c) => c.type === "ENDOCRINO")
    .sort(
      (a, b) =>
        new Date(b.consultationDate).getTime() -
        new Date(a.consultationDate).getTime()
    )[0];

  if (endocrinoRemaining > 0) {
    const lastDate = lastEndocrino
      ? new Date(lastEndocrino.consultationDate)
      : startDate;
    const daysSinceLast = differenceInDays(now, lastDate);
    if (daysSinceLast > returnThresholdWeeks * 7) {
      alerts.push({
        type: "RETURN_PENDING",
        severity: "YELLOW",
        message: `Retorno endocrino pendente ha ${Math.floor(daysSinceLast / 7)} semanas`,
      });
    }
  }

  const lastNutri = data.consultations
    .filter((c) => c.type === "NUTRI")
    .sort(
      (a, b) =>
        new Date(b.consultationDate).getTime() -
        new Date(a.consultationDate).getTime()
    )[0];

  if (nutriRemaining > 0) {
    const lastDate = lastNutri
      ? new Date(lastNutri.consultationDate)
      : startDate;
    const daysSinceLast = differenceInDays(now, lastDate);
    if (daysSinceLast > returnThresholdWeeks * 7) {
      alerts.push({
        type: "RETURN_PENDING",
        severity: "YELLOW",
        message: `Retorno nutri pendente ha ${Math.floor(daysSinceLast / 7)} semanas`,
      });
    }
  }

  // Package ending alerts
  if (weeksRemaining === 0) {
    alerts.push({
      type: "PACKAGE_ENDING",
      severity: "RED",
      message: "Pacote encerrado",
    });
  } else if (weeksRemaining <= 2) {
    alerts.push({
      type: "PACKAGE_ENDING",
      severity: "YELLOW",
      message: `Pacote encerra em ${weeksRemaining} semana(s)`,
    });
  }

  return {
    weeksElapsed,
    weeksRemaining,
    expectedEndDate,
    endocrinoCompleted,
    endocrinoRemaining,
    nutriCompleted,
    nutriRemaining,
    mgAppliedTotal,
    mgAdjusted,
    mgRemaining,
    currentIndication,
    estimatedApplicationsLeft,
    estimatedDaysLeft,
    estimatedMedicationEndDate,
    nextApplicationDate,
    alerts,
  };
}

export function getAlertSeverityVariant(
  severity: "GREEN" | "YELLOW" | "RED"
): "success" | "warning" | "danger" {
  switch (severity) {
    case "GREEN":
      return "success";
    case "YELLOW":
      return "warning";
    case "RED":
      return "danger";
  }
}
