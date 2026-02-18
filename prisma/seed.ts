import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create clinics
  const clinic1 = await prisma.clinic.upsert({
    where: { id: "clinic-sp" },
    update: {},
    create: {
      id: "clinic-sp",
      name: "Clinica SP Centro",
      city: "Sao Paulo",
    },
  });

  const clinic2 = await prisma.clinic.upsert({
    where: { id: "clinic-rj" },
    update: {},
    create: {
      id: "clinic-rj",
      name: "Clinica RJ Barra",
      city: "Rio de Janeiro",
    },
  });

  // Create package template
  const m90Package = await prisma.packageTemplate.upsert({
    where: { name: "M90" },
    update: {},
    create: {
      name: "M90",
      durationWeeks: 12,
      tirzepatidaTotalMg: 90,
      consultasEndocrinoTotal: 3,
      consultasNutriTotal: 2,
      active: true,
    },
  });

  // Create users
  const adminPassword = await hash("admin123", 10);
  const userPassword = await hash("user123", 10);

  await prisma.user.upsert({
    where: { email: "admin@m90.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@m90.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      clinicId: clinic1.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "enfermagem@m90.com" },
    update: {},
    create: {
      name: "Maria Enfermeira",
      email: "enfermagem@m90.com",
      passwordHash: userPassword,
      role: "NURSING",
      clinicId: clinic1.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "endocrino@m90.com" },
    update: {},
    create: {
      name: "Dr. Joao Endocrino",
      email: "endocrino@m90.com",
      passwordHash: userPassword,
      role: "ENDOCRINO",
      clinicId: clinic1.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "nutri@m90.com" },
    update: {},
    create: {
      name: "Dra. Ana Nutri",
      email: "nutri@m90.com",
      passwordHash: userPassword,
      role: "NUTRI",
      clinicId: clinic2.id,
    },
  });

  // Create demo patients
  const admin = await prisma.user.findUnique({
    where: { email: "admin@m90.com" },
  });

  const patient1 = await prisma.patient.upsert({
    where: { id: "patient-demo-1" },
    update: {},
    create: {
      id: "patient-demo-1",
      fullName: "Carlos Silva",
      contractCode: "CTR-2025-001",
      clinicId: clinic1.id,
      packageTemplateId: m90Package.id,
      startDate: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000), // 6 weeks ago
      status: "ACTIVE",
      createdById: admin!.id,
    },
  });

  // Indication for patient 1
  await prisma.medicalIndication.upsert({
    where: { id: "ind-demo-1a" },
    update: {},
    create: {
      id: "ind-demo-1a",
      patientId: patient1.id,
      startDate: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000),
      doseMgPerApplication: 2.5,
      frequencyDays: 7,
      createdById: admin!.id,
    },
  });

  await prisma.medicalIndication.upsert({
    where: { id: "ind-demo-1b" },
    update: {},
    create: {
      id: "ind-demo-1b",
      patientId: patient1.id,
      startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
      doseMgPerApplication: 5,
      frequencyDays: 7,
      notes: "Aumento de dose apos boa tolerancia",
      createdById: admin!.id,
    },
  });

  // Applications for patient 1
  for (let i = 0; i < 3; i++) {
    await prisma.application.upsert({
      where: { id: `app-demo-1-${i}` },
      update: {},
      create: {
        id: `app-demo-1-${i}`,
        patientId: patient1.id,
        applicationDate: new Date(
          Date.now() - (42 - i * 7) * 24 * 60 * 60 * 1000
        ),
        doseMg: 2.5,
        administeredBy: "Maria Enfermeira",
      },
    });
  }

  for (let i = 0; i < 2; i++) {
    await prisma.application.upsert({
      where: { id: `app-demo-1-5mg-${i}` },
      update: {},
      create: {
        id: `app-demo-1-5mg-${i}`,
        patientId: patient1.id,
        applicationDate: new Date(
          Date.now() - (21 - i * 7) * 24 * 60 * 60 * 1000
        ),
        doseMg: 5,
        administeredBy: "Maria Enfermeira",
      },
    });
  }

  // Consultations for patient 1
  await prisma.consultation.upsert({
    where: { id: "consult-demo-1" },
    update: {},
    create: {
      id: "consult-demo-1",
      patientId: patient1.id,
      type: "ENDOCRINO",
      consultationDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      professional: "Dr. Joao Endocrino",
      countsInPackage: true,
      createdById: admin!.id,
    },
  });

  await prisma.consultation.upsert({
    where: { id: "consult-demo-2" },
    update: {},
    create: {
      id: "consult-demo-2",
      patientId: patient1.id,
      type: "NUTRI",
      consultationDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      professional: "Dra. Ana Nutri",
      countsInPackage: true,
      createdById: admin!.id,
    },
  });

  // Measurements for patient 1
  await prisma.bodyMeasurement.upsert({
    where: { id: "meas-demo-1" },
    update: {},
    create: {
      id: "meas-demo-1",
      patientId: patient1.id,
      measurementDate: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000),
      weightKg: 95.5,
      fatPercentage: 32.0,
      leanMassKg: 65.0,
      createdById: admin!.id,
    },
  });

  await prisma.bodyMeasurement.upsert({
    where: { id: "meas-demo-2" },
    update: {},
    create: {
      id: "meas-demo-2",
      patientId: patient1.id,
      measurementDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      weightKg: 92.3,
      fatPercentage: 30.5,
      leanMassKg: 64.2,
      createdById: admin!.id,
    },
  });

  // Patient 2 - newer, low stock scenario
  const patient2 = await prisma.patient.upsert({
    where: { id: "patient-demo-2" },
    update: {},
    create: {
      id: "patient-demo-2",
      fullName: "Ana Paula Santos",
      contractCode: "CTR-2025-002",
      clinicId: clinic2.id,
      packageTemplateId: m90Package.id,
      startDate: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000), // 10 weeks ago
      status: "ACTIVE",
      createdById: admin!.id,
    },
  });

  await prisma.medicalIndication.upsert({
    where: { id: "ind-demo-2" },
    update: {},
    create: {
      id: "ind-demo-2",
      patientId: patient2.id,
      startDate: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
      doseMgPerApplication: 7.5,
      frequencyDays: 7,
      createdById: admin!.id,
    },
  });

  // Lots of applications to make stock low
  for (let i = 0; i < 10; i++) {
    await prisma.application.upsert({
      where: { id: `app-demo-2-${i}` },
      update: {},
      create: {
        id: `app-demo-2-${i}`,
        patientId: patient2.id,
        applicationDate: new Date(
          Date.now() - (70 - i * 7) * 24 * 60 * 60 * 1000
        ),
        doseMg: 7.5,
        administeredBy: "Maria Enfermeira",
      },
    });
  }

  // Patient 3 - completed
  await prisma.patient.upsert({
    where: { id: "patient-demo-3" },
    update: {},
    create: {
      id: "patient-demo-3",
      fullName: "Roberto Oliveira",
      contractCode: "CTR-2024-050",
      clinicId: clinic1.id,
      packageTemplateId: m90Package.id,
      startDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
      status: "COMPLETED",
      notes: "Tratamento concluido com sucesso",
      createdById: admin!.id,
    },
  });

  console.log("Seed completed!");
  console.log("Users:");
  console.log("  admin@m90.com / admin123 (ADMIN)");
  console.log("  enfermagem@m90.com / user123 (NURSING)");
  console.log("  endocrino@m90.com / user123 (ENDOCRINO)");
  console.log("  nutri@m90.com / user123 (NUTRI)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
