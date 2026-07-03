import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "CrivoAI - Monitoramento Legislativo",
  description: "Análise de qualidade legislativa com dados demonstrativos",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-br" className="h-full">
      <body
        className="min-h-full bg-background text-foreground antialiased" 
        suppressHydrationWarning
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}