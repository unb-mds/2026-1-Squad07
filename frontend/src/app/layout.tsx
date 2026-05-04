import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LegisQ - Análise Legislativa",
  description: "Plataforma de análise de qualidade de leis",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-br" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50`}>
        <header className="w-full h-16 bg-[#030213] text-white flex items-center px-8">
          <h1 className="text-xl font-bold">LegisQ</h1>
        </header>
        
        <main className="flex-1">
          {children}
        </main>

        <footer className="py-6 text-center text-slate-500 text-sm border-t border-slate-200">
          © 2026 LegisQ - Projeto UnB Gama
        </footer>
      </body>
    </html>
  );
}