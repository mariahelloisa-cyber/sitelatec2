// Compressão das imagens escolhidas no painel admin, antes de subir.
//
// O que o admin manda é o arquivo cru que saiu do Photoshop ou da câmera:
// PNGs de 3 MB, fotos de celular com 4000 px de largura. Esse mesmo arquivo é
// servido depois para todo visitante do site, em um <img> que raramente passa
// de 1920 px — ou seja, o peso todo é baixado e jogado fora no redimensionamento.
//
// Aqui o arquivo é reencodado em WebP no navegador do admin, uma vez, no
// momento do upload. O que chega no Storage já é o que o site precisa.

// Nenhum <img> do site é desenhado acima disso; guardar mais é download perdido.
const LARGURA_MAXIMA = 1920;

// 0.82 é o ponto em que o WebP para de mostrar artefato em foto e em arte com
// texto, que é o que costuma vir nos banners.
const QUALIDADE = 0.82;

// Abaixo disso o ganho não paga o tempo de reencodar (e o risco de perder
// qualidade à toa) — mas só vale se a imagem também não estiver larga demais.
const TAMANHO_MINIMO_PARA_COMPRIMIR = 200 * 1024;

// GIF é deixado de lado de propósito: o canvas só enxerga o primeiro quadro,
// então comprimir um GIF animado o transformaria em imagem parada.
const FORMATOS_IGNORADOS = ['image/gif'];

function suportaCompressao() {
  return (
    typeof createImageBitmap === 'function' &&
    typeof document !== 'undefined' &&
    typeof HTMLCanvasElement !== 'undefined'
  );
}

function trocarExtensao(nome, extensao) {
  const ponto = String(nome).lastIndexOf('.');
  const base = ponto > 0 ? nome.slice(0, ponto) : nome;
  return `${base}.${extensao}`;
}

function canvasParaBlob(canvas, tipo, qualidade) {
  return new Promise((resolve) => canvas.toBlob(resolve, tipo, qualidade));
}

/**
 * Devolve uma versão WebP, redimensionada, do arquivo recebido.
 *
 * Nunca lança: se o navegador não conseguir decodificar a imagem, ou se o
 * resultado não ficar menor que o original, o próprio arquivo original volta.
 * Upload que funciona pesado é melhor que upload que falha.
 */
export async function comprimirImagem(arquivo) {
  if (!arquivo || FORMATOS_IGNORADOS.includes(arquivo.type) || !suportaCompressao()) {
    return arquivo;
  }

  let bitmap;
  try {
    // `from-image` aplica o EXIF de orientação na hora de decodificar. Sem
    // isso, foto tirada de celular na vertical sobe deitada, porque o canvas
    // ignora o metadado que o <img> respeitaria.
    bitmap = await createImageBitmap(arquivo, { imageOrientation: 'from-image' });
  } catch {
    return arquivo;
  }

  try {
    const escala = Math.min(1, LARGURA_MAXIMA / bitmap.width);

    // Já é pequena e já cabe na tela: reencodar só perderia qualidade.
    if (escala === 1 && arquivo.size <= TAMANHO_MINIMO_PARA_COMPRIMIR) {
      return arquivo;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);

    const ctx = canvas.getContext('2d');
    // Sem um fundo opaco, o alfa de um PNG vira preto em formatos sem
    // transparência e deixa halo nas bordas; o WebP guarda alfa, então o
    // desenho vai direto.
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await canvasParaBlob(canvas, 'image/webp', QUALIDADE);

    // Navegador sem encoder WebP devolve null (ou cai para PNG, que costuma
    // ficar maior) — nos dois casos o original serve melhor.
    if (!blob || blob.type !== 'image/webp' || blob.size >= arquivo.size) {
      return arquivo;
    }

    return new File([blob], trocarExtensao(arquivo.name, 'webp'), {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } catch {
    return arquivo;
  } finally {
    bitmap.close?.();
  }
}
