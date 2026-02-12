import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/lib/auth-types";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "M90 - Protocolo Tirzepatida",
  description: "Sistema de controle de pacotes de tratamento com Tirzepatida",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
