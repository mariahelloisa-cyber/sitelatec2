// Converte o texto digitado no admin em blocos de conteúdo (título + texto).
//
// Formato esperado:
//   ## Metodologia
//   Texto explicando a metodologia do curso...
//   pode ter várias linhas.
//
//   ## Material Didático
//   Mais texto aqui...
//
// Linhas iniciadas com "##" começam um novo bloco com esse título.
// Texto sem nenhum "##" vira um único bloco sem título.
export function parseBlocosConteudo(texto) {
  if (!texto) return [];

  const linhas = texto.split('\n');
  const blocos = [];
  let atual = null;

  for (const linhaOriginal of linhas) {
    const linha = linhaOriginal.trimEnd();
    if (linha.trim().startsWith('##')) {
      atual = { titulo: linha.trim().replace(/^##\s*/, ''), texto: '' };
      blocos.push(atual);
    } else if (atual) {
      atual.texto += (atual.texto ? '\n' : '') + linha;
    } else if (linha.trim()) {
      atual = { titulo: '', texto: linha };
      blocos.push(atual);
    }
  }

  return blocos
    .map((bloco) => ({ ...bloco, texto: bloco.texto.trim() }))
    .filter((bloco) => bloco.titulo || bloco.texto);
}

// Converte os blocos estruturados (usados no formulário do admin) de volta
// para o texto no formato "## Título\ntexto\n\n## Título 2\ntexto 2", que é
// o formato salvo no banco e lido por parseBlocosConteudo.
export function serializeBlocosConteudo(blocos) {
  if (!Array.isArray(blocos)) return '';

  return blocos
    .filter((bloco) => (bloco.titulo || '').trim() || (bloco.texto || '').trim())
    .map((bloco) => `## ${bloco.titulo?.trim() || ''}\n${bloco.texto || ''}`)
    .join('\n\n');
}
