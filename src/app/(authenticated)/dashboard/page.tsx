import { Suspense } from "react";
import { getPatientsWithMetrics, getClinics, type SortField, type SortOrder } from "@/lib/queries/patient-with-metrics";
import { PatientTable } from "@/components/dashboard/patient-table";
import { AlertSummary } from "@/components/dashboard/alert-summary";
import { StatsCards } from "@/components/dashboard/stats-cards";
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
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

const validSortFields = new Set(["fullName", "clinic", "weeksElapsed", "mgRemaining", "nextApplicationDate", "status"]);

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const sortBy = validSortFields.has(params.sortBy ?? "") ? (params.sortBy as SortField) : undefined;
  const sortOrder = params.sortOrder === "desc" ? "desc" : params.sortOrder === "asc" ? "asc" : undefined;

  const [patients, clinics] = await Promise.all([
    getPatientsWithMetrics({
      clinicId: params.clinicId,
      status: params.status,
      lowStock: params.lowStock === "true",
      search: params.search,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      sortBy,
      sortOrder,
    }),
    getClinics(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
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

      <StatsCards patients={patients} />

      <AlertSummary patients={patients} />

      <Card>
        <CardHeader className="pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Pacientes</CardTitle>
          </div>
          <Suspense>
            <Filters clinics={clinics.map((c) => ({ id: c.id, name: c.name }))} />
          </Suspense>
        </CardHeader>
        <CardContent>
          <PatientTable patients={patients} />
        </CardContent>
      </Card>
    </div>
  );
}
