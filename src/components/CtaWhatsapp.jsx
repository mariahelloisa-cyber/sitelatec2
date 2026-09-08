export default function CtaWhatsapp() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-16 mb-4">
      <div className="w-full bg-[#fdf4f8] rounded-2xl border border-pink-100 p-10 md:p-12 text-center flex flex-col items-center">
        <h3 className="text-[#0f1a30] font-black text-lg md:text-xl mb-2 tracking-tight">
          Ainda tem dúvidas?
        </h3>
        <p className="text-gray-500 text-xs md:text-sm mb-6 font-medium max-w-sm leading-relaxed">
          Nossa equipe de atendimento corporativo está online pronta para te ajudar agora mesmo.
        </p>
        <a
          href="https://wa.me/5527998392172"
          target="_blank"
          rel="noopener noreferrer"
          className="animate-pulse-destaque inline-flex bg-gradient-to-r from-[#cd146e] to-[#4259a4] text-white text-sm font-extrabold px-12 py-4 rounded-full hover:opacity-95 active:scale-[0.98] tracking-wide uppercase will-change-transform"
        >
          Falar no WhatsApp
        </a>
      </div>
    </div>
  );
}
