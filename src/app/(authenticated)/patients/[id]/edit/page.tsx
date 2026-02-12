import { notFound } from "next/navigation";
import { getPatientById, getClinics, getPackageTemplates } from "@/lib/queries/patient-with-metrics";
import { PatientForm } from "@/components/patient/patient-form";

interface EditPatientPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPatientPage({ params }: EditPatientPageProps) {
  const { id } = await params;
  const [patient, clinics, packages] = await Promise.all([
    getPatientById(id),
    getClinics(),
    getPackageTemplates(),
  ]);

  if (!patient) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Editar Paciente</h1>
      <PatientForm
        clinics={clinics.map((c) => ({ id: c.id, name: c.name }))}
        packages={packages.map((p) => ({ id: p.id, name: p.name }))}
        patient={{
          id: patient.id,
          fullName: patient.fullName,
          clinicId: patient.clinicId,
          packageTemplateId: patient.packageTemplateId,
          startDate: patient.startDate,
          notes: patient.notes,
        }}
      />
    </div>
  );
}
