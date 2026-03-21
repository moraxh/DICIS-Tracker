import Image from "next/image";
import contributorsData from "@/data/contributors.json";

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-white/10 mt-12 bg-zinc-50/50 dark:bg-[#050505]">
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-32 flex flex-col sm:flex-row gap-12 justify-between">
        <div className="flex flex-col items-center sm:items-start gap-3 max-w-2xl">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Aviso Legal y de Uso
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl text-center sm:text-left text-balance leading-relaxed">
            La información expuesta en este sitio es de dominio público. Esta
            herramienta fue desarrollada de forma independiente con fines
            meramente informativos, buscando ser un recurso de apoyo para la
            comunidad estudiantil en la búsqueda de espacios y disponibilidad.
            No es una plataforma oficial y no pretende sustituir los medios de
            comunicación institucionales. Asimismo, la recolección de datos
            (scraping) de las fuentes originales se realiza en intervalos de
            tiempo muy amplios con el único fin de evitar cualquier tipo de
            saturación en los sistemas de la universidad.
          </p>
        </div>

        <div className="flex flex-col items-center sm:items-start gap-4">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Contribuidores del Proyecto
          </h3>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 max-w-[280px]">
            {contributorsData.map((username) => (
              <a
                key={username}
                href={`https://github.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                title={username}
                className="group relative w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-zinc-400 dark:hover:border-zinc-500 transition-all hover:scale-110 shadow-sm"
              >
                <Image
                  src={`https://github.com/${username}.png`}
                  alt={username}
                  fill
                  className="object-cover"
                  sizes="40px"
                  unoptimized
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
