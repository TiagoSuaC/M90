import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create clinics
  const clinics = [
    { id: "clinic-01", name: "01 - CLÍNICA SC CRICIÚMA", city: "CRICIÚMA" },
    { id: "clinic-02", name: "02 - CLÍNICA SC CURITIBA", city: "CURITIBA" },
    { id: "clinic-03", name: "03 - CLÍNICA SC FLORIANÓPOLIS", city: "FLORIANÓPOLIS" },
    { id: "clinic-04", name: "04 - CLÍNICA SC BALNEÁRIO CAMBORIÚ", city: "BALNEÁRIO CAMBORIÚ" },
    { id: "clinic-06", name: "06 - CLÍNICA SC JOINVILLE", city: "JOINVILLE" },
  ];

  for (const clinic of clinics) {
    await prisma.clinic.upsert({
      where: { id: clinic.id },
      update: { name: clinic.name, city: clinic.city },
      create: clinic,
    });
  }

  // Create package template
  await prisma.packageTemplate.upsert({
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

  // Create users (all assigned to Florianópolis)
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
      clinicId: "clinic-03",
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
      clinicId: "clinic-03",
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
      clinicId: "clinic-03",
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
      clinicId: "clinic-03",
    },
  });

  console.log("Seed completed!");
  console.log("Users:");
  console.log("  admin@m90.com / admin123 (ADMIN)");
  console.log("  enfermagem@m90.com / user123 (NURSING)");
  console.log("  endocrino@m90.com / user123 (ENDOCRINO)");
  console.log("  nutri@m90.com / user123 (NUTRI)");
  console.log("Clinics: Criciúma, Curitiba, Florianópolis, Balneário Camboriú, Joinville");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
