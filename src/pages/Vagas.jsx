import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ImagemVagas from '../assets/vagas.webp';
import { supabase } from '../supabaseClient'; // <-- ADICIONA ESTA LINHA // Importação estática da imagem de fundo

// Aceita tanto um array (coluna jsonb) quanto um texto com um item por linha
function paraLista(valor) {
  if (Array.isArray(valor)) return valor.map((item) => String(item).trim()).filter(Boolean);
  if (typeof valor === 'string') return valor.split('\n').map((item) => item.trim()).filter(Boolean);
  return [];
}

export default function Vagas() {
  const [vagas, setVagas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarVagas() {
      try {
        setCarregando(true);
        // Busca direta na tabela 'vagas' do Supabase
        const { data, error } = await supabase
          .from('vagas')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const vagasFormatadas = data.map(item => ({
            id: item.id,
            titulo: item.titulo || "Título da Vaga",
            departamento: item.departamento || "Geral",
            localizacao: item.localizacao || "Remoto / Híbrido",
            modalidade: item.modalidade || "Presencial",
            tipoContrato: item.tipo_contrato || "CLT",
            cargaHoraria: item.carga_horaria || "A combinar",
            salario: item.salario || "A combinar",
            descricao: item.descricao || "Descrição da oportunidade...",
            requisitos: paraLista(item.requisitos),
            beneficios: paraLista(item.beneficios),
            linkFormulario: item.link_formulario || "#"
          }));

          setVagas(vagasFormatadas);
        }
      } catch (erro) {
        console.error("Erro ao buscar vagas no Supabase:", erro);
      } finally {
        setCarregando(false);
      }
    }

    buscarVagas();
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#F8F9FA] text-gray-900 font-sans antialiased">
      <Navbar />

      {/* Banner Quadrado de Ponta a Ponta da Tela (Sem margens) */}
      <div 
        className="w-full h-[360px] sm:h-[350px] md:h-[400px] bg-cover bg-center relative z-0"
        style={{ 
          backgroundImage: `url(${ImagemVagas})`,
          boxShadow: '0 20px 35px -10px rgba(205, 20, 110, 0.3)' /* Sombra Rosa Projetada Abaixo */
        }}
      >
        {/* Banner 100% limpo, servindo puramente para exibir a imagem de fundo */}
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 pb-24 relative z-10">
        {carregando ? (
          <div className="w-full flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#cd146e]"></div>
          </div>
        ) : vagas.length === 0 ? (
          
          /* LAYOUT ELABORADO: Card Premium posicionado totalmente ABAIXO do banner */
          <div className="w-full max-w-xl mx-auto bg-white rounded-[2.5rem] p-10 md:p-12 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.06)] border border-gray-100 text-center mt-10 md:mt-14 transition-all duration-300 animate-fade-in">
            
            {/* Ícone de Maleta / Carreira Executiva com gradiente suave */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#fdf2f7] to-[#f5e6fc] text-[#cd146e] mb-6 shadow-inner">
              <svg 
                className="w-8 h-8" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="1.8"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 013.75 18.4V14.15m16.5 0c0-.621-.504-1.125-1.125-1.125H4.875c-.621 0-1.125.504-1.125 1.125m16.5 0a9 9 0 00-16.5 0M12 3v3.375m0 0H8.25m3.75 0h3.75M9.75 14.25h4.5" />
              </svg>
            </div>
            
            {/* Tag explicativa sutil */}
            <span className="block text-[11px] font-bold text-[#cd146e] tracking-widest uppercase bg-[#fdf2f7] py-1 px-3.5 rounded-full w-max mx-auto mb-4">
              Mural de Oportunidades
            </span>
            
            {/* Título e frase reestruturados */}
            <h3 className="text-gray-800 font-extrabold text-xl md:text-2xl tracking-tight mb-3">
              Não há vagas disponíveis no momento.
            </h3>
            
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
              No momento nosso time está completo, mas estamos sempre crescendo. Volte a nos visitar em breve para novas oportunidades!
            </p>
          </div>

        ) : (
          
          /* Lista de Vagas Existentes (Caso existam dados na API) */
          <div className="pt-12">
            <div className="flex flex-col items-center gap-8">
              {vagas.map(vaga => (
                <div key={vaga.id} className="w-full max-w-2xl flex flex-col bg-white rounded-[2rem] p-8 md:p-10 shadow-sm hover:shadow-xl transition-all duration-300 border border-[#cd146e]/20 group">
                  <h3 className="text-2xl md:text-[26px] font-extrabold text-black mb-4 leading-snug group-hover:text-[#cd146e] transition-colors duration-300">
                    {vaga.titulo}
                  </h3>

                  {/* Linha de metadados: localização, modalidade + contrato, carga horária, salário */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 font-medium mb-6">
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#cd146e] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {vaga.localizacao}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#cd146e] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 013.75 18.4V14.15m16.5 0c0-.621-.504-1.125-1.125-1.125H4.875c-.621 0-1.125.504-1.125 1.125m16.5 0a9 9 0 00-16.5 0M12 3v3.375m0 0H8.25m3.75 0h3.75M9.75 14.25h4.5" />
                      </svg>
                      {vaga.modalidade} · {vaga.tipoContrato}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#cd146e] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                        <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {vaga.cargaHoraria}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#cd146e] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="6" width="18" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18" />
                      </svg>
                      {vaga.salario}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed mb-8">
                    {vaga.descricao}
                  </p>

                  {(vaga.requisitos.length > 0 || vaga.beneficios.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      {vaga.requisitos.length > 0 && (
                        <div>
                          <h4 className="text-xs font-extrabold text-black uppercase tracking-widest mb-3">
                            O que a vaga pede
                          </h4>
                          <ul className="space-y-2">
                            {vaga.requisitos.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                <svg className="w-4 h-4 text-[#cd146e] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {vaga.beneficios.length > 0 && (
                        <div>
                          <h4 className="text-xs font-extrabold text-black uppercase tracking-widest mb-3">
                            O que a LATec oferece
                          </h4>
                          <ul className="space-y-2">
                            {vaga.beneficios.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                <svg className="w-4 h-4 text-[#7c3aed] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12v9H4v-9M2 7h20v5H2V7zm10-5v18M12 7c-1-3-3-5-4.5-5S5 3.5 5 5s1.5 2 3 2h4zm0 0c1-3 3-5 4.5-5S19 3.5 19 5s-1.5 2-3 2h-4z" />
                                </svg>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <a
                    href={`https://wa.me/5527998392172?text=${encodeURIComponent(`Olá! Gostaria de me candidatar à vaga de ${vaga.titulo}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto text-center bg-gradient-to-r from-[#cd146e] to-[#7624a0] hover:opacity-90 text-white font-bold text-sm uppercase tracking-wider py-4 px-8 rounded-full transition-all duration-300 shadow-sm mt-auto self-start"
                  >
                    Candidatar-se à vaga
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}