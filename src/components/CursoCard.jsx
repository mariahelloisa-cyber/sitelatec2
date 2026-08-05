import { Link } from 'react-router-dom';
import { BookOpenIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

function formatarPreco(valor) {
  return (valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CursoCard({ curso }) {
  return (
    <Link
      to={`/cursos/${curso.id}`}
      className="flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      <div className="relative w-full aspect-[16/10] shrink-0 overflow-hidden bg-gray-100">
        {curso.imagem_url ? (
          <img
            src={curso.imagem_url}
            alt={curso.titulo}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <BookOpenIcon className="w-10 h-10" />
          </div>
        )}

        {curso.selo_mec && (
          <span className="absolute top-3 left-3 bg-white text-gray-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
            <svg className="w-3 h-3 text-[#cd146e]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 1l2.39 4.84L18 6.91l-4 3.9.94 5.49L10 13.77l-4.94 2.53L6 10.81l-4-3.9 5.61-1.07L10 1z" />
            </svg>
            MEC
          </span>
        )}

        {curso.categoria && (
          <span className="absolute top-3 right-3 bg-[#cd146e] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            {curso.categoria}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h4 className="text-sm font-black text-gray-900 mb-1.5 uppercase leading-snug line-clamp-2">{curso.titulo}</h4>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{curso.descricao}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {curso.duracao && (
            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full">{curso.duracao}</span>
          )}
          {curso.carga_horaria && (
            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full">{curso.carga_horaria}</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 mt-auto">
          <span className="text-base font-black text-gray-900">R$ {formatarPreco(curso.preco)}</span>
          <span className="inline-flex items-center gap-1 text-xs font-black text-[#cd146e] uppercase group-hover:gap-2 transition-all">
            Ver mais <ArrowRightIcon className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
