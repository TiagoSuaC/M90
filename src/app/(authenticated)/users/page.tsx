import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUsers } from "@/lib/queries/users";
import { getClinics } from "@/lib/queries/patient-with-metrics";
import { UsersManager } from "@/components/users/users-manager";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [users, clinics] = await Promise.all([getUsers(), getClinics()]);

  const serializedUsers = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    clinicId: u.clinicId,
    clinicName: u.clinic?.name ?? null,
  }));

  const serializedClinics = clinics.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gerenciar Usuarios</h1>
        <p className="text-muted-foreground">
          Cadastre, edite e gerencie os usuarios do sistema.
        </p>
      </div>
      <UsersManager
        users={serializedUsers}
        clinics={serializedClinics}
        currentUserId={session.user.id!}
      />
    </div>
  );
}
