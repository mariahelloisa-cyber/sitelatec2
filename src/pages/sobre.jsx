import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import ParallaxGallery from '../components/ParallaxGallery';
import { supabase } from '../supabaseClient';
import imagemInstitucional from '../assets/vagas.png';
import selo6 from '../assets/selo6.png';
import fotoHeroSobre from '../assets/sobreHeroFoto.png';

const ID_VIDEO_MANIFESTO = '4vff2PohAU8';

const DESTAQUES_PADRAO = {
  imagem_url: '',
  esquerda_1: 'Ensino EAD',
  esquerda_2: 'Praticidade',
  esquerda_3: 'Liberdade de Horários',
  esquerda_4: 'Alto Desempenho Acadêmico',
  direita_1: 'Certificação Reconhecida',
  direita_2: 'Suporte Pedagógico',
  direita_3: 'Plataforma Moderna',
  direita_4: 'Conectividade Total',
};

const REDES_SOCIAIS_CONFIG = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'reclameaqui', label: 'Reclame Aqui' },
  { key: 'google', label: 'Google Meu Negócio' },
];

const REDES_SOCIAIS_PADRAO = REDES_SOCIAIS_CONFIG.reduce((acc, { key }) => {
  acc[`${key}_imagem`] = '';
  acc[`${key}_link`] = '#';
  return acc;
}, {});

const GALERIA_CAMPOS = Array.from({ length: 9 }, (_, i) => `imagem_${i + 1}`);

function ItemDestaque({ texto, visivel, atraso, lado }) {
  const bordas = lado === 'direita'
    ? 'border-y border-l rounded-l-md justify-self-start'
    : 'border-y border-r rounded-r-md justify-self-end';
  // A ponta de fora (longe da linha/imagem) some; a ponta de dentro (junto da linha) fica sólida
  // Fade contínuo: sólida -> opacidade reduzida no meio -> transparente na ponta
  const gradienteBorda = lado === 'direita'
    ? 'linear-gradient(90deg, #cd146e, rgba(205,20,110,0.35), transparent) 1'
    : 'linear-gradient(90deg, transparent, rgba(205,20,110,0.35), #cd146e) 1';
  // Entra de baixo e do lado de fora (esquerda entra vindo da esquerda, direita vindo da direita)
  const entradaOculta = lado === 'direita' ? 'translate-x-10 translate-y-6' : '-translate-x-10 translate-y-6';
  return (
    <div
      className={`inline-flex items-center px-3 py-1.5 bg-white ${bordas} transition-all ease-out ${visivel ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${entradaOculta}`}`}
      style={{
        transitionDelay: `${atraso}ms`,
        transitionDuration: '2200ms',
        borderImage: gradienteBorda,
      }}
    >
      <span className="text-[#cd146e] text-[11px] md:text-xs font-bold leading-snug whitespace-nowrap">{texto}</span>
    </div>
  );
}

function LinhaConectora({ visivel, atraso, lado }) {
  const alinhamento = lado === 'direita' ? 'justify-self-end origin-right' : 'justify-self-start origin-left';
  return (
    <div
      className={`h-px w-20 bg-[#cd146e]/50 ease-out ${alinhamento} ${visivel ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`}
      style={{ transitionDelay: `${atraso}ms`, transitionDuration: '2200ms', transitionProperty: 'opacity, transform' }}
    />
  );
}

export default function Sobre() {
  const [fotoHistoria, setFotoHistoria] = useState(null);
  const [videoTocando, setVideoTocando] = useState(false);
  const [destaques, setDestaques] = useState(DESTAQUES_PADRAO);
  const [destaquesVisiveis, setDestaquesVisiveis] = useState(false);
  const refSecaoDestaques = useRef(null);
  const [redesSociais, setRedesSociais] = useState(REDES_SOCIAIS_PADRAO);
  const [fotosGaleria, setFotosGaleria] = useState(null);

  useEffect(() => {
    async function buscarGaleria() {
      try {
        const { data, error } = await supabase
          .from('sobre_galeria')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const urls = GALERIA_CAMPOS.map((campo) => data[campo]).filter(Boolean);
          if (urls.length === 9) setFotosGaleria(urls);
        }
      } catch (err) {
        console.error('Erro ao buscar a galeria da página Sobre:', err);
      }
    }
    buscarGaleria();
  }, []);

  useEffect(() => {
    async function buscarRedesSociais() {
      try {
        const { data, error } = await supabase
          .from('sobre_redes_sociais')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setRedesSociais((prev) => {
            const novo = { ...prev };
            REDES_SOCIAIS_CONFIG.forEach(({ key }) => {
              novo[`${key}_imagem`] = data[`${key}_imagem`] || prev[`${key}_imagem`];
              novo[`${key}_link`] = data[`${key}_link`] || prev[`${key}_link`];
            });
            return novo;
          });
        }
      } catch (err) {
        console.error('Erro ao buscar as redes sociais da página Sobre:', err);
      }
    }
    buscarRedesSociais();
  }, []);

  useEffect(() => {
    async function buscarDestaques() {
      try {
        const { data, error } = await supabase
          .from('sobre_produto_destaque')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setDestaques((prev) => ({
            imagem_url: data.imagem_url || prev.imagem_url,
            esquerda_1: data.esquerda_1 || prev.esquerda_1,
            esquerda_2: data.esquerda_2 || prev.esquerda_2,
            esquerda_3: data.esquerda_3 || prev.esquerda_3,
            esquerda_4: data.esquerda_4 || prev.esquerda_4,
            direita_1: data.direita_1 || prev.direita_1,
            direita_2: data.direita_2 || prev.direita_2,
            direita_3: data.direita_3 || prev.direita_3,
            direita_4: data.direita_4 || prev.direita_4,
          }));
        }
      } catch (err) {
        console.error('Erro ao buscar os destaques da página Sobre:', err);
      }
    }
    buscarDestaques();
  }, []);

  useEffect(() => {
    const elemento = refSecaoDestaques.current;
    if (!elemento) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDestaquesVisiveis(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(elemento);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    async function buscarFotoHistoria() {
      try {
        const { data, error } = await supabase
          .from('sobre_historia')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (data?.imagem_url) setFotoHistoria(data.imagem_url);
      } catch (err) {
        console.error('Erro ao buscar a foto de Nossa História:', err);
      }
    }
    buscarFotoHistoria();
  }, []);

  // Array completo com os 6 cards configurados
  const linhaDoTempo = [
    {
      ano: '2020 - 2021',
      categoria: 'IDEALIZAÇÃO',
      titulo: 'O Início de um Sonho',
      descricao: 'Nasce a LA Tec, com o propósito de ampliar o acesso à educação técnica de qualidade e contribuir para o desenvolvimento regional.',
      imagem: selo6 
    },
    {
      ano: '2022',
      categoria: 'EAD',
      titulo: 'Metodologia EAD',
      descricao: 'Implementação da metodologia EAD, permitindo que alunos estudem de qualquer lugar com flexibilidade e autonomia.',
      imagem: selo6 
    },
    {
      ano: '2023',
      categoria: 'EXPANSÃO',
      titulo: 'Crescimento Exponencial',
      descricao: 'Ampliação do portfólio de cursos técnicos voltados às necessidades reais das empresas e indústrias.',
      imagem: selo6
    },
    {
      ano: '2024',
      categoria: 'INOVAÇÃO',
      titulo: 'Crescimento e Impacto',
      descricao: 'Consolidação da LA Tec como uma instituição comprometida com a qualificação profissional e a transformação de vidas.',
      imagem: selo6
    },
    {
      ano: '2025 - 2026',
      categoria: 'CONSOLIDAÇÃO',
      titulo: 'Suporte e Acompanhamento',
      descricao: 'Fortalecimento do atendimento humanizado e da proximidade com os alunos durante toda a jornada acadêmica.',
      imagem: selo6
    },
    {
      ano: '2026',
      categoria: 'O FUTURO CONTINUA',
      titulo: 'O Futuro Continua',
      descricao: 'A LA Tec segue investindo em inovação, tecnologia e educação para criar novas oportunidades e formar profissionais preparados para os desafios do amanhã.',
      imagem: selo6
    }
  ];

  return (
    <div className="w-full bg-white font-sans antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      <Navbar />

      {/* 1. SEÇÃO HERO */}
      <section className="relative w-full bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-16 md:pt-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">

            {/* TEXTO + CTA */}
            <div className="lg:col-span-6 pb-10 md:pb-14 relative z-10">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 bg-[#cd146e] rounded-sm shrink-0"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Sobre Nós</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-[58px] font-black text-[#0f172a] leading-[1.1] tracking-tight mb-5">
                Veja aqui a história da <span className="text-[#cd146e]">LATec</span>
              </h1>
              <p className="text-gray-500 text-base md:text-xl leading-relaxed mb-8 max-w-lg">
                Escolher onde estudar é também escolher como você quer se preparar para o futuro.
              </p>
              <a
                href="#historia"
                className="inline-flex items-center gap-3 bg-[#cd146e] hover:bg-[#a61058] text-white font-bold py-4 px-8 rounded-full transition-transform hover:scale-105 duration-300 w-max shadow-lg"
              >
                Nossa história
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>

            {/* FOTO (telas menores que lg, dentro do fluxo normal) */}
            <div className="lg:hidden flex justify-center">
              <div className="relative w-full max-w-[340px]">
                <div className="absolute -right-3 top-6 bottom-0 w-2/3 bg-[#cd146e]/15 rounded-2xl -z-10"></div>
                <img src={fotoHeroSobre} alt="Aluna LATec" className="w-full h-auto object-contain" />
              </div>
            </div>

          </div>
        </div>

        {/* FOTO (lg+): ocupa toda a altura da hero e encosta na borda direita */}
        <div className="hidden lg:block absolute top-0 right-0 bottom-2 w-[50%] overflow-hidden">
          <div className="absolute inset-y-0 right-10 w-2/3 bg-[#cd146e]/15 rounded-l-[2rem] -z-10"></div>
          <img src={fotoHeroSobre} alt="Aluna LATec" className="absolute inset-0 w-full h-full object-cover object-top scale-125" />
        </div>

        {/* Barra inferior de destaque */}
        <div className="w-full h-2 bg-[#cd146e]"></div>
      </section>

      {/* 2. SEÇÃO HISTÓRIA (Ajustada com formas vetorizadas de alta definição e sem os pontos circulados) */}
      <section id="historia" className="relative max-w-7xl mx-auto px-6 pt-24 pb-8 overflow-hidden">
        
        {/* Padrão de Pontos Decorativos (Mantido apenas o do Canto Inferior Esquerdo) */}
        <div className="absolute bottom-12 left-2 pointer-events-none opacity-40 hidden md:block">
          <div className="grid grid-cols-4 gap-2">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#cd146e]"></div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* LADO ESQUERDO: TEXTOS */}
          <div className="flex flex-col lg:col-span-5 text-[#0f172a]">
            
            {/* Título com Barra Lateral e Letra em Degradê */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-[5px] h-14 bg-gradient-to-b from-[#cd146e] to-[#6366f1] rounded-full"></div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight flex flex-wrap gap-x-3">
                <span className="text-[#0f172a]">Nossa</span>
                <span className="bg-gradient-to-r from-[#cd146e] via-[#a855f7] to-[#4f46e5] bg-clip-text text-transparent">
                  História
                </span>
              </h2>
            </div>

            {/* Parágrafos de Conteúdo */}
            <div className="space-y-6 text-gray-700 text-sm md:text-[15px] font-medium leading-relaxed max-w-xl">
              <p>
                A <strong className="text-gray-900 font-bold">LA Tec</strong> nasceu com a missão de tornar a educação técnica mais acessível, moderna e conectada às necessidades do mercado de trabalho. Integrante do Grupo LA Educação e sediada em <strong className="text-gray-900 font-bold">Aracruz-ES</strong>, a instituição foi criada para contribuir com o desenvolvimento econômico e social da região por meio da formação de profissionais qualificados.
              </p>
              <p>
                Desde o início, acreditamos que a educação deve ser uma ponte entre os sonhos dos alunos e as oportunidades profissionais. Por isso, desenvolvemos uma metodologia de ensino a distância que combina flexibilidade, tecnologia e suporte humanizado, permitindo que cada estudante aprenda no seu próprio ritmo e alcance seus objetivos com mais facilidade.
              </p>
              <p>
                Hoje, a <strong className="text-gray-900 font-bold">LA Tec</strong> segue transformando vidas através da educação técnica, oferecendo cursos alinhados às demandas do mercado e preparando profissionais para construir careers sólidas e um futuro promissor.
              </p>
            </div>
          </div>

          {/* LADO DIREITO: FOTO E COMPOSIÇÃO DE VETORES */}
          <div className="relative lg:col-span-7 w-full flex justify-center items-center py-12">
            
            {/* 1. FORMA VETORIAL DE ALTA QUALIDADE: Curva Rosa/Roxa de Trás */}
            <svg className="absolute -top-6 -right-2 w-[85%] h-[55%] z-0 pointer-events-none" viewBox="0 0 500 350" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M120 20C240 -10 380 -5 450 60C520 125 510 220 460 280C400 350 280 340 180 320C70 300 15 240 5 160C-5 80 30 40 120 20Z" fill="url(#hdPinkPurpleGrad)" />
              <defs>
                <linearGradient id="hdPinkPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#cd146e" />
                  <stop offset="100%" stopColor="#4690D1" />
                </linearGradient>
              </defs>
            </svg>

            {/* Aura Azul Clara de Brilho de Fundo */}
            <div className="absolute -left-10 top-1/4 w-[60%] h-[60%] bg-blue-100/50 rounded-full blur-3xl z-0 pointer-events-none"></div>

            {/* CONTAINER DA FOTO PRINCIPAL */}
            <div className="relative w-full aspect-[4/3] md:aspect-[1.35/1] rounded-[48px_120px_40px_140px] overflow-hidden shadow-[0_30px_70px_rgba(15,23,42,0.18)] z-10">
              <img
                src={fotoHistoria || imagemInstitucional}
                alt="Alunos LA Tec"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* 2. FORMA VETORIAL DE ALTA QUALIDADE: Onda Azul da Frente (Sobrepõe suavemente a foto) */}
            <svg className="absolute -bottom-8 -left-6 w-[95%] h-[50%] z-0 pointer-events-none" viewBox="0 0 600 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 130C10 50 120 10 240 5C400 -2 550 50 590 130C630 210 590 285 510 295C400 310 280 290 160 295C50 300 -5 230 0 130Z" fill="url(#hdBlueGrad)" />
              <defs>
                <linearGradient id="hdBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0066ff" />
                  <stop offset="100%" stopColor="#00a2ff" />
                </linearGradient>
              </defs>
            </svg>
            
          </div>

        </div>
      </section>
      <br></br>
      {/* 2.5 SEÇÃO DESTAQUES (imagem central com 8 tópicos que surgem ao rolar a página) */}
      <section ref={refSecaoDestaques} className="relative max-w-6xl mx-auto px-6 pt-4 pb-20 overflow-hidden">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-[40px] font-black text-[#0f172a] tracking-tight mb-3">
            Por que escolher a <span className="text-[#cd146e]">LATec</span>
          </h2>
          <p className="text-gray-500 font-medium text-base md:text-lg max-w-xl mx-auto">
            Tudo o que torna a nossa experiência de ensino única para você.
          </p>
        </div>

        {/* Layout desktop: imagem central com linhas conectoras */}
        <div className="hidden lg:grid justify-center grid-cols-[minmax(0,220px)_90px_minmax(0,260px)_90px_minmax(0,220px)] grid-rows-4 items-center gap-y-10">
          <ItemDestaque texto={destaques.esquerda_1} lado="esquerda" visivel={destaquesVisiveis} atraso={(4 - 1) * 500} />
          <LinhaConectora lado="esquerda" visivel={destaquesVisiveis} atraso={(4 - 1) * 500} />
          <div className="row-span-4 relative w-full h-full flex items-center justify-center">
            <div className="relative w-full max-w-[260px] aspect-[3/4] rounded-[32px] overflow-hidden">
              <img src={destaques.imagem_url || imagemInstitucional} alt="Destaque LATec" className="w-full h-full object-cover" />
            </div>
          </div>
          <LinhaConectora lado="direita" visivel={destaquesVisiveis} atraso={(4 - 1) * 500} />
          <ItemDestaque texto={destaques.direita_1} lado="direita" visivel={destaquesVisiveis} atraso={(4 - 1) * 500} />

          <ItemDestaque texto={destaques.esquerda_2} lado="esquerda" visivel={destaquesVisiveis} atraso={(4 - 2) * 500} />
          <LinhaConectora lado="esquerda" visivel={destaquesVisiveis} atraso={(4 - 2) * 500} />
          <LinhaConectora lado="direita" visivel={destaquesVisiveis} atraso={(4 - 2) * 500} />
          <ItemDestaque texto={destaques.direita_2} lado="direita" visivel={destaquesVisiveis} atraso={(4 - 2) * 500} />

          <ItemDestaque texto={destaques.esquerda_3} lado="esquerda" visivel={destaquesVisiveis} atraso={(4 - 3) * 500} />
          <LinhaConectora lado="esquerda" visivel={destaquesVisiveis} atraso={(4 - 3) * 500} />
          <LinhaConectora lado="direita" visivel={destaquesVisiveis} atraso={(4 - 3) * 500} />
          <ItemDestaque texto={destaques.direita_3} lado="direita" visivel={destaquesVisiveis} atraso={(4 - 3) * 500} />

          <ItemDestaque texto={destaques.esquerda_4} lado="esquerda" visivel={destaquesVisiveis} atraso={(4 - 4) * 500} />
          <LinhaConectora lado="esquerda" visivel={destaquesVisiveis} atraso={(4 - 4) * 500} />
          <LinhaConectora lado="direita" visivel={destaquesVisiveis} atraso={(4 - 4) * 500} />
          <ItemDestaque texto={destaques.direita_4} lado="direita" visivel={destaquesVisiveis} atraso={(4 - 4) * 500} />
        </div>

        {/* Layout mobile/tablet: imagem no topo + grade 2 colunas */}
        <div className="lg:hidden flex flex-col items-center gap-8">
          <div className="relative w-full max-w-[240px] aspect-[3/4] rounded-[32px] overflow-hidden">
            <img src={destaques.imagem_url || imagemInstitucional} alt="Destaque LATec" className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            {[destaques.esquerda_1, destaques.direita_1, destaques.esquerda_2, destaques.direita_2, destaques.esquerda_3, destaques.direita_3, destaques.esquerda_4, destaques.direita_4].map((texto, i) => (
              <div
                key={i}
                className={`px-3 py-1.5 bg-white border rounded-md text-center transition-all ease-out ${destaquesVisiveis ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 translate-y-6 ${i % 2 === 0 ? '-translate-x-6' : 'translate-x-6'}`}`}
                style={{
                  transitionDelay: `${i * 320}ms`,
                  transitionDuration: '2200ms',
                  borderImage: 'linear-gradient(90deg, #cd146e, #cd146e, transparent) 1',
                }}
              >
                <span className="text-[#cd146e] text-xs font-bold leading-snug">{texto}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2.5 SEÇÃO REDES SOCIAIS */}
      <section className="relative w-full bg-[#fcfbfb]/90">
        <div className="bg-[#cd146e] pt-8 pb-16 md:pt-20 md:pb-28">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <h2 className="text-2xl md:text-4xl font-black text-white text-center mb-8 md:mb-10 tracking-tight -mt-4 md:-mt-8">
              Acompanhe a <span className="text-black">LATec</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
              {REDES_SOCIAIS_CONFIG.map(({ key, label }) => (
                <a
                  key={key}
                  href={redesSociais[`${key}_link`] || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col items-center gap-3"
                >
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-100 transition-transform duration-300 group-hover:-translate-y-1">
                    {redesSociais[`${key}_imagem`] ? (
                      <img
                        src={redesSociais[`${key}_imagem`]}
                        alt={label}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-bold uppercase text-center px-2">
                        {label}
                      </div>
                    )}
                  </div>
                  <span className="text-white text-sm md:text-base font-black uppercase tracking-wide group-hover:text-black transition-colors">
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2.6 SEÇÃO GALERIA COM PARALLAX */}
      <div className="bg-white pt-16 md:pt-20 pb-2 text-center">
        <h2 className="text-3xl md:text-5xl font-black text-[#0f172a] tracking-tight">
          Nosso <span className="text-[#cd146e]">Espaço</span>
        </h2>
        <br></br>
      </div>
      <ParallaxGallery images={fotosGaleria} />
      <br></br>

      {/* 3. SEÇÃO MANIFESTO (Container mais largo e vídeo sem borda) */}
      {/* Alterado para w-full e max-w-[1440px] para ocupar mais espaço nas laterais */}
      <section className="w-full max-w-[1440px] mx-auto px-4 md:px-6 pb-24">
        {/* Container Envelopado com Cantos Ultra Arredondados */}
        <div className="bg-[#cd146e]/10 rounded-[48px] py-16 px-6 md:px-12 flex flex-col items-center text-center w-full">
          
          <span className="text-[#cd146e] text-xs font-black tracking-widest uppercase mb-4">
            Educação acessível, inovação digital e compromisso com o seu futuro.
          </span>

          <h2 className="text-3xl md:text-5xl font-black text-[#0f172a] mb-6 tracking-tight max-w-2xl">
            Dê o play e conheça a<span className="text-[#cd146e]"> LATec</span> de perto.
          </h2>

          <p className="text-gray-600 font-medium text-sm md:text-base max-w-xl leading-relaxed mb-12">
            A história da LA Tec é construída diariamente por alunos, professores e colaboradores que acreditam no poder transformador da educação.

Assista ao vídeo e descubra como estamos conectando conhecimento, oportunidades e desenvolvimento profissional para ajudar milhares de estudantes a conquistarem seus objetivos.
          </p>

          {/* Espaço para o Vídeo / Player (SEM A BORDA BRANCA e um pouco mais largo: max-w-4xl) */}
          <div className="relative w-full max-w-4xl aspect-video rounded-[32px] overflow-hidden shadow-2xl">
            {videoTocando ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${ID_VIDEO_MANIFESTO}?autoplay=1`}
                title="Vídeo institucional LATec"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => setVideoTocando(true)}
                aria-label="Reproduzir vídeo institucional"
                className="absolute inset-0 w-full h-full group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <img
                    src={imagemInstitucional}
                    alt="Capa do Manifesto"
                    className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:bg-black/30"></div>

                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-[#cd146e]/30">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-[#cd146e] ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </button>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}