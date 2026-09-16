import { supabase } from '../supabaseClient';

// Validação de upload do painel admin.
//
// Esta checagem é de conveniência (erro claro para o admin antes de subir o
// arquivo). A barreira que realmente conta é do lado do servidor: o bucket
// "banners" tem `allowed_mime_types` e `file_size_limit` configurados em
// supabase/security_hardening.sql, e o Storage rejeita o que fugir disso mesmo
// que alguém chame a API direto, sem passar por esta tela.

export const TIPOS_IMAGEM_PERMITIDOS = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/avif',
];

export const EXTENSOES_IMAGEM_PERMITIDAS = [
  'png',
  'jpg',
  'jpeg',
  'webp',
  'gif',
  'avif',
];

export const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB

// SVG fica de fora de propósito: é XML, aceita <script> dentro e o bucket é
// público — serviria como XSS armazenado no domínio do Storage.

// Retorna uma string com o motivo da recusa, ou null se o arquivo passar.
export function motivoRecusaImagem(arquivo) {
  if (!arquivo) return 'Nenhum arquivo selecionado.';

  if (!TIPOS_IMAGEM_PERMITIDOS.includes(arquivo.type)) {
    return `Tipo de arquivo não permitido (${arquivo.type || 'desconhecido'}). Use PNG, JPG, WEBP, GIF ou AVIF.`;
  }

  // A extensão é conferida além do MIME type porque o navegador deduz o MIME
  // da extensão e ele pode ser forjado; exigir os dois fecha a brecha do
  // arquivo "foto.html" renomeado para passar como imagem.
  const extensao = String(arquivo.name || '').split('.').pop()?.toLowerCase();
  if (!EXTENSOES_IMAGEM_PERMITIDAS.includes(extensao)) {
    return `Extensão de arquivo não permitida (.${extensao}). Use PNG, JPG, WEBP, GIF ou AVIF.`;
  }

  if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
    const mb = (arquivo.size / 1024 / 1024).toFixed(1);
    return `Imagem muito grande (${mb} MB). O limite é 5 MB.`;
  }

  return null;
}

// Substitui supabase.storage.from('banners').upload(...) em todo o painel.
// Mantém exatamente o mesmo formato de retorno ({ data, error }) das chamadas
// originais, para não mudar o fluxo de erro de quem chama.
export async function uploadImagemSegura(nomeArquivo, arquivo, opcoes) {
  const recusa = motivoRecusaImagem(arquivo);
  if (recusa) {
    return { data: null, error: { message: recusa } };
  }

  return supabase.storage.from('banners').upload(nomeArquivo, arquivo, {
    // Sem isto o Storage aceita o content-type que o cliente mandar; fixar a
    // partir do tipo já validado impede subir um arquivo servido como HTML.
    contentType: arquivo.type,
    upsert: false,
    ...opcoes,
  });
}
