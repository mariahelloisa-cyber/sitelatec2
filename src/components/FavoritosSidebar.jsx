import { useFavoritosStore } from '../store/favoritosStore';

export default function FavoritosSidebar() {
  const { favoritos, favoritosAberto, setFavoritosAberto, removerDosFavoritos } = useFavoritosStore();

  const mensagemWhatsapp = encodeURIComponent(
    favoritos.length > 0
      ? `Olá! Tenho interesse ${favoritos.length > 1 ? 'nos cursos' : 'no curso'}: ${favoritos.map((item) => item.titulo).join(', ')}. Quero saber mais e finalizar a matrícula.`
      : 'Olá! Quero saber mais sobre os cursos disponíveis.'
  );

  if (!favoritosAberto) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Fundo Escuro com desfoque leve */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setFavoritosAberto(false)}
      />

      {/* Janela Lateral */}
      <div className="relative flex w-full max-w-md flex-col bg-[#F9F9FB] h-full shadow-2xl animate-slide-in-right z-10 overflow-hidden text-left">

        {/* CABEÇALHO COMPACTO */}
        <div className="flex items-center justify-between px-5 py-5 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FDF2F7] flex items-center justify-center text-[#cd146e] shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21s-6.7-4.35-9.33-8.2C1.02 10.6 1.4 7.6 3.6 5.9c1.9-1.47 4.6-1.2 6.2.55L12 8.8l2.2-2.35c1.6-1.75 4.3-2.02 6.2-.55 2.2 1.7 2.58 4.7.93 6.9C18.7 16.65 12 21 12 21z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-[#1a103c]">Meus favoritos</h2>
              <p className="text-gray-400 text-xs font-semibold">{favoritos.length} curso(s) favoritado(s)</p>
            </div>
          </div>
          <button onClick={() => setFavoritosAberto(false)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* LISTA DE CURSOS FAVORITADOS */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {favoritos.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 p-4">
              <p className="text-gray-400 text-sm italic">Seus favoritos estão vazios.</p>
              <p className="text-gray-300 text-xs mt-1">Toque no coração de um curso para salvá-lo aqui.</p>
            </div>
          ) : (
            favoritos.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex items-center gap-4 relative group">
                <div className="w-12 h-12 rounded-xl bg-[#FDF2F7] flex items-center justify-center text-[#cd146e] shrink-0">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.123 56.123 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
                    <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 0 1-.46.71 47.878 47.878 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.877 47.877 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286.921.304 1.83.634 2.726.99v1.27a1.5 1.5 0 0 0-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.66a6.727 6.727 0 0 0 .551-1.607 1.5 1.5 0 0 0 .14-2.67v-.645a48.549 48.549 0 0 1 3.44 1.667 2.25 2.25 0 0 0 2.12 0Z" />
                    <path d="M4.462 19.462c.42-.419.753-.89 1-1.395.453.214.902.435 1.347.662a6.742 6.742 0 0 1-1.286 1.794.75.75 0 0 1-1.06-1.06Z" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <h3 className="text-sm font-black text-[#1a103c] leading-tight break-words line-clamp-2">{item.titulo}</h3>
                  <div className="inline-flex items-center gap-1 bg-[#F3E8FF]/60 text-[#7c3aed] px-2 py-0.5 rounded-md text-[10px] font-bold mt-1.5">
                    ⏱️ {item.horas}
                  </div>
                </div>

                <button
                  onClick={() => removerDosFavoritos(item.id)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 transition-colors cursor-pointer p-2 rounded-full hover:bg-gray-50"
                  title="Remover dos favoritos"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* RODAPÉ */}
        <div className="bg-white px-5 pt-4 pb-6 border-t border-gray-100 space-y-4">
          <div className="flex items-center justify-center gap-1.5 text-[#cd146e] text-xs font-bold bg-pink-50/50 py-1.5 rounded-lg">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Cursos autorizados e reconhecidos pelo SISTEC
          </div>

          <button
            onClick={() => {
              setFavoritosAberto(false);
              window.open(`https://wa.me/5527998392172?text=${mensagemWhatsapp}`, '_blank', 'noopener,noreferrer');
            }}
            disabled={favoritos.length === 0}
            className="w-full text-white py-4 rounded-2xl font-black uppercase tracking-wider flex items-center justify-between px-5 shadow-md transition-all active:scale-[0.98] cursor-pointer bg-[#cd146e] hover:bg-[#b0105e] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <span className="text-sm">Matricule-se</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>

          <div className="grid grid-cols-3 gap-1 pt-3 border-t border-gray-50 text-center text-[9px] font-black text-[#1a103c] uppercase tracking-tighter">
            <div className="flex flex-col items-center gap-1">
              <span className="text-blue-500 text-base">🛡️</span>
              <span>Ambiente<br/>Seguro</span>
            </div>
            <div className="flex flex-col items-center gap-1 border-x border-gray-100">
              <span className="text-purple-500 text-base">🎓</span>
              <span>Garantia de<br/>Acesso</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-amber-500 text-base">⚡</span>
              <span>Liberação<br/>Imediata</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
