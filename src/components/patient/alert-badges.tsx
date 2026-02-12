import { Badge } from "@/components/ui/badge";
import { getAlertSeverityVariant, type Alert } from "@/lib/patient-calculations";

interface AlertBadgesProps {
  alerts: Alert[];
}

export function AlertBadges({ alerts }: AlertBadgesProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {alerts.map((alert, i) => (
        <Badge key={i} variant={getAlertSeverityVariant(alert.severity)}>
          {alert.message}
        </Badge>
      ))}
    </div>
  );
}
