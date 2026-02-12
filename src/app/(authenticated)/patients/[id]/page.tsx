import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPatientWithMetrics } from "@/lib/queries/patient-with-metrics";
import { serialize } from "@/lib/serialize";
import { SummaryCards } from "@/components/patient/summary-cards";
import { AlertBadges } from "@/components/patient/alert-badges";
import { ApplicationsTab } from "@/components/patient/applications-tab";
import { IndicationsTab } from "@/components/patient/indications-tab";
import { ConsultationsTab } from "@/components/patient/consultations-tab";
import { MeasurementsTab } from "@/components/patient/measurements-tab";
import { StockAdjustmentTab } from "@/components/patient/stock-adjustment-tab";
import { PatientStatusSelect } from "@/components/patient/patient-status-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  COMPLETED: "Concluido",
  PAUSED: "Pausado",
  CANCELLED: "Cancelado",
};

interface PatientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientDetailPage({
  params,
}: PatientDetailPageProps) {
  const { id } = await params;
  const [patient, session] = await Promise.all([
    getPatientWithMetrics(id),
    auth(),
  ]);

  if (!patient) notFound();

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  // Serialize Prisma objects (Decimal -> number, Date -> string) for client components
  const applications = serialize(patient.applications) as any[];
  const indications = serialize(patient.indications) as any[];
  const consultations = serialize(patient.consultations) as any[];
  const measurements = serialize(patient.measurements) as any[];
  const stockAdjustments = serialize(patient.stockAdjustments) as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{patient.fullName}</h1>
            <Badge variant="outline">{statusLabels[patient.status]}</Badge>
          </div>
          <p className="text-muted-foreground">
            {patient.clinic.name} &middot; Pacote{" "}
            {patient.packageTemplate.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PatientStatusSelect
            patientId={patient.id}
            currentStatus={patient.status}
          />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/patients/${patient.id}/edit`}>
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <AlertBadges alerts={patient.metrics.alerts} />

      <SummaryCards metrics={patient.metrics} />

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="applications">Aplicacoes</TabsTrigger>
          <TabsTrigger value="indications">Indicacoes</TabsTrigger>
          <TabsTrigger value="consultations">Consultas</TabsTrigger>
          <TabsTrigger value="measurements">Pesagens</TabsTrigger>
          <TabsTrigger value="stock">Estoque</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <ApplicationsTab
            patientId={patient.id}
            applications={applications}
            currentDoseMg={patient.metrics.currentIndication?.doseMg}
          />
        </TabsContent>

        <TabsContent value="indications">
          <IndicationsTab
            patientId={patient.id}
            indications={indications}
          />
        </TabsContent>

        <TabsContent value="consultations">
          <ConsultationsTab
            patientId={patient.id}
            consultations={consultations}
          />
        </TabsContent>

        <TabsContent value="measurements">
          <MeasurementsTab
            patientId={patient.id}
            measurements={measurements}
          />
        </TabsContent>

        <TabsContent value="stock">
          <StockAdjustmentTab
            patientId={patient.id}
            adjustments={stockAdjustments}
            isAdmin={isAdmin}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
