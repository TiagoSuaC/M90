import { prisma } from "@/lib/prisma";

export async function getUsers() {
  return prisma.user.findMany({
    include: { clinic: true },
    orderBy: { name: "asc" },
  });
}
