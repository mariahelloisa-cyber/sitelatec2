import icone from '../assets/icon.png';

const ALTURA_TOTAL = 100;
const ICONE_ASPECTO = 2109 / 1850; 
const ICONE_ALTURA = ALTURA_TOTAL; // o ícone ocupa a altura inteira da faixa
const ICONE_LARGURA = ICONE_ALTURA * ICONE_ASPECTO;

const SOBREPOSICAO = 0.42; // fração da largura do ícone que o próximo ícone invade
const ESPACAMENTO = ICONE_LARGURA * (1 - SOBREPOSICAO);
const QTD_ICONES = 70; // ícones por cópia — controla o tamanho de cada ícone e a altura da faixa
const LARGURA_TOTAL = QTD_ICONES * ESPACAMENTO;

function FaixaLogosSvg() {
  return (
    <svg
      viewBox={`0 0 ${LARGURA_TOTAL} ${ALTURA_TOTAL}`}
      className="block h-full w-auto shrink-0 overflow-visible"
      aria-hidden="true"
    >
      {/* ícones desenhados da esquerda pra direita, cada um sobrepondo o anterior — a ordem
          do DOM já garante que cada novo ícone fica por cima do de trás, como escamas */}
      {Array.from({ length: QTD_ICONES }, (_, i) => (
        <image
          key={i}
          href={icone}
          x={i * ESPACAMENTO}
          y={0}
          width={ICONE_LARGURA}
          height={ICONE_ALTURA}
          preserveAspectRatio="xMidYMid meet"
        />
      ))}
    </svg>
  );
}

export default function LinhaDivisoriaEsteira() {
  return (
    <div
      className="relative w-full overflow-hidden select-none pointer-events-none"
      style={{ aspectRatio: `${LARGURA_TOTAL} / ${ALTURA_TOTAL}` }}
    >
      <style>{`
        @keyframes esteiraLinhaDivisoria {
          from { transform: translateX(0%); }
          to { transform: translateX(-50%); }
        }
      `}</style>
      <div
        className="absolute left-0 top-0 bottom-0 flex w-max"
        style={{ animation: 'esteiraLinhaDivisoria 15s linear infinite' }}
      >
        <FaixaLogosSvg />
        <FaixaLogosSvg />
      </div>
    </div>
  );
}
