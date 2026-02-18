import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, Pill, Stethoscope } from "lucide-react";
import type { PatientWithMetrics } from "@/lib/queries/patient-with-metrics";

interface StatsCardsProps {
  patients: PatientWithMetrics[];
}

export function StatsCards({ patients }: StatsCardsProps) {
  const active = patients.filter((p) => p.status === "ACTIVE");
  const activeCount = active.length;

  const allAlerts = active.flatMap((p) => p.metrics.alerts);
  const totalAlerts = allAlerts.length;
  const redAlerts = allAlerts.filter((a) => a.severity === "RED").length;
  const yellowAlerts = allAlerts.filter((a) => a.severity === "YELLOW").length;

  const lowStockCount = active.filter(
    (p) => p.metrics.mgRemaining <= 20
  ).length;

  const returnPendingCount = allAlerts.filter(
    (a) => a.type === "RETURN_PENDING"
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pacientes Ativos
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCount}</div>
          <p className="text-xs text-muted-foreground">
            {patients.length} total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAlerts}</div>
          <p className="text-xs text-muted-foreground">
            {redAlerts > 0 && (
              <span className="text-red-600">{redAlerts} critico(s)</span>
            )}
            {redAlerts > 0 && yellowAlerts > 0 && " · "}
            {yellowAlerts > 0 && (
              <span className="text-yellow-600">
                {yellowAlerts} atencao
              </span>
            )}
            {redAlerts === 0 && yellowAlerts === 0 && "Nenhum alerta"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
          <Pill className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lowStockCount}</div>
          <p className="text-xs text-muted-foreground">
            paciente(s) com {"\u2264"}20mg
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Consultas Pendentes
          </CardTitle>
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{returnPendingCount}</div>
          <p className="text-xs text-muted-foreground">
            retorno(s) pendente(s)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
