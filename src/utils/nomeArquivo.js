// O Supabase Storage rejeita chaves com acentos, espaços e caracteres
// especiais ("Invalid key: ..."), então o nome escolhido pela pessoa no PC
// não pode ir cru para o upload. Aqui ele é normalizado antes.

const REGEX_ACENTOS = new RegExp('[\\u0300-\\u036f]', 'g');

function limpar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(REGEX_ACENTOS, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

// Monta a chave do arquivo no storage: "<prefixo>-<timestamp>-<nome>.<ext>",
// já sem acentos nem espaços. Ex.: "EDUCAÇÃO INOVADORA copiar.png"
// vira "diferencial-1788902048948-educacao-inovadora-copiar.png".
export function nomeArquivoSeguro(nomeOriginal, prefixo = '') {
  const nome = String(nomeOriginal ?? 'arquivo');
  const ponto = nome.lastIndexOf('.');
  const temExtensao = ponto > 0;

  const base = limpar(temExtensao ? nome.slice(0, ponto) : nome) || 'arquivo';
  const extensao = temExtensao ? limpar(nome.slice(ponto + 1)) : '';

  const partes = [limpar(prefixo), Date.now(), base].filter(Boolean);
  const chave = partes.join('-');

  return extensao ? `${chave}.${extensao}` : chave;
}
