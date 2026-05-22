import { Suspense } from "react";
import { SearchPage } from "@/components/pages/SearchPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-500 sm:px-6">
          Carregando busca...
        </div>
      }
    >
      <SearchPage />
    </Suspense>
  );
}
