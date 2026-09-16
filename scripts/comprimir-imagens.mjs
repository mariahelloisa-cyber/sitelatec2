// Comprime as imagens estáticas de src/assets e public para WebP.
//
// Os arquivos originais em PNG somavam ~5 MB e eram baixados inteiros no
// primeiro acesso, o que segurava o carregamento das páginas de curso e da
// home. WebP com qualidade 80 mantém a imagem indistinguível na tela e corta
// a maior parte do peso.
//
// Uso: npm run imagens
//
// O script é idempotente: só regrava o .webp se ele não existir ou se o
// original for mais novo, então rodar de novo depois de trocar uma arte é
// barato e seguro.

import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const RAIZ = path.resolve(import.meta.dirname, '..');
const PASTAS = ['src/assets', 'public'];

// Nada no site é exibido acima destas larguras; qualquer coisa maior é
// download jogado fora. A altura acompanha proporcionalmente.
const LARGURA_MAXIMA = 1920;
const QUALIDADE = 80;

// Extensões que vale a pena reprocessar. SVG fica de fora (é texto, e o
// próprio Vite já minifica), assim como GIF animado.
const CONVERSIVEIS = new Set(['.png', '.jpg', '.jpeg']);

// Imagens que a interface nunca desenha grandes. O limite global de 1920 não
// ajuda aqui: a logo do topo aparece com 56 px de altura, então guardar 600 px
// de lado é peso que ninguém vê. O valor já inclui folga para telas retina.
// A chave é o nome do arquivo de saída (.webp).
const LARGURA_POR_ARQUIVO = {
  'logolatec.webp': 256, // <img className="h-14"> na Navbar e no Footer
  'meclogo.webp': 256, // selo do MEC em w-24 h-24 na home
};

// Arquivos já em .webp só entram na lista quando têm um limite próprio acima;
// fora isso, reencodar de novo só perderia qualidade à toa.
const REGRAVAVEIS_WEBP = new Set(Object.keys(LARGURA_POR_ARQUIVO));

function kb(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

async function precisaRegravar(origem, destino) {
  try {
    const [a, b] = await Promise.all([stat(origem), stat(destino)]);
    return a.mtimeMs > b.mtimeMs;
  } catch {
    return true; // destino ainda não existe
  }
}

async function comprimir(arquivo) {
  const destino = arquivo.replace(/\.(png|jpe?g)$/i, '.webp');
  const noLugar = destino === arquivo; // .webp sendo reduzido sobre si mesmo

  if (!noLugar && !(await precisaRegravar(arquivo, destino))) {
    console.log(`  = ${path.relative(RAIZ, destino)} (já atualizado)`);
    return { antes: 0, depois: 0 };
  }

  // O arquivo vai para a memória antes de entrar no sharp: quando a saída é o
  // próprio caminho de entrada (um .webp sendo reduzido), o Windows recusa a
  // escrita enquanto o sharp ainda segura o handle de leitura.
  const original = await readFile(arquivo);
  const antes = original.length;
  const imagem = sharp(original);
  const { width } = await imagem.metadata();
  const teto = LARGURA_POR_ARQUIVO[path.basename(destino)] ?? LARGURA_MAXIMA;

  const buffer = await imagem
    .resize({ width: Math.min(width, teto), withoutEnlargement: true })
    .webp({ quality: QUALIDADE, effort: 6 })
    .toBuffer();

  // Reencodar um .webp que já estava enxuto só degradaria a imagem sem ganho.
  if (noLugar && buffer.length >= antes) {
    console.log(`  = ${path.relative(RAIZ, destino)} (já enxuto)`);
    return { antes: 0, depois: 0 };
  }

  await writeFile(destino, buffer);

  const depois = buffer.length;
  const corte = (100 - (depois / antes) * 100).toFixed(0);

  console.log(
    `  ✓ ${path.relative(RAIZ, destino)}  ${kb(antes)} → ${kb(depois)}  (-${corte}%)`,
  );

  return { antes, depois };
}

async function main() {
  let antes = 0;
  let depois = 0;

  for (const pasta of PASTAS) {
    const dir = path.join(RAIZ, pasta);
    let entradas;
    try {
      entradas = await readdir(dir);
    } catch {
      continue;
    }

    const alvos = entradas.filter(
      (n) => CONVERSIVEIS.has(path.extname(n).toLowerCase()) || REGRAVAVEIS_WEBP.has(n),
    );
    if (alvos.length === 0) continue;

    console.log(`\n${pasta}:`);
    for (const nome of alvos) {
      const r = await comprimir(path.join(dir, nome));
      antes += r.antes;
      depois += r.depois;
    }
  }

  if (antes > 0) {
    console.log(`\nTotal: ${kb(antes)} → ${kb(depois)} (-${(100 - (depois / antes) * 100).toFixed(0)}%)`);
  } else {
    console.log('\nNada a fazer.');
  }
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
