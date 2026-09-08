import { Link } from 'react-router-dom';
import { BookOpenIcon, ClockIcon, BoltIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { certificadoraDaCategoria, certificadoPelaLatec } from '../utils/certificadoras';

export default function CursoCard({ curso }) {
  // Só os técnicos são certificados pela LATec; nos demais o selo SISTEC
  // passaria a ideia errada de que somos nós que certificamos.
  const certificadora = certificadoraDaCategoria(curso.categoria);
  const ehDaLatec = certificadoPelaLatec(curso.categoria);

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

        {curso.selo_mec && ehDaLatec && (
          <span className="absolute top-3 left-3 bg-white text-gray-900 text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <svg className="w-3 h-3 text-[#cd146e]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 1l2.39 4.84L18 6.91l-4 3.9.94 5.49L10 13.77l-4.94 2.53L6 10.81l-4-3.9 5.61-1.07L10 1z" />
            </svg>
            SISTEC
          </span>
        )}

        {curso.categoria && (
          <span className="absolute top-3 right-3 bg-[#cd146e] text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-md">
            {curso.categoria}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h4 className="text-[15px] font-black text-gray-900 mb-2 uppercase leading-snug line-clamp-2">{curso.titulo}</h4>
        <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2 mb-3.5">{curso.descricao}</p>

        <div className="flex flex-wrap gap-2 mb-5">
          {curso.duracao && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-1.5 rounded-full">
              <ClockIcon className="w-3 h-3" /> {curso.duracao}
            </span>
          )}
          {curso.carga_horaria && (
            <span className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 text-[10px] font-bold px-2.5 py-1.5 rounded-full">
              <BoltIcon className="w-3 h-3" /> {curso.carga_horaria}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 text-[10px] font-bold px-2.5 py-1.5 rounded-full">
            <BookOpenIcon className="w-3 h-3" /> EAD
          </span>
          {certificadora && (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1.5 rounded-full">
              Certificação: {certificadora}
            </span>
          )}
        </div>

        <span className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#cd146e] to-[#a61058] group-hover:from-[#a61058] group-hover:to-[#8a0d49] text-white font-black text-xs uppercase tracking-wider py-4 rounded-full shadow-md transition-all group-hover:gap-3">
          Ver Detalhes <ArrowRightIcon className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
