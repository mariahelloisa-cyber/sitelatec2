import React, { useState, useEffect } from 'react';
import logo from '../assets/logolatec.png';
import { supabase } from '../supabaseClient';

const CONTATO_PADRAO = {
  endereco_linha1: 'Rua Flor de Maio, 376',
  endereco_linha2: 'Bairro Jardins - Aracruz-ES - CEP 29190-353',
  telefone: '(27) 99839-2172',
  whatsapp_numero: '5527998392172',
  email: 'contato@escolalatec.com.br',
  instagram_url: '#',
  facebook_url: '#',
  linkedin_url: '#',
};

export default function Footer() {
  const anoAtual = new Date().getFullYear();
  const [contato, setContato] = useState(CONTATO_PADRAO);

  useEffect(() => {
    async function buscarContatoFooter() {
      try {
        const { data, error } = await supabase
          .from('contato_footer')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setContato((prev) => ({
            endereco_linha1: data.endereco_linha1 || prev.endereco_linha1,
            endereco_linha2: data.endereco_linha2 || prev.endereco_linha2,
            telefone: data.telefone || prev.telefone,
            whatsapp_numero: data.whatsapp_numero || prev.whatsapp_numero,
            email: data.email || prev.email,
            instagram_url: data.instagram_url || prev.instagram_url,
            facebook_url: data.facebook_url || prev.facebook_url,
            linkedin_url: data.linkedin_url || prev.linkedin_url,
          }));
        }
      } catch (err) {
        console.error('Erro ao carregar contato do rodapé:', err);
      }
    }

    buscarContatoFooter();
  }, []);

  return (
    <footer className="bg-white text-gray-600">
      {/* Barra gradiente superior */}
      <div className="w-full h-1.5 bg-gradient-to-r from-[#cd146e] via-[#7c3aed] to-[#2563eb]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* COLUNA 1: LOGO, SOBRE E REDES SOCIAIS */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <img src={logo} alt="LATec Escola Técnica" className="h-14 w-auto object-contain -ml-2" />
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Mais que ensino técnico. É futuro construído com propósito.
            </p>
            <div className="flex items-center gap-2.5">
              <a href={contato.instagram_url || '#'} target="_blank" rel="noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-full border border-[#cd146e]/40 text-[#cd146e] flex items-center justify-center hover:bg-[#cd146e] hover:text-white hover:border-[#cd146e] transition-colors">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.98-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.198-4.354-2.618-6.78-6.98-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6 6 0 100 12 6 6 0 000-12zm0 9.837a3.838 3.838 0 110-7.676 3.838 3.838 0 010 7.676zm6.406-10.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
              <a href={contato.facebook_url || '#'} target="_blank" rel="noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-full border border-[#cd146e]/40 text-[#cd146e] flex items-center justify-center hover:bg-[#cd146e] hover:text-white hover:border-[#cd146e] transition-colors">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94z" /></svg>
              </a>
              <a href={`https://wa.me/${contato.whatsapp_numero}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="w-8 h-8 rounded-full border border-[#cd146e]/40 text-[#cd146e] flex items-center justify-center hover:bg-[#cd146e] hover:text-white hover:border-[#cd146e] transition-colors">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.004 2C6.49 2 2.007 6.483 2.007 11.997c0 1.762.462 3.484 1.34 5.003L2 22l5.126-1.341a9.958 9.958 0 004.878 1.242h.004c5.514 0 9.997-4.483 9.997-9.997C21.997 6.483 17.518 2 12.004 2zm0 18.16h-.003a8.16 8.16 0 01-4.158-1.138l-.298-.177-3.043.796.812-2.966-.194-.305a8.15 8.15 0 01-1.253-4.373c0-4.506 3.667-8.173 8.176-8.173 2.184 0 4.238.851 5.783 2.397a8.126 8.126 0 012.394 5.784c0 4.507-3.667 8.155-8.216 8.155z" /></svg>
              </a>
              <a href="/login" aria-label="Área administrativa" title="Área administrativa" className="w-8 h-8 rounded-full border border-gray-300 text-gray-400 flex items-center justify-center hover:bg-gray-700 hover:text-white hover:border-gray-700 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2.75l7.25 3.25v5.25c0 4.73-3.11 8.94-7.25 10.25-4.14-1.31-7.25-5.52-7.25-10.25V6l7.25-3.25z" /></svg>
              </a>
            </div>
          </div>

          {/* COLUNA 2: LINKS RÁPIDOS */}
          <div className="md:col-span-3 md:border-l md:border-gray-200 md:pl-8 flex flex-col gap-2.5">
            <div className="flex flex-col gap-1.5">
              <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider">Navegação</h3>
              <span className="block w-8 h-0.5 bg-[#cd146e] rounded-full" />
            </div>
            <ul className="flex flex-col gap-1.5 text-sm">
              <li>
                <a href="/" className="flex items-center gap-1.5 hover:text-[#cd146e] transition-colors">
                  <span className="text-[#cd146e] font-bold">›</span> Início
                </a>
              </li>
              <li>
                <a href="/cursos" className="flex items-center gap-1.5 hover:text-[#cd146e] transition-colors">
                  <span className="text-[#cd146e] font-bold">›</span> Cursos
                </a>
              </li>
              <li>
                <a href="/blog" className="flex items-center gap-1.5 hover:text-[#cd146e] transition-colors">
                  <span className="text-[#cd146e] font-bold">›</span> Blog
                </a>
              </li>
              <li>
                <a href="/sobre" className="flex items-center gap-1.5 hover:text-[#cd146e] transition-colors">
                  <span className="text-[#cd146e] font-bold">›</span> Quem Somos
                </a>
              </li>
            </ul>
          </div>

          {/* COLUNA 3: CONTATO */}
          <div className="md:col-span-5 md:border-l md:border-gray-200 md:pl-8 flex flex-col gap-2.5">
            <div className="flex flex-col gap-1.5">
              <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider">Contato e Localização</h3>
              <span className="block w-8 h-0.5 bg-[#cd146e] rounded-full" />
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-[#cd146e] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                <span>{contato.endereco_linha1}<br />{contato.endereco_linha2}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-[#cd146e] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.415-5.127-3.719-6.542-6.542l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.75z" /></svg>
                <a href={`https://wa.me/${contato.whatsapp_numero}`} target="_blank" rel="noreferrer" className="hover:text-[#cd146e] transition-colors">
                  {contato.telefone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-[#cd146e] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0l-7.5-4.615m19.5 0A2.25 2.25 0 0019.5 4.5" /></svg>
                <a href={`mailto:${contato.email}`} className="hover:text-[#cd146e] transition-colors">
                  {contato.email}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Linha Divisória Inferior */}
        <div className="border-t border-gray-200 mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>© {anoAtual} LATec. Todos os direitos reservados.</p>
          <div className="flex items-center gap-3">
            <a href="/privacidade" className="hover:text-[#cd146e] transition-colors">Política de Privacidade</a>
            <span className="w-px h-3 bg-gray-300" />
            <a href="/termos" className="hover:text-[#cd146e] transition-colors">Termos de Uso</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
