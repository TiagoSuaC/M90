import { Suspense } from "react";
import { getPatientsWithMetrics, getClinics } from "@/lib/queries/patient-with-metrics";
import { PatientTable } from "@/components/dashboard/patient-table";
import { AlertSummary } from "@/components/dashboard/alert-summary";
import { Filters } from "@/components/dashboard/filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserPlus, Download } from "lucide-react";

interface DashboardPageProps {
  searchParams: Promise<{
    clinicId?: string;
    status?: string;
    lowStock?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const [patients, clinics] = await Promise.all([
    getPatientsWithMetrics({
      clinicId: params.clinicId,
      status: params.status,
      lowStock: params.lowStock === "true",
    }),
    getClinics(),
  ]);

  const activeCount = patients.filter((p) => p.status === "ACTIVE").length;
  const totalAlerts = patients
    .filter((p) => p.status === "ACTIVE")
    .reduce((sum, p) => sum + p.metrics.alerts.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {activeCount} paciente(s) ativo(s) &middot; {totalAlerts} alerta(s)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/api/export/patients">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Link>
          </Button>
          <Button asChild>
            <Link href="/patients/new">
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Paciente
            </Link>
          </Button>
        </div>
      </div>

      <AlertSummary patients={patients} />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Pacientes</CardTitle>
            <Suspense>
              <Filters clinics={clinics.map((c) => ({ id: c.id, name: c.name }))} />
            </Suspense>
          </div>
        </CardHeader>
        <CardContent>
          <PatientTable patients={patients} />
        </CardContent>
      </Card>
    </div>
  );
}
