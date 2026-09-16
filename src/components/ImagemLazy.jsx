import { useEffect, useRef, useState } from 'react';

// Imagem que começa a baixar antes de entrar na tela.
//
// O `loading="lazy"` nativo resolve o problema de não baixar o que ninguém vê,
// mas decide a hora sozinho: a distância que o Chrome usa é pequena para as
// seções deste site (a galeria da página Sobre tem 175vh de altura), e o
// resultado é a foto aparecendo em branco e preenchendo só depois que o
// visitante já chegou nela.
//
// Aqui a distância é explícita. Um IntersectionObserver com margem generosa
// avisa quando a imagem está chegando, e a troca de `lazy` para `eager` manda
// o navegador buscar naquele instante — com folga para o download terminar
// antes de a imagem entrar no campo de visão.
const MARGEM_DE_ANTECEDENCIA = '1500px 0px';

export default function ImagemLazy(props) {
  const ref = useRef(null);
  const [perto, setPerto] = useState(false);

  useEffect(() => {
    if (perto) return;

    const elemento = ref.current;
    if (!elemento) return;

    // Sem IntersectionObserver o comportamento vira o do atributo nativo, que
    // é mais lento porém nunca deixa a imagem sem carregar.
    if (typeof IntersectionObserver === 'undefined') return;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        setPerto(true);
        observador.disconnect();
      },
      { rootMargin: MARGEM_DE_ANTECEDENCIA },
    );

    observador.observe(elemento);
    return () => observador.disconnect();
  }, [perto]);

  return (
    <img
      ref={ref}
      // Enquanto está longe, o `lazy` segura o download — é ele que garante
      // que nada baixa se o visitante nunca descer até aqui. Quando o
      // observador avisa, virar `eager` retoma o carregamento na hora.
      loading={perto ? 'eager' : 'lazy'}
      decoding="async"
      {...props}
    />
  );
}
