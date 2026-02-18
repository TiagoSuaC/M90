"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PatientMetrics } from "@/lib/patient-calculations";
import { formatDate } from "@/lib/utils";
import { Calendar, Pill, Stethoscope, TrendingUp } from "lucide-react";

interface SummaryCardsProps {
  metrics: PatientMetrics;
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
  const totalWeeks = metrics.weeksElapsed + metrics.weeksRemaining;
  const weeksPercent = totalWeeks > 0 ? (metrics.weeksElapsed / totalWeeks) * 100 : 0;

  const totalMg = metrics.mgAppliedTotal + metrics.mgRemaining - metrics.mgAdjusted;
  const mgPercent = totalMg > 0 ? (metrics.mgRemaining / totalMg) * 100 : 0;

  const mgBarColor =
    metrics.mgRemaining <= 10
      ? "[&>div]:bg-red-500"
      : metrics.mgRemaining <= 20
      ? "[&>div]:bg-yellow-500"
      : "[&>div]:bg-green-500";

  const endocrinoTotal = metrics.endocrinoCompleted + metrics.endocrinoRemaining;
  const endocrinoPercent = endocrinoTotal > 0 ? (metrics.endocrinoCompleted / endocrinoTotal) * 100 : 0;

  const nutriTotal = metrics.nutriCompleted + metrics.nutriRemaining;
  const nutriPercent = nutriTotal > 0 ? (metrics.nutriCompleted / nutriTotal) * 100 : 0;

  const daysColor =
    metrics.estimatedDaysLeft <= 7
      ? "text-red-600"
      : metrics.estimatedDaysLeft <= 14
      ? "text-yellow-600"
      : "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Semanas</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.weeksElapsed}/{totalWeeks}
          </div>
          <Progress value={weeksPercent} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
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
          <Progress value={mgPercent} className={`h-2 mt-2 ${mgBarColor}`} />
          <p className="text-xs text-muted-foreground mt-2">
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
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Endocrino</span>
                <span className="text-muted-foreground">
                  {metrics.endocrinoCompleted}/{endocrinoTotal}
                </span>
              </div>
              <Progress
                value={endocrinoPercent}
                className={`h-2 ${metrics.endocrinoRemaining === 0 ? "[&>div]:bg-green-500" : ""}`}
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Nutri</span>
                <span className="text-muted-foreground">
                  {metrics.nutriCompleted}/{nutriTotal}
                </span>
              </div>
              <Progress
                value={nutriPercent}
                className={`h-2 ${metrics.nutriRemaining === 0 ? "[&>div]:bg-green-500" : ""}`}
              />
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
              <p className={`text-xs mt-1 ${daysColor || "text-muted-foreground"}`}>
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
