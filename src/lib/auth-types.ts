import { type Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role?: Role;
    clinicId?: string | null;
    clinicName?: string | null;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      clinicId: string | null;
      clinicName: string | null;
    };
  }
}
