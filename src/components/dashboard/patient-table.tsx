import { Suspense } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { InlineProgress } from "@/components/ui/inline-progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PatientWithMetrics } from "@/lib/queries/patient-with-metrics";
import { getAlertSeverityVariant } from "@/lib/patient-calculations";
import { formatDate } from "@/lib/utils";
import { QuickApplyDialog } from "./quick-apply-dialog";
import { SortableHeader } from "./sortable-header";

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  COMPLETED: "Concluido",
  PAUSED: "Pausado",
  CANCELLED: "Cancelado",
};

const statusVariants: Record<string, "success" | "secondary" | "warning" | "danger"> = {
  ACTIVE: "success",
  COMPLETED: "secondary",
  PAUSED: "warning",
  CANCELLED: "danger",
};

interface PatientTableProps {
  patients: PatientWithMetrics[];
}

export function PatientTable({ patients }: PatientTableProps) {
  if (patients.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum paciente encontrado.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <Suspense fallback={<TableHead>Paciente</TableHead>}>
            <SortableHeader column="fullName" label="Paciente" />
          </Suspense>
          <Suspense fallback={<TableHead>Unidade</TableHead>}>
            <SortableHeader column="clinic" label="Unidade" />
          </Suspense>
          <Suspense fallback={<TableHead>Semanas</TableHead>}>
            <SortableHeader column="weeksElapsed" label="Semanas" />
          </Suspense>
          <Suspense fallback={<TableHead>mg Restantes</TableHead>}>
            <SortableHeader column="mgRemaining" label="mg Restantes" />
          </Suspense>
          <Suspense fallback={<TableHead>Proxima Aplicacao</TableHead>}>
            <SortableHeader column="nextApplicationDate" label="Proxima Aplicacao" />
          </Suspense>
          <Suspense fallback={<TableHead>Status</TableHead>}>
            <SortableHeader column="status" label="Status" />
          </Suspense>
          <TableHead>Alertas</TableHead>
          <TableHead className="w-[70px]">Acao</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => {
          const totalWeeks = patient.packageTemplate.durationWeeks;
          const weeksPercent = totalWeeks > 0
            ? (patient.metrics.weeksElapsed / totalWeeks) * 100
            : 0;

          const totalMg =
            patient.metrics.mgAppliedTotal +
            patient.metrics.mgRemaining -
            patient.metrics.mgAdjusted;
          const mgPercent = totalMg > 0
            ? (patient.metrics.mgRemaining / totalMg) * 100
            : 0;

          const mgBarColor =
            patient.metrics.mgRemaining <= 10
              ? "[&>div]:bg-red-500"
              : patient.metrics.mgRemaining <= 20
              ? "[&>div]:bg-yellow-500"
              : "[&>div]:bg-green-500";

          return (
            <TableRow key={patient.id}>
              <TableCell>
                <Link
                  href={`/patients/${patient.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {patient.fullName}
                </Link>
              </TableCell>
              <TableCell>{patient.clinic.name}</TableCell>
              <TableCell>
                <div>
                  {patient.metrics.weeksElapsed}/{totalWeeks}
                </div>
                <InlineProgress value={weeksPercent} className="h-1.5 mt-1 w-16" />
              </TableCell>
              <TableCell>
                <div>
                  <span
                    className={
                      patient.metrics.mgRemaining <= 10
                        ? "text-red-600 font-semibold"
                        : patient.metrics.mgRemaining <= 20
                        ? "text-yellow-600 font-semibold"
                        : ""
                    }
                  >
                    {patient.metrics.mgRemaining.toFixed(1)}mg
                  </span>
                </div>
                <InlineProgress
                  value={mgPercent}
                  className={`h-1.5 mt-1 w-16 ${mgBarColor}`}
                />
              </TableCell>
              <TableCell>
                {patient.metrics.nextApplicationDate
                  ? formatDate(patient.metrics.nextApplicationDate)
                  : "-"}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariants[patient.status]}>
                  {statusLabels[patient.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {patient.metrics.alerts.map((alert, i) => (
                    <Badge
                      key={i}
                      variant={getAlertSeverityVariant(alert.severity)}
                      className="text-xs"
                    >
                      {alert.type === "STOCK_LOW" && "Estoque"}
                      {alert.type === "MEDICATION_ENDING" && "Medicacao"}
                      {alert.type === "RETURN_PENDING" && "Retorno"}
                      {alert.type === "PACKAGE_ENDING" && "Pacote"}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                {patient.status === "ACTIVE" && (
                  <QuickApplyDialog
                    patientId={patient.id}
                    patientName={patient.fullName}
                    currentDoseMg={patient.metrics.currentIndication?.doseMg}
                  />
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
