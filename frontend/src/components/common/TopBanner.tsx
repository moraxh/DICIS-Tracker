import { Github } from "lucide-react";

export default function TopBanner() {
  return (
    <div className="w-full bg-zinc-100 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10">
      <div className="w-full max-w-6xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <p className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400">
          <span className="font-semibold text-amber-600 dark:text-amber-500">
            Aviso:
          </span>{" "}
          Proyecto estudiantil no oficial de la UG. Los datos son extraídos
          automáticamente y pueden contener errores u omisiones.
        </p>
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-2 shrink-0 w-full sm:w-auto mt-1 sm:mt-0">
          <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium whitespace-nowrap">
            Creado por:
          </span>
          <a
            href="https://github.com/moraxh"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Jorge Mora</span>
          </a>
          <a
            href="https://github.com/HadassahGarcia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Hadassah Garcia</span>
          </a>
        </div>
      </div>
    </div>
  );
}
