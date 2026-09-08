import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logolatec.webp';

// Submenu que abre ao passar o cursor sobre "Cursos"
const SUBMENU_CURSOS = [
  { to: '/cursos/tecnicos', label: 'Técnicos' },
  { to: '/cursos/tecnologos', label: 'Tecnólogos' },
  { to: '/cursos/profissionalizantes', label: 'Profissionalizantes' },
];

const LINKS_NAV = [
  { to: '/', label: 'Início' },
  { to: '/sobre', label: 'Sobre Nós' },
  // "Cursos" não leva a lugar nenhum: só abre as três opções abaixo.
  { to: 'cursos', label: 'Cursos', submenu: SUBMENU_CURSOS },
  { to: '/blog', label: 'Blog' },
  { to: '/validacaoRastreio', label: 'Aproveitamento' },
  { to: '/vagas', label: 'Vagas' },
  { to: '/ouvidoria', label: 'Ouvidoria' },
];

// Lista do submenu com uma única "pílula" de destaque que desliza entre as
// opções e se ajusta à largura da palavra sob o cursor.
function SubmenuComPilula({ itens, aoNavegar }) {
  const [itemAtivo, setItemAtivo] = useState(null);
  const [pilula, setPilula] = useState(null);
  const [animar, setAnimar] = useState(false);
  const refsTexto = useRef([]);

  // Mede a palavra sob o cursor para a pílula assumir exatamente o tamanho dela
  useEffect(() => {
    if (itemAtivo === null) return;
    const alvo = refsTexto.current[itemAtivo];
    if (!alvo) return;
    setPilula({
      left: alvo.offsetLeft,
      top: alvo.offsetTop,
      width: alvo.offsetWidth,
      height: alvo.offsetHeight,
    });
  }, [itemAtivo]);

  // Só liga a transição depois da primeira medição, senão a pílula "voa"
  // do canto do menu na primeira vez que aparece.
  useEffect(() => {
    if (!pilula || animar) return;
    const frame = requestAnimationFrame(() => setAnimar(true));
    return () => cancelAnimationFrame(frame);
  }, [pilula, animar]);

  return (
    <div className="relative" onMouseLeave={() => setItemAtivo(null)}>
      {pilula && (
        <span
          aria-hidden="true"
          className={`absolute rounded-full bg-[#FDF2F7] pointer-events-none ${
            animar ? 'transition-all duration-300 ease-out' : ''
          }`}
          style={{
            left: pilula.left - 14,
            top: pilula.top - 7,
            width: pilula.width + 28,
            height: pilula.height + 14,
            opacity: itemAtivo === null ? 0 : 1,
          }}
        />
      )}

      {itens.map((sub, indice) => (
        <Link
          key={sub.to}
          to={sub.to}
          onMouseEnter={() => setItemAtivo(indice)}
          onFocus={() => setItemAtivo(indice)}
          onClick={aoNavegar}
          className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-[#cd146e] transition-colors duration-200"
        >
          <span ref={(el) => { refsTexto.current[indice] = el; }} className="relative z-10">
            {sub.label}
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);
  // Qual item do menu está com o submenu aberto (desktop: hover / mobile: clique)
  const [submenuAberto, setSubmenuAberto] = useState(null);

  return (
    <div className="w-full">
      {/* --- BARRA DE CONTATOS NO TOPO --- */}
      <div className="bg-[#cd146e] text-white py-2 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex gap-6">
            <span>Central do Aluno: (27) 99839-2172</span>
          </div>
        </div>
      </div>

      {/* --- NAVBAR PRINCIPAL --- */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <img className="h-14 w-auto" src={logo} alt="LATec" />
              </Link>
            </div>

            {/* Links das Abas */}
            <div className="hidden md:flex space-x-6 items-center">
              {LINKS_NAV.map((link) =>
                link.submenu ? (
                  // Item com submenu: abre ao passar o cursor (e some ao sair)
                  <div
                    key={link.to}
                    className="relative"
                    onMouseEnter={() => setSubmenuAberto(link.to)}
                    onMouseLeave={() => setSubmenuAberto(null)}
                  >
                    {/* Só abre as opções — não navega para lugar nenhum */}
                    <button
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={submenuAberto === link.to}
                      onClick={() => setSubmenuAberto(submenuAberto === link.to ? null : link.to)}
                      className="flex items-center gap-1 text-gray-700 hover:text-[#cd146e] font-medium text-sm transition-colors py-7 cursor-pointer"
                    >
                      {link.label}
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${submenuAberto === link.to ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {submenuAberto === link.to && (
                      <div className="absolute left-0 top-full w-max bg-white rounded-2xl shadow-[0_16px_40px_-8px_rgba(0,0,0,0.15)] border border-gray-100 p-3 z-50">
                        <SubmenuComPilula
                          itens={link.submenu}
                          aoNavegar={() => setSubmenuAberto(null)}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <Link key={link.to} to={link.to} className="text-gray-700 hover:text-[#cd146e] font-medium text-sm transition-colors">
                    {link.label}
                  </Link>
                )
              )}
            </div>

            {/* Botão Fale Conosco */}
            <div className="flex items-center gap-2 sm:gap-4">
              <a href="https://wa.me/5527998392172" target="_blank" rel="noreferrer" className="hidden sm:inline-flex items-center gap-2 bg-[#cd146e] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#9e1b7c] transition-all shadow-sm whitespace-nowrap">
                <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  {/* ponto central fixo */}
                  <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
                  {/* ondas internas */}
                  <path className="onda-sinal-interna" d="M8.5 8.5a5 5 0 000 7" />
                  <path className="onda-sinal-interna" d="M15.5 8.5a5 5 0 010 7" />
                  {/* ondas externas */}
                  <path className="onda-sinal-externa" d="M5.6 5.6a9 9 0 000 12.8" />
                  <path className="onda-sinal-externa" d="M18.4 5.6a9 9 0 010 12.8" />
                </svg>
                Falar com um Consultor
              </a>

              {/* ÍCONE DO FAQ */}
              <Link
                to="/faq"
                title="FAQ"
                className="hidden sm:flex p-2 text-gray-800 hover:text-black transition-colors items-center justify-center rounded-full hover:bg-gray-100 shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>

              {/* BOTÃO HAMBÚRGUER (MOBILE) */}
              <button
                onClick={() => setMenuAberto(true)}
                className="md:hidden p-2 text-gray-800 hover:text-black transition-colors flex items-center justify-center rounded-full hover:bg-gray-100 shrink-0"
                title="Abrir menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* --- SIDEBAR DE NAVEGAÇÃO (MOBILE) --- */}
      {menuAberto && (
        <div className="fixed inset-0 z-[100] flex justify-end md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMenuAberto(false)}
          />

          <div className="relative flex w-full max-w-xs flex-col bg-white h-full shadow-2xl animate-slide-in-right z-10 overflow-hidden text-left">
            <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
              <img className="h-10 w-auto" src={logo} alt="LATec" />
              <button onClick={() => setMenuAberto(false)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-4">
              {LINKS_NAV.map((link) =>
                link.submenu ? (
                  <div key={link.to}>
                    {/* Só expande as opções — não navega para lugar nenhum */}
                    <button
                      type="button"
                      aria-expanded={submenuAberto === link.to}
                      onClick={() => setSubmenuAberto(submenuAberto === link.to ? null : link.to)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-700 hover:bg-[#FDF2F7] hover:text-[#cd146e] font-semibold text-base transition-colors cursor-pointer"
                    >
                      {link.label}
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${submenuAberto === link.to ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {submenuAberto === link.to && (
                      <div className="pl-4">
                        {link.submenu.map((sub) => (
                          <Link
                            key={sub.to}
                            to={sub.to}
                            onClick={() => { setMenuAberto(false); setSubmenuAberto(null); }}
                            className="block px-4 py-2.5 rounded-xl text-gray-600 hover:bg-[#FDF2F7] hover:text-[#cd146e] font-medium text-sm transition-colors"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuAberto(false)}
                    className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-[#FDF2F7] hover:text-[#cd146e] font-semibold text-base transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <Link
                to="/faq"
                onClick={() => setMenuAberto(false)}
                className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-[#FDF2F7] hover:text-[#cd146e] font-semibold text-base transition-colors"
              >
                FAQ
              </Link>
            </div>

            <div className="px-4 pb-6 pt-3 border-t border-gray-100">
              <a
                href="https://wa.me/5527998392172"
                target="_blank"
                rel="noreferrer"
                className="block text-center bg-[#cd146e] text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-[#9e1b7c] transition-all shadow-sm"
              >
                Fale Conosco
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}