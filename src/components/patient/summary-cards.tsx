import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PatientMetrics } from "@/lib/patient-calculations";
import { formatDate } from "@/lib/utils";
import { Calendar, Pill, Stethoscope, TrendingUp } from "lucide-react";

interface SummaryCardsProps {
  metrics: PatientMetrics;
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Semanas</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.weeksElapsed}/{metrics.weeksElapsed + metrics.weeksRemaining}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.weeksRemaining > 0
              ? `${metrics.weeksRemaining} semana(s) restante(s)`
              : "Periodo encerrado"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Termino: {formatDate(metrics.expectedEndDate)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Medicacao</CardTitle>
          <Pill className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <span
              className={
                metrics.mgRemaining <= 10
                  ? "text-red-600"
                  : metrics.mgRemaining <= 20
                  ? "text-yellow-600"
                  : ""
              }
            >
              {metrics.mgRemaining.toFixed(1)}mg
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Aplicado: {metrics.mgAppliedTotal.toFixed(1)}mg
            {metrics.mgAdjusted !== 0 && (
              <> | Ajuste: {metrics.mgAdjusted > 0 ? "+" : ""}
              {metrics.mgAdjusted.toFixed(1)}mg</>
            )}
          </p>
          {metrics.currentIndication && (
            <p className="text-xs text-muted-foreground mt-1">
              Indicacao atual: {metrics.currentIndication.doseMg}mg a cada{" "}
              {metrics.currentIndication.frequencyDays} dias
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Consultas</CardTitle>
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm">Endocrino:</span>
              <Badge variant={metrics.endocrinoRemaining === 0 ? "success" : "secondary"}>
                {metrics.endocrinoCompleted}/
                {metrics.endocrinoCompleted + metrics.endocrinoRemaining}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Nutri:</span>
              <Badge variant={metrics.nutriRemaining === 0 ? "success" : "secondary"}>
                {metrics.nutriCompleted}/
                {metrics.nutriCompleted + metrics.nutriRemaining}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projecao</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {metrics.currentIndication ? (
            <>
              <div className="text-2xl font-bold">
                {metrics.estimatedApplicationsLeft} aplicacoes
              </div>
              <p className="text-xs text-muted-foreground">
                ~{metrics.estimatedDaysLeft} dias restantes
              </p>
              {metrics.nextApplicationDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Proxima: {formatDate(metrics.nextApplicationDate)}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma indicacao ativa
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
