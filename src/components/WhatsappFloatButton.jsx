import { useState } from 'react';

const NUMERO_WHATSAPP = '5527998392172';
const MENSAGEM_PADRAO = 'Olá! Vim pelo site da LATec e gostaria de mais informações.';

export default function WhatsappFloatButton() {
  const [tooltipVisivel, setTooltipVisivel] = useState(true);

  const linkWhatsapp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(MENSAGEM_PADRAO)}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {tooltipVisivel && (
        <a
          href={linkWhatsapp}
          target="_blank"
          rel="noreferrer"
          className="bg-white text-gray-900 text-sm font-bold pl-4 pr-2.5 py-2.5 rounded-2xl rounded-br-sm shadow-xl border border-gray-100 flex items-center gap-2 hover:-translate-y-0.5 transition-transform"
        >
          Fale com um consultor
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTooltipVisivel(false); }}
            className="w-4 h-4 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-[10px] cursor-pointer shrink-0"
            aria-label="Fechar"
          >
            ✕
          </button>
        </a>
      )}
      <a
        href={linkWhatsapp}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar no WhatsApp"
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1EBE5A] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30 transition-all hover:scale-105 active:scale-95"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path d="M12.004 2C6.49 2 2.007 6.483 2.007 11.997c0 1.762.462 3.484 1.34 5.003L2 22l5.126-1.341a9.958 9.958 0 004.878 1.242h.004c5.514 0 9.997-4.483 9.997-9.997C21.997 6.483 17.518 2 12.004 2zm0 18.16h-.003a8.16 8.16 0 01-4.158-1.138l-.298-.177-3.043.796.812-2.966-.194-.305a8.15 8.15 0 01-1.253-4.373c0-4.506 3.667-8.173 8.176-8.173 2.184 0 4.238.851 5.783 2.397a8.126 8.126 0 012.394 5.784c0 4.507-3.667 8.155-8.216 8.155z"/>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        </svg>
      </a>
    </div>
  );
}
