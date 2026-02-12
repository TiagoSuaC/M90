import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
          <TableHead>Paciente</TableHead>
          <TableHead>Unidade</TableHead>
          <TableHead>Semanas</TableHead>
          <TableHead>mg Restantes</TableHead>
          <TableHead>Proxima Aplicacao</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Alertas</TableHead>
          <TableHead className="w-[70px]">Acao</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
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
              {patient.metrics.weeksElapsed}/{patient.packageTemplate.durationWeeks}
            </TableCell>
            <TableCell>
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
        ))}
      </TableBody>
    </Table>
  );
}
