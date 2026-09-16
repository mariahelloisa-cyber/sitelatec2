// Sanitização de URLs que vêm do banco (links de redes sociais, banner lateral
// etc.). Esses campos são texto livre preenchido no painel admin e vão direto
// para o atributo href — se alguém gravar "javascript:fetch(...)" no banco, o
// clique de qualquer visitante executa esse código no domínio do site (XSS
// armazenado). React não bloqueia esquemas perigosos em href, só avisa no
// console, então a filtragem precisa ser explícita.

const ESQUEMAS_PERMITIDOS = ['http:', 'https:', 'mailto:', 'tel:'];

// Devolve a URL se ela for segura de usar em href, ou `padrao` caso contrário.
export function urlSegura(valor, padrao = '#') {
  if (!valor || typeof valor !== 'string') return padrao;

  const bruto = valor.trim();
  if (!bruto) return padrao;

  // Caminhos internos ("/cursos", "#secao") não têm esquema e são seguros.
  if (bruto.startsWith('/') || bruto.startsWith('#')) return bruto;

  try {
    // `window.location.origin` como base resolve relativos; o esquema final é
    // o que decide.
    const analisada = new URL(bruto, window.location.origin);
    return ESQUEMAS_PERMITIDOS.includes(analisada.protocol) ? bruto : padrao;
  } catch {
    // Não é uma URL parseável — não vai para o href.
    return padrao;
  }
}
