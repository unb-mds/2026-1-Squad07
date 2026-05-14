"use client";
import { Search, FileText, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-800 mb-3">
          Análise de Qualidade Legislativa
        </h2>
        <p className="text-lg text-slate-600">
          Use IA e NLP para avaliar a legibilidade e ambiguidade de textos legislativos
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-slate-200 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-[#1e3a5f]" />
          <h3 className="text-2xl font-bold text-slate-800">Média Geral das Leis</h3>
        </div>
        <div className="text-6xl font-black text-[#1e3a5f]">89%</div>
      </div>

      <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-xl p-10 mb-8 border border-slate-200">
        <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          Pesquise uma Lei Existente
        </h3>
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            placeholder="Digite o número ou nome da lei..."
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-300 focus:border-[#2d5a8c] outline-none text-slate-800"
          />
          <button 
            onClick={() => router.push('/search')}
            className="bg-[#1e3a5f] text-white px-8 rounded-2xl font-bold"
          >
            Pesquisar
          </button>
        </div>
      </div>
    </div>
  );
}