import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userRole = (session?.user as any)?.role as string | undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userRole={userRole} />
      <div className="md:pl-64">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
