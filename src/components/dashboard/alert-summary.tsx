import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import type { PatientWithMetrics } from "@/lib/queries/patient-with-metrics";
import { getAlertSeverityVariant } from "@/lib/patient-calculations";

interface AlertSummaryProps {
  patients: PatientWithMetrics[];
}

export function AlertSummary({ patients }: AlertSummaryProps) {
  const allAlerts = patients
    .filter((p) => p.status === "ACTIVE")
    .flatMap((p) =>
      p.metrics.alerts.map((alert) => ({
        ...alert,
        patientName: p.fullName,
        patientId: p.id,
      }))
    );

  const redAlerts = allAlerts.filter((a) => a.severity === "RED");
  const yellowAlerts = allAlerts.filter((a) => a.severity === "YELLOW");

  if (allAlerts.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Alertas ({allAlerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {redAlerts.map((alert, i) => (
            <div key={`red-${i}`} className="flex items-center gap-2 text-sm">
              <Badge variant={getAlertSeverityVariant(alert.severity)}>
                {alert.patientName}
              </Badge>
              <span>{alert.message}</span>
            </div>
          ))}
          {yellowAlerts.map((alert, i) => (
            <div key={`yellow-${i}`} className="flex items-center gap-2 text-sm">
              <Badge variant={getAlertSeverityVariant(alert.severity)}>
                {alert.patientName}
              </Badge>
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
