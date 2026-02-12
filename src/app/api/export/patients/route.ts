import { auth } from "@/lib/auth";
import { getPatientsWithMetrics } from "@/lib/queries/patient-with-metrics";
import { formatDate } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const patients = await getPatientsWithMetrics();

  const headers = [
    "Nome",
    "Unidade",
    "Status",
    "Data Inicio",
    "Semanas",
    "mg Aplicados",
    "mg Restantes",
    "Indicacao Atual (mg)",
    "Frequencia (dias)",
    "Proxima Aplicacao",
    "Endocrino",
    "Nutri",
    "Alertas",
  ];

  const rows = patients.map((p) => [
    p.fullName,
    p.clinic.name,
    p.status,
    formatDate(p.startDate),
    `${p.metrics.weeksElapsed}/${p.metrics.weeksElapsed + p.metrics.weeksRemaining}`,
    p.metrics.mgAppliedTotal.toFixed(1),
    p.metrics.mgRemaining.toFixed(1),
    p.metrics.currentIndication?.doseMg.toString() || "",
    p.metrics.currentIndication?.frequencyDays.toString() || "",
    p.metrics.nextApplicationDate
      ? formatDate(p.metrics.nextApplicationDate)
      : "",
    `${p.metrics.endocrinoCompleted}/${p.metrics.endocrinoCompleted + p.metrics.endocrinoRemaining}`,
    `${p.metrics.nutriCompleted}/${p.metrics.nutriCompleted + p.metrics.nutriRemaining}`,
    p.metrics.alerts.map((a) => a.message).join("; "),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  // BOM for Excel UTF-8 compatibility
  const bom = "\uFEFF";

  return new Response(bom + csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pacientes-m90-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
