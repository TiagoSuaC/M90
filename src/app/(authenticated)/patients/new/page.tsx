import { getClinics, getPackageTemplates } from "@/lib/queries/patient-with-metrics";
import { PatientForm } from "@/components/patient/patient-form";

export default async function NewPatientPage() {
  const [clinics, packages] = await Promise.all([
    getClinics(),
    getPackageTemplates(),
  ]);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cadastrar Paciente</h1>
      <PatientForm
        clinics={clinics.map((c) => ({ id: c.id, name: c.name }))}
        packages={packages.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}
