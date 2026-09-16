import { supabase } from '../supabaseClient';
import { comprimirImagem } from './comprimirImagem';

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
  return motivoRecusaFormato(arquivo) ?? motivoRecusaTamanho(arquivo);
}

// Só o formato. É esta parte que vale sobre o arquivo original, antes da
// compressão: nenhum reencode transforma um .html renomeado em imagem, então
// a barreira tem que vir primeiro.
export function motivoRecusaFormato(arquivo) {
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

  return null;
}

// Só o tamanho. Separado porque o limite faz sentido sobre o arquivo que
// realmente sobe, ou seja, depois da compressão.
export function motivoRecusaTamanho(arquivo) {
  if (!arquivo) return 'Nenhum arquivo selecionado.';

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
  // Formato é conferido no original, antes de qualquer reencode.
  const recusa = motivoRecusaFormato(arquivo);
  if (recusa) {
    return { data: null, error: { message: recusa } };
  }

  // Reencoda para WebP e limita a largura antes de subir. Sem isto o arquivo
  // cru do admin (PNG de vários MB, foto de celular) é o mesmo que todo
  // visitante do site baixa depois. `comprimirImagem` devolve o original
  // quando não consegue melhorar, então o upload nunca deixa de acontecer por
  // causa daqui.
  const enviado = await comprimirImagem(arquivo);

  // A checagem de tamanho vale sobre o que realmente sobe: uma foto de 9 MB
  // que virou 400 KB não tem motivo para ser recusada.
  const recusaTamanho = motivoRecusaTamanho(enviado);
  if (recusaTamanho) {
    return { data: null, error: { message: recusaTamanho } };
  }

  return supabase.storage.from('banners').upload(nomeArquivo, enviado, {
    // Sem isto o Storage aceita o content-type que o cliente mandar; fixar a
    // partir do tipo já validado impede subir um arquivo servido como HTML.
    //
    // A chave (`nomeArquivo`) mantém a extensão do arquivo original mesmo
    // quando o conteúdo virou WebP. Quem decide como o navegador lê o arquivo
    // é este content-type, não o final do nome — e trocar a chave aqui
    // quebraria o `getPublicUrl(nomeArquivo)` que cada tela chama em seguida.
    contentType: enviado.type,
    upsert: false,
    ...opcoes,
  });
}
