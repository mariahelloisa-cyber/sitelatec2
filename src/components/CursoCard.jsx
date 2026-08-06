import { Link } from 'react-router-dom';
import { BookOpenIcon, ClockIcon, BoltIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function CursoCard({ curso }) {
  return (
    <Link
      to={`/cursos/${curso.id}`}
      className="flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      <div className="relative w-full aspect-[2/1] shrink-0 overflow-hidden bg-gray-900">
        {curso.imagem_url ? (
          <img
            src={curso.imagem_url}
            alt={curso.titulo}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <BookOpenIcon className="w-8 h-8" />
          </div>
        )}

        {curso.selo_mec && (
          <span className="absolute top-3 left-3 bg-white text-gray-900 text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <svg className="w-3 h-3 text-[#cd146e]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 1l2.39 4.84L18 6.91l-4 3.9.94 5.49L10 13.77l-4.94 2.53L6 10.81l-4-3.9 5.61-1.07L10 1z" />
            </svg>
            MEC
          </span>
        )}

        {curso.categoria && (
          <span className="absolute top-3 right-3 bg-[#cd146e] text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-md">
            {curso.categoria}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h4 className="text-sm font-black text-gray-900 mb-1.5 uppercase leading-snug line-clamp-2">{curso.titulo}</h4>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{curso.descricao}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {curso.duracao && (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[9px] font-bold px-2 py-1 rounded-full">
              <ClockIcon className="w-2.5 h-2.5" /> {curso.duracao}
            </span>
          )}
          {curso.carga_horaria && (
            <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 text-[9px] font-bold px-2 py-1 rounded-full">
              <BoltIcon className="w-2.5 h-2.5" /> {curso.carga_horaria}
            </span>
          )}
          <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 text-[9px] font-bold px-2 py-1 rounded-full">
            <BookOpenIcon className="w-2.5 h-2.5" /> EAD
          </span>
        </div>

        <span className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#cd146e] to-[#a61058] group-hover:from-[#a61058] group-hover:to-[#8a0d49] text-white font-black text-[11px] uppercase tracking-wider py-3.5 rounded-full shadow-md transition-all group-hover:gap-3">
          Ver Detalhes <ArrowRightIcon className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
