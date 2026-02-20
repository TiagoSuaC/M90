"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hash } from "bcryptjs";

const createUserSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Senha deve ter no minimo 6 caracteres"),
  role: z.enum(["ADMIN", "NURSING", "ENDOCRINO", "NUTRI"]),
  clinicId: z.string().optional(),
});

const updateUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Informe o nome"),
  email: z.string().email("Email invalido"),
  password: z.string().optional(),
  role: z.enum(["ADMIN", "NURSING", "ENDOCRINO", "NUTRI"]),
  clinicId: z.string().optional(),
});

export async function createUser(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { error: "Acesso restrito a administradores" };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = createUserSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { name, email, password, role, clinicId } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ja existe um usuario com este email" };
  }

  const passwordHash = await hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      clinicId: clinicId || null,
    },
  });

  revalidatePath("/users");
  return { success: true };
}

export async function updateUser(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { error: "Acesso restrito a administradores" };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = updateUserSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { id, name, email, password, role, clinicId } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Usuario nao encontrado" };
  }

  // Check email uniqueness (excluding current user)
  const emailTaken = await prisma.user.findFirst({
    where: { email, id: { not: id } },
  });
  if (emailTaken) {
    return { error: "Ja existe outro usuario com este email" };
  }

  const data: any = {
    name,
    email,
    role,
    clinicId: clinicId || null,
  };

  if (password && password.length > 0) {
    if (password.length < 6) {
      return { error: "Senha deve ter no minimo 6 caracteres" };
    }
    data.passwordHash = await hash(password, 10);
  }

  await prisma.user.update({ where: { id }, data });

  revalidatePath("/users");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { error: "Acesso restrito a administradores" };
  }

  if (session.user.id === userId) {
    return { error: "Voce nao pode excluir seu proprio usuario" };
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    return { error: "Usuario nao encontrado" };
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/users");
  return { success: true };
}
