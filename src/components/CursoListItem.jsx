import { Link } from 'react-router-dom';
import { BookOpenIcon, ClockIcon, BoltIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

// Card em formato de lista (imagem à esquerda, conteúdo à direita) — usado
// só na listagem de busca de cursos. Mantém a mesma identidade visual do
// CursoCard em grade, mas em layout horizontal para leitura mais rápida.
export default function CursoListItem({ curso }) {
  return (
    <Link
      to={`/cursos/${curso.id}`}
      className="flex flex-col sm:flex-row gap-3 sm:gap-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-3 sm:p-4 group"
    >
      {/* Imagem — quadrada, fixa à esquerda no desktop, em cima no mobile */}
      <div className="relative w-full sm:w-[150px] md:w-[180px] aspect-square shrink-0 rounded-xl overflow-hidden bg-gray-900">
        {curso.imagem_url ? (
          <img
            src={curso.imagem_url}
            alt={curso.titulo}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <BookOpenIcon className="w-10 h-10" />
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
          <span className="absolute top-3 right-3 bg-[#cd146e] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
            {curso.categoria}
          </span>
        )}
      </div>

      {/* Conteúdo — ocupa o restante da largura */}
      <div className="flex flex-col flex-1 min-w-0 justify-center">
        <h3 className="text-base sm:text-lg font-black text-gray-900 uppercase leading-snug mb-1.5 line-clamp-2">
          {curso.titulo}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2">
          {curso.descricao}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {curso.duracao && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[11px] font-bold px-2.5 py-1.5 rounded-full">
              <ClockIcon className="w-3.5 h-3.5" /> {curso.duracao}
            </span>
          )}
          {curso.carga_horaria && (
            <span className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 text-[11px] font-bold px-2.5 py-1.5 rounded-full">
              <BoltIcon className="w-3.5 h-3.5" /> {curso.carga_horaria}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 text-[11px] font-bold px-2.5 py-1.5 rounded-full">
            <BookOpenIcon className="w-3.5 h-3.5" /> EAD
          </span>
        </div>

        <span className="mt-4 w-full sm:w-fit inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#cd146e] to-[#a61058] group-hover:from-[#a61058] group-hover:to-[#8a0d49] text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-full shadow-md transition-all group-hover:gap-3">
          Ver Detalhes <ArrowRightIcon className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
