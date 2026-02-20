import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Migração: Substituir clínicas de teste por unidades SC ===\n");

  // 1. Criar as 5 novas clínicas SC
  const newClinics = [
    { id: "clinic-01", name: "01 - CLÍNICA SC CRICIÚMA", city: "CRICIÚMA" },
    { id: "clinic-02", name: "02 - CLÍNICA SC CURITIBA", city: "CURITIBA" },
    { id: "clinic-03", name: "03 - CLÍNICA SC FLORIANÓPOLIS", city: "FLORIANÓPOLIS" },
    { id: "clinic-04", name: "04 - CLÍNICA SC BALNEÁRIO CAMBORIÚ", city: "BALNEÁRIO CAMBORIÚ" },
    { id: "clinic-06", name: "06 - CLÍNICA SC JOINVILLE", city: "JOINVILLE" },
  ];

  for (const clinic of newClinics) {
    await prisma.clinic.upsert({
      where: { id: clinic.id },
      update: { name: clinic.name, city: clinic.city },
      create: clinic,
    });
    console.log(`✓ Clínica criada/atualizada: ${clinic.name}`);
  }

  // 2. Deletar pacientes demo e seus dados relacionados
  const demoPatientIds = ["patient-demo-1", "patient-demo-2", "patient-demo-3"];

  for (const patientId of demoPatientIds) {
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      console.log(`⏭ Paciente demo ${patientId} não encontrado, pulando...`);
      continue;
    }

    // Delete related data in correct order (child records first)
    await prisma.application.deleteMany({ where: { patientId } });
    await prisma.medicalIndication.deleteMany({ where: { patientId } });
    await prisma.consultation.deleteMany({ where: { patientId } });
    await prisma.bodyMeasurement.deleteMany({ where: { patientId } });
    await prisma.stockAdjustment.deleteMany({ where: { patientId } });
    await prisma.patient.delete({ where: { id: patientId } });

    console.log(`✓ Paciente demo deletado: ${patient.fullName} (${patientId})`);
  }

  // 3. Reatribuir pacientes reais para clinic-03 (Florianópolis)
  const targetClinicId = "clinic-03";
  const oldClinicIds = ["clinic-sp", "clinic-rj"];

  const realPatients = await prisma.patient.findMany({
    where: { clinicId: { in: oldClinicIds } },
  });

  for (const patient of realPatients) {
    await prisma.patient.update({
      where: { id: patient.id },
      data: { clinicId: targetClinicId },
    });
    console.log(`✓ Paciente reatribuído para Florianópolis: ${patient.fullName}`);
  }

  // 4. Reatribuir usuários das clínicas de teste para clinic-03
  const usersToMove = await prisma.user.findMany({
    where: { clinicId: { in: oldClinicIds } },
  });

  for (const user of usersToMove) {
    await prisma.user.update({
      where: { id: user.id },
      data: { clinicId: targetClinicId },
    });
    console.log(`✓ Usuário reatribuído para Florianópolis: ${user.name} (${user.email})`);
  }

  // 5. Deletar clínicas de teste
  for (const clinicId of oldClinicIds) {
    const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
    if (!clinic) {
      console.log(`⏭ Clínica ${clinicId} não encontrada, pulando...`);
      continue;
    }

    await prisma.clinic.delete({ where: { id: clinicId } });
    console.log(`✓ Clínica de teste deletada: ${clinic.name} (${clinicId})`);
  }

  console.log("\n=== Migração concluída com sucesso! ===");
}

main()
  .catch((e) => {
    console.error("Erro na migração:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
