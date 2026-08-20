import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logolatec.png';
import { useCartStore } from '../store/cartStore';

const LINKS_NAV = [
  { to: '/', label: 'Início' },
  { to: '/sobre', label: 'Sobre Nós' },
  { to: '/cursos', label: 'Cursos' },
  { to: '/blog', label: 'Blog' },
  { to: '/validacaoRastreio', label: 'Aproveitamento' },
  { to: '/vagas', label: 'Vagas' },
  { to: '/ouvidoria', label: 'Ouvidoria' },
];

export default function Navbar() {
  const carrinho = useCartStore((state) => state.carrinho);
  const setCarrinhoAberto = useCartStore((state) => state.setCarrinhoAberto);
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="w-full">
      {/* --- BARRA DE CONTATOS NO TOPO --- */}
      <div className="bg-[#cd146e] text-white py-2 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex gap-6">
            <span>Central do Aluno: +55 (27) 99839-2172</span>
            <span>Central Comercial: +55 (27) 99839-2172</span>
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
              {LINKS_NAV.map((link) => (
                <Link key={link.to} to={link.to} className="text-gray-700 hover:text-[#cd146e] font-medium text-sm transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Botão Fale Conosco + Ícone do Carrinho */}
            <div className="flex items-center gap-2 sm:gap-4">
              <a href="https://wa.me/5527998392172" target="_blank" rel="noreferrer" className="hidden sm:inline-block bg-[#cd146e] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#9e1b7c] transition-all shadow-sm whitespace-nowrap">
                Fale Conosco
              </a>

              {/* ÍCONE DO CARRINHO */}
              <button
                onClick={() => setCarrinhoAberto(true)}
                className="relative p-2 text-gray-800 hover:text-black transition-colors cursor-pointer flex items-center justify-center rounded-full hover:bg-gray-100 shrink-0"
                title="Ver meu carrinho"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>

                {carrinho.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#cd146e] text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-xs animate-in zoom-in-50 duration-200">
                    {carrinho.length}
                  </span>
                )}
              </button>

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
              {LINKS_NAV.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuAberto(false)}
                  className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-[#FDF2F7] hover:text-[#cd146e] font-semibold text-base transition-colors"
                >
                  {link.label}
                </Link>
              ))}
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