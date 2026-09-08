import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CursoCard from '../components/CursoCard';
import CtaWhatsapp from '../components/CtaWhatsapp';
import { supabase } from '../supabaseClient';
import { listaCursosGiga } from './cursosData';
import imagemFundo from '../assets/imghero.webp';

const WHATSAPP_NUMERO = '5527998392172';

// Ordem de exibição/filtro desejada: Técnicos > Tecnólogos > Profissionalizantes (demais categorias vêm depois, em ordem alfabética)
const ORDEM_CATEGORIAS = [
  'técnicos',
  'tecnólogos',
  'profissionalizantes avançados',
  'profissionalizantes comuns',
  'profissionalizantes premium',
];

function getOrdemCategoria(nomeCategoria) {
  const indice = ORDEM_CATEGORIAS.indexOf((nomeCategoria || '').trim().toLowerCase());
  return indice === -1 ? ORDEM_CATEGORIAS.length : indice;
}

// A carga horária vem em formatos diferentes ("1600" no admin, "300h" na
// lista fixa). Normaliza tudo para "1600h" e assim os filtros batem.
function normalizarCarga(valor) {
  const texto = String(valor ?? '').trim();
  if (!texto) return '';
  const numero = texto.match(/\d+/);
  return numero ? `${numero[0]}h` : texto;
}

function normalizarDuracao(valor) {
  return String(valor ?? '').trim();
}

// Seção recolhível da barra lateral de filtros
function SecaoFiltro({ titulo, aberta, onToggle, children }) {
  return (
    <div className="border-b border-gray-200 py-[18px]">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left cursor-pointer group"
      >
        <span className="text-[17px] font-bold text-[#1a103c] group-hover:text-[#cd146e] transition-colors">
          {titulo}
        </span>
        <svg
          className={`w-[18px] h-[18px] text-gray-400 transition-transform duration-200 ${aberta ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {aberta && <div className="mt-4 flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">{children}</div>}
    </div>
  );
}

function OpcaoCheckbox({ label, marcada, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={marcada}
        onChange={onChange}
        className="w-[18px] h-[18px] rounded border-gray-300 accent-[#cd146e] cursor-pointer shrink-0"
      />
      <span className="text-[14.5px] text-gray-600 group-hover:text-[#cd146e] transition-colors capitalize leading-snug">
        {label}
      </span>
    </label>
  );
}

// Hero padrão da página /cursos (catálogo completo). As páginas por tipo
// (Técnicos, Tecnólogos, Profissionalizantes) passam a sua própria hero.
const HERO_PADRAO = {
  tag: 'Catálogo de Cursos',
  tituloInicio: 'Nossos ',
  tituloDestaque: 'Cursos',
  descricaoInicio: 'Explore nosso catálogo completo e encontre o curso ideal para ',
  descricaoDestaque: 'transformar sua carreira.',
  imagem: imagemFundo,
};

export default function ListaCursos({
  hero = HERO_PADRAO,
  // Lista de categorias exibidas nesta página (null = todas).
  categoriasPermitidas = null,
  // Filtro de categoria: usado só na página de Profissionalizantes, para
  // separar entre comuns, avançados e premium.
  mostrarFiltroCategoria = false,
  tituloListagem = 'TODOS OS CURSOS',
}) {
  const [searchParams] = useSearchParams();
  const [pesquisa, setPesquisa] = useState(() => searchParams.get('busca') || '');

  // Filtros da barra lateral (múltipla escolha em cada seção)
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [duracoesSelecionadas, setDuracoesSelecionadas] = useState([]);
  const [cargasSelecionadas, setCargasSelecionadas] = useState([]);

  // Seções abertas/fechadas e a barra lateral no mobile
  const [secoesAbertas, setSecoesAbertas] = useState({ categoria: true, duracao: true, carga: true });
  const [filtrosMobileAbertos, setFiltrosMobileAbertos] = useState(false);

  const alternarSecao = (chave) =>
    setSecoesAbertas((atual) => ({ ...atual, [chave]: !atual[chave] }));

  // Marca/desmarca um valor dentro de uma seção de filtro
  const alternarValor = (setLista) => (valor) =>
    setLista((atual) => (atual.includes(valor) ? atual.filter((v) => v !== valor) : [...atual, valor]));

  const alternarCategoria = alternarValor(setCategoriasSelecionadas);
  const alternarDuracao = alternarValor(setDuracoesSelecionadas);
  const alternarCarga = alternarValor(setCargasSelecionadas);

  const limparFiltros = () => {
    setCategoriasSelecionadas([]);
    setDuracoesSelecionadas([]);
    setCargasSelecionadas([]);
  };

  const totalFiltrosAtivos =
    categoriasSelecionadas.length + duracoesSelecionadas.length + cargasSelecionadas.length;


  // Cursos cadastrados pelo admin (Supabase), exibidos em card com página de detalhe
  const [cursosCadastrados, setCursosCadastrados] = useState([]);
  // Categorias cadastradas pelo admin (Supabase) — usadas para montar as abas de filtro
  const [categoriasDb, setCategoriasDb] = useState([]);

  useEffect(() => {
    async function buscarCursosCadastrados() {
      try {
        const { data, error } = await supabase
          .from('cursos_cadastrados')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setCursosCadastrados(data || []);
      } catch (err) {
        console.error('Erro ao buscar cursos cadastrados:', err);
      }
    }
    async function buscarCategorias() {
      try {
        const { data, error } = await supabase.from('categorias').select('*');
        if (error) throw error;
        setCategoriasDb(data || []);
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      }
    }
    buscarCursosCadastrados();
    buscarCategorias();
  }, []);

  // Proteção contra dados vazios
  const dadosCursos = Array.isArray(listaCursosGiga) ? listaCursosGiga : [];

  // Quando a página é de um tipo específico (Técnicos, Tecnólogos...), só as
  // categorias daquele tipo entram na listagem e nos filtros.
  const categoriaPermitida = (nomeCategoria) => {
    if (!categoriasPermitidas) return true;
    const chave = (nomeCategoria || '').trim().toLowerCase();
    return categoriasPermitidas.some((c) => c.trim().toLowerCase() === chave);
  };

  // Opções de categoria: começa com as categorias fixas de sempre e soma
  // automaticamente qualquer categoria nova cadastrada pelo admin (tabela
  // "categorias") ou já usada em algum curso cadastrado — sem precisar
  // mexer no código toda vez que uma categoria nova é criada.
  const categoriasFiltro = useMemo(() => {
    const fixas = [
      'Profissionalizantes premium',
      'Profissionalizantes comuns',
      'Profissionalizantes avançados',
      'Técnicos',
    ];
    const doBanco = categoriasDb.map((c) => c.nome).filter(Boolean);
    const dosCursosCadastrados = cursosCadastrados.map((c) => c.categoria).filter(Boolean);

    const vistas = new Map();
    for (const nome of [...fixas, ...doBanco, ...dosCursosCadastrados]) {
      const chave = nome.trim().toLowerCase();
      if (!vistas.has(chave)) vistas.set(chave, nome.trim());
    }

    const ordenadas = Array.from(vistas.values()).sort((a, b) => {
      const ordemA = getOrdemCategoria(a);
      const ordemB = getOrdemCategoria(b);
      if (ordemA !== ordemB) return ordemA - ordemB;
      return a.localeCompare(b, 'pt-BR');
    });

    return ordenadas.filter((nome) => {
      if (!categoriasPermitidas) return true;
      const chave = nome.trim().toLowerCase();
      return categoriasPermitidas.some((c) => c.trim().toLowerCase() === chave);
    });
  }, [categoriasDb, cursosCadastrados, categoriasPermitidas]);

  // Opções de Duração e Carga horária montadas a partir dos próprios dados,
  // para não precisar manter listas fixas no código.
  const opcoesDuracao = useMemo(() => {
    const vistas = new Map();
    for (const curso of cursosCadastrados) {
      if (!categoriaPermitida(curso.categoria)) continue;
      const valor = normalizarDuracao(curso.duracao);
      if (!valor) continue;
      const chave = valor.toLowerCase();
      if (!vistas.has(chave)) vistas.set(chave, valor);
    }
    return Array.from(vistas.values()).sort((a, b) =>
      a.localeCompare(b, 'pt-BR', { numeric: true })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursosCadastrados, categoriasPermitidas]);

  const opcoesCarga = useMemo(() => {
    const vistas = new Set();
    for (const curso of cursosCadastrados) {
      if (!categoriaPermitida(curso.categoria)) continue;
      const valor = normalizarCarga(curso.carga_horaria);
      if (valor) vistas.add(valor);
    }
    for (const curso of dadosCursos) {
      if (!curso || !categoriaPermitida(curso.categoriaNome)) continue;
      const valor = normalizarCarga(curso.horas);
      if (valor) vistas.add(valor);
    }
    return Array.from(vistas).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursosCadastrados, dadosCursos, categoriasPermitidas]);

  // Um curso passa no filtro quando bate em TODAS as seções marcadas
  // (dentro de cada seção, os valores marcados funcionam como "ou").
  const passaNosFiltros = ({ categoria, duracao, carga }) => {
    const cat = (categoria || '').trim().toLowerCase();
    if (!categoriaPermitida(categoria)) return false;
    if (categoriasSelecionadas.length > 0 && !categoriasSelecionadas.includes(cat)) return false;
    if (duracoesSelecionadas.length > 0 && !duracoesSelecionadas.includes((duracao || '').toLowerCase())) return false;
    if (cargasSelecionadas.length > 0 && !cargasSelecionadas.includes(carga || '')) return false;
    return true;
  };

  // Lista fixa (cursosData) — não tem duração cadastrada
  const cursosFiltrados = dadosCursos.filter((curso) => {
    if (!curso) return false;
    const nomeCurso = curso.nome || curso.titulo || "";
    if (!nomeCurso.toLowerCase().includes(pesquisa.toLowerCase())) return false;

    return passaNosFiltros({
      categoria: curso.categoriaNome,
      duracao: '',
      carga: normalizarCarga(curso.horas),
    });
  }).sort((a, b) => getOrdemCategoria(a.categoriaNome) - getOrdemCategoria(b.categoriaNome));

  // Cursos cadastrados pelo admin, com a mesma busca e os mesmos filtros
  const cursosCadastradosFiltrados = cursosCadastrados.filter((curso) => {
    const nomeCurso = curso.titulo || "";
    if (!nomeCurso.toLowerCase().includes(pesquisa.toLowerCase())) return false;

    return passaNosFiltros({
      categoria: curso.categoria,
      duracao: normalizarDuracao(curso.duracao),
      carga: normalizarCarga(curso.carga_horaria),
    });
  }).sort((a, b) => getOrdemCategoria(a.categoria) - getOrdemCategoria(b.categoria));

  const totalCursosEncontrados = cursosCadastradosFiltrados.length + cursosFiltrados.length;

  return (
    <div className="w-full min-h-screen bg-[#fafafa] text-gray-900 antialiased pb-20 flex flex-col">
      <Navbar />

      {/* 1. HERO — faixa de imagem (o título fica logo abaixo, junto do conteúdo) */}
      <div
        className="w-full bg-cover bg-center border-b border-gray-100 min-h-[420px] md:min-h-[480px]"
        style={{ backgroundImage: `url(${hero.imagem || imagemFundo})` }}
        role="presentation"
      />

      {/* 2. TÍTULO DA PÁGINA (abaixo da hero, logo acima dos filtros e cursos) */}
      <div className="max-w-[1440px] w-full mx-auto px-6 mt-10">
        {hero.tag && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white shadow-sm border border-gray-100 rounded-xl mb-4">
            <svg className="w-3.5 h-3.5 text-[#cd146e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-[10px] font-extrabold text-[#cd146e] tracking-wider uppercase">
              {hero.tag}
            </span>
          </div>
        )}

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1a103c] tracking-tight">
          {hero.tituloInicio}<span className="text-[#cd146e]">{hero.tituloDestaque}</span>
        </h1>

        {(hero.descricaoInicio || hero.descricaoDestaque) && (
          <p className="text-gray-500 text-sm md:text-base font-medium max-w-xl mt-3 leading-relaxed">
            {hero.descricaoInicio}
            <span className="text-[#cd146e] font-bold">{hero.descricaoDestaque}</span>
          </p>
        )}
      </div>

      {/* 3. FILTROS (BARRA LATERAL) + CONTEÚDO */}
      <div className="max-w-[1440px] w-full mx-auto px-6 mt-8 flex flex-col lg:flex-row gap-8 lg:gap-10">

        {/* --- BARRA LATERAL DE FILTROS --- */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5">
              <svg className="w-6 h-6 text-[#1a103c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M7 12h10M11 18h2" />
              </svg>
              <h2 className="text-xl font-bold text-[#1a103c]">Filtrar</h2>
              {totalFiltrosAtivos > 0 && (
                <span className="bg-[#cd146e] text-white text-[11px] font-black w-5.5 h-5.5 rounded-full flex items-center justify-center">
                  {totalFiltrosAtivos}
                </span>
              )}
            </div>

            {/* No mobile os filtros ficam recolhidos atrás deste botão */}
            <button
              type="button"
              onClick={() => setFiltrosMobileAbertos((v) => !v)}
              className="lg:hidden text-xs font-bold text-[#cd146e] cursor-pointer px-3 py-1.5 rounded-full border border-[#cd146e]/30"
            >
              {filtrosMobileAbertos ? 'Fechar' : 'Abrir filtros'}
            </button>
          </div>

          <div className={`${filtrosMobileAbertos ? 'block' : 'hidden'} lg:block`}>
            {totalFiltrosAtivos > 0 && (
              <button
                type="button"
                onClick={limparFiltros}
                className="text-xs font-bold text-gray-500 hover:text-[#cd146e] transition-colors cursor-pointer"
              >
                Limpar filtros
              </button>
            )}

            {mostrarFiltroCategoria && categoriasFiltro.length > 0 && (
              <SecaoFiltro
                titulo="Categoria"
                aberta={secoesAbertas.categoria}
                onToggle={() => alternarSecao('categoria')}
              >
                {categoriasFiltro.map((cat) => (
                  <OpcaoCheckbox
                    key={`cat-${cat}`}
                    // A página já se chama "Profissionalizantes": no rótulo
                    // fica só a faixa (Comuns, Avançados, Premium).
                    label={cat.replace(/^profissionalizantes\s+/i, '')}
                    marcada={categoriasSelecionadas.includes(cat.toLowerCase())}
                    onChange={() => alternarCategoria(cat.toLowerCase())}
                  />
                ))}
              </SecaoFiltro>
            )}

            {opcoesDuracao.length > 0 && (
              <SecaoFiltro
                titulo="Duração"
                aberta={secoesAbertas.duracao}
                onToggle={() => alternarSecao('duracao')}
              >
                {opcoesDuracao.map((dur) => (
                  <OpcaoCheckbox
                    key={`dur-${dur}`}
                    label={dur}
                    marcada={duracoesSelecionadas.includes(dur.toLowerCase())}
                    onChange={() => alternarDuracao(dur.toLowerCase())}
                  />
                ))}
              </SecaoFiltro>
            )}

            {opcoesCarga.length > 0 && (
              <SecaoFiltro
                titulo="Carga horária"
                aberta={secoesAbertas.carga}
                onToggle={() => alternarSecao('carga')}
              >
                {opcoesCarga.map((carga) => (
                  <OpcaoCheckbox
                    key={`carga-${carga}`}
                    label={carga}
                    marcada={cargasSelecionadas.includes(carga)}
                    onChange={() => alternarCarga(carga)}
                  />
                ))}
              </SecaoFiltro>
            )}
          </div>
        </aside>

        {/* --- CONTEÚDO --- */}
        <div className="flex-1 min-w-0">

          {/* Barra de Pesquisa */}
          <div className="flex justify-end mb-6">
            <div className="w-full sm:w-96 flex items-center bg-white rounded-full border border-gray-200 shadow-sm focus-within:border-[#cd146e] transition-colors">
              <input
                type="text"
                placeholder="Procure o curso ideal para você!"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                className="w-full bg-transparent text-[14.5px] text-gray-700 placeholder-gray-500 pl-6 pr-2 py-3.5 focus:outline-none font-medium rounded-full"
              />
              <span className="pr-6 text-gray-700 shrink-0">
                <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
          </div>
        {/* Quantidade Encontrada */}
        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold mb-5 uppercase tracking-wider">
          <svg className="w-4 h-4 text-[#cd146e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span className="text-[#cd146e] font-extrabold">{totalCursosEncontrados}</span> cursos encontrados
        </div>

        {/* Cursos cadastrados pelo admin, em grade de cards */}
        {cursosCadastradosFiltrados.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
            {cursosCadastradosFiltrados.map((curso) => (
              <CursoCard key={curso.id} curso={curso} />
            ))}
          </div>
        )}

        {/* Nas páginas por tipo, se nada foi encontrado, avisa em vez de mostrar a tabela vazia */}
        {categoriasPermitidas && totalCursosEncontrados === 0 && (
          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-sm font-bold text-gray-400 mb-10">
            Nenhum curso encontrado nesta categoria.
          </div>
        )}

        {/* 3. LISTAGEM DE CURSOS (lista estática) */}
        {(cursosFiltrados.length > 0 || !categoriasPermitidas) && (
        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10">
          
          {/* Header da tabela com o Degradê Triplo perfeito (Rosa -> Roxo -> Azul) */}
          <div className="bg-gradient-to-r from-[#d9197a] via-[#8b249e] to-[#2c3fc6] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <h2 className="font-extrabold text-xs tracking-wider uppercase">
                {tituloListagem}
              </h2>
            </div>
            <div className="bg-white/20 px-4 py-1 rounded-full backdrop-blur-sm">
              <span className="text-white text-xs font-bold">{cursosFiltrados.length} cursos</span>
            </div>
          </div>

          {/* Listagem com Scroll Interno */}
          <div className="flex flex-col max-h-[750px] overflow-y-auto bg-white md:divide-y md:divide-gray-100">
            {cursosFiltrados.length === 0 ? (
              <div className="p-12 text-center text-sm font-bold text-gray-400">
                Nenhum curso corresponde à sua busca.
              </div>
            ) : (
              cursosFiltrados.map((curso, index) => {
                const nomeItem = curso.nome || curso.titulo || "Curso sem nome";
                const horasItem = curso.horas || curso.duracao || "N/A";

                // Exibe o ID do curso vindo do banco ou gera uma numeração sequencial
                const numeroFormatado = curso.id || String(index + 1).padStart(2, '0');

                return (
                  <div
                    key={`linha-curso-${curso.id ?? index}-${index}`}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between py-2.5 px-3 md:py-4 md:px-6 mx-2 my-1 md:mx-0 md:my-0 rounded-xl md:rounded-none border border-gray-100 md:border-0 bg-white hover:bg-gray-50/50 transition-colors gap-1.5 md:gap-0"
                  >
                    {/* Numeração em Destaque Rosa + Título Escuro */}
                    <div className="flex items-center gap-2.5 md:gap-4 flex-1 min-w-0">
                      <span className="text-[#cd146e] font-extrabold text-xs md:text-sm w-7 md:w-10 text-center shrink-0">
                        {numeroFormatado}
                      </span>
                      <h3 className="text-[11px] md:text-sm font-extrabold text-[#1a103c] uppercase tracking-wide leading-tight truncate">
                        {nomeItem}
                      </h3>
                    </div>

                    {/* Lado Direito: Horas e Ação */}
                    <div className="flex items-center justify-between w-full md:w-auto md:gap-4 ml-0 md:ml-6 shrink-0">

                      {/* Badge das Horas (Roxo claro) */}
                      <span className="text-[#7c3aed] font-bold text-[9px] md:text-[10px] bg-[#f3e8ff] px-2 py-0.5 md:px-2.5 md:py-1 rounded whitespace-nowrap">
                        {typeof horasItem === 'number' ? `${horasItem}H` : String(horasItem).toUpperCase()}
                      </span>

                      {/* Matrícula direto pelo WhatsApp */}
                      <a
                        href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(`Olá! Quero garantir minha vaga no curso ${nomeItem}.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 md:px-4 md:py-2 rounded font-bold transition-all flex items-center justify-center gap-1.5 md:gap-2 cursor-pointer shrink-0 shadow-sm active:scale-95 bg-[#cd146e] hover:bg-[#b0105e] text-white"
                      >
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="hidden md:inline text-[11px] font-extrabold uppercase tracking-wider">
                          MATRICULE-SE
                        </span>
                      </a>
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
  )}

        </div>
      </div>

      <CtaWhatsapp />
    </div>
  );
}