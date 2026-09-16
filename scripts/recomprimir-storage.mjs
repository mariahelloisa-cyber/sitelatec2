// Recomprime as imagens que JÁ estão no Supabase Storage.
//
// A compressão feita no painel (src/utils/comprimirImagem.js) só vale para
// uploads novos. O que foi enviado antes continua lá do jeito que saiu da
// câmera — a galeria "Nosso Espaço" da página Sobre, por exemplo, são 9 fotos
// de drone somando quase 29 MB, baixadas inteiras por todo visitante.
//
// Este script percorre as tabelas de conteúdo, encontra as URLs que apontam
// para o bucket, baixa cada imagem, reencoda em WebP e sobe a versão leve com
// uma chave nova. Depois atualiza as linhas do banco para apontarem para ela.
//
// Os arquivos originais NÃO são apagados: se algo sair errado, basta voltar a
// URL antiga na linha correspondente. A limpeza do que sobrou é uma decisão
// separada, para outro dia.
//
// ----------------------------------------------------------------------------
// COMO RODAR
// ----------------------------------------------------------------------------
//   npm run recomprimir -- --simular     (não escreve nada; só mostra o plano)
//   npm run recomprimir                  (aplica)
//
// Escrever no bucket e nas tabelas exige ser admin — as policies criadas em
// supabase/security_hardening.sql conferem `public.is_admin()`. Sem nenhuma
// configuração o script pergunta e-mail e senha no terminal, com a senha
// oculta; é o caminho recomendado, porque assim a senha não fica no histórico
// do shell nem no ambiente da sessão.
//
// Para automação dá para pular a pergunta com variáveis de ambiente:
//   SUPABASE_ADMIN_EMAIL + SUPABASE_ADMIN_SENHA
//   ou SUPABASE_SERVICE_ROLE_KEY (Dashboard -> Settings -> API)
//
// A service role key ignora RLS por completo e nunca deve ir para o .env do
// front, que é publicado no bundle.

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const BUCKET = 'banners';
const LARGURA_MAXIMA = 1920;
const QUALIDADE = 80;

// Abaixo disso não vale reencodar: o ganho é pequeno e a imagem perde um
// pouco de qualidade à toa.
const TAMANHO_MINIMO = 200 * 1024;

// Sufixo que marca o que este script já produziu, para uma segunda execução
// não recomprimir o próprio resultado.
const SUFIXO = '-comprimida.webp';

// Todas as tabelas de conteúdo. As que não existirem são ignoradas com aviso,
// para o script não quebrar quando o schema mudar.
const TABELAS = [
  'banners',
  'banner_blog_lateral',
  'categorias',
  'contato_footer',
  'cursos_cadastrados',
  'cursos_destaque',
  'depoimentos',
  'diferenciais',
  'faqs',
  'home_carrossel_3d',
  'noticias',
  'selos',
  'sobre_galeria',
  'sobre_historia',
  'sobre_produto_destaque',
  'sobre_redes_sociais',
  'vagas',
];

const simular = process.argv.includes('--simular');

// Pergunta no terminal. Com `ocultar`, o que for digitado não aparece na tela.
//
// A senha é pedida aqui, e não lida de variável de ambiente, de propósito: no
// PowerShell um `$env:SENHA = "..."` fica no histórico do terminal e vale para
// a sessão inteira. Digitada aqui, ela existe só enquanto este processo roda.
function perguntar(texto, ocultar = false) {
  return new Promise((resolve) => {
    // O prompt é escrito antes de criar a interface para que o readline possa
    // ser silenciado logo em seguida sem engolir a própria pergunta.
    process.stdout.write(texto);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    if (ocultar) rl._writeToOutput = () => {};

    rl.question('', (resposta) => {
      rl.close();
      if (ocultar) process.stdout.write('\n');
      resolve(resposta.trim());
    });
  });
}

function lerEnv() {
  const arquivo = path.resolve(import.meta.dirname, '..', '.env');
  const texto = fs.existsSync(arquivo) ? fs.readFileSync(arquivo, 'utf8') : '';
  const env = {};
  for (const linha of texto.split(/\r?\n/)) {
    if (!linha.trim() || linha.trimStart().startsWith('#')) continue;
    const i = linha.indexOf('=');
    if (i > 0) env[linha.slice(0, i).trim()] = linha.slice(i + 1).trim();
  }
  return { ...env, ...process.env };
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function mb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// "https://x.supabase.co/storage/v1/object/public/banners/foo%20bar.png"
// vira "foo bar.png".
function chaveDaUrl(url) {
  const marca = `/${BUCKET}/`;
  const i = String(url).indexOf(marca);
  if (i === -1) return null;
  return decodeURIComponent(String(url).slice(i + marca.length).split('?')[0]);
}

function chaveComprimida(chave) {
  const ponto = chave.lastIndexOf('.');
  const base = ponto > 0 ? chave.slice(0, ponto) : chave;
  return base + SUFIXO;
}

async function conectar(env) {
  const url = env.VITE_SUPABASE_URL;
  if (!url) throw new Error('VITE_SUPABASE_URL não encontrada no .env');

  if (env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('Autenticando com a service role key.\n');
    return createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }

  const anon = env.VITE_SUPABASE_ANON_KEY;
  if (!anon) throw new Error('VITE_SUPABASE_ANON_KEY não encontrada no .env');
  const sb = createClient(url, anon, { auth: { persistSession: false } });

  // Simular não escreve nada, então a anon key basta e não há o que pedir.
  if (simular) {
    console.log('Somente leitura (anon key) — suficiente para --simular.\n');
    return sb;
  }

  let email = env.SUPABASE_ADMIN_EMAIL;
  let senha = env.SUPABASE_ADMIN_SENHA;

  if (!email || !senha) {
    if (!process.stdin.isTTY) {
      throw new Error(
        'Sem credencial de admin. As policies do bucket exigem is_admin().\n' +
          'Rode num terminal interativo, ou informe SUPABASE_SERVICE_ROLE_KEY.',
      );
    }

    console.log('Escrever no bucket exige a conta de admin do painel.');
    if (!email) email = await perguntar('  E-mail: ');
    if (!senha) senha = await perguntar('  Senha (não aparece enquanto digita): ', true);
    console.log('');
  }

  const { error } = await sb.auth.signInWithPassword({ email, password: senha });
  if (error) throw new Error(`Login de admin falhou: ${error.message}`);

  console.log(`Autenticado como ${email}.\n`);
  return sb;
}

// Devolve [{ tabela, id, colunas: { coluna: url } }]
async function mapearReferencias(sb) {
  const achados = [];

  for (const tabela of TABELAS) {
    const { data, error } = await sb.from(tabela).select('*');
    if (error) {
      console.log(`  (pulando ${tabela}: ${error.message})`);
      continue;
    }
    if (!data?.length) continue;

    for (const linha of data) {
      const colunas = {};
      for (const [coluna, valor] of Object.entries(linha)) {
        if (typeof valor === 'string' && chaveDaUrl(valor)) colunas[coluna] = valor;
      }
      if (Object.keys(colunas).length) {
        achados.push({ tabela, id: linha.id, colunas });
      }
    }
  }

  return achados;
}

async function main() {
  const env = lerEnv();
  const sb = await conectar(env);

  console.log('Lendo as tabelas de conteúdo...');
  const referencias = await mapearReferencias(sb);

  const { data: arquivos, error: erroLista } = await sb.storage
    .from(BUCKET)
    .list('', { limit: 10000 });
  if (erroLista) throw new Error(`Não consegui listar o bucket: ${erroLista.message}`);

  const tamanhoDe = new Map(
    arquivos.filter((a) => a.metadata?.size).map((a) => [a.name, a.metadata.size]),
  );

  // Uma mesma imagem pode estar referenciada em mais de uma linha; comprime
  // uma vez só e reaproveita a URL nova.
  const chavesUsadas = new Set();
  for (const ref of referencias) {
    for (const url of Object.values(ref.colunas)) chavesUsadas.add(chaveDaUrl(url));
  }

  const aFazer = [...chavesUsadas].filter((chave) => {
    if (chave.endsWith(SUFIXO)) return false; // já passou por aqui
    const tamanho = tamanhoDe.get(chave);
    return tamanho && tamanho > TAMANHO_MINIMO;
  });

  const totalAntes = aFazer.reduce((soma, chave) => soma + tamanhoDe.get(chave), 0);
  console.log(
    `\n${chavesUsadas.size} imagens referenciadas; ${aFazer.length} acima de ` +
      `${kb(TAMANHO_MINIMO)}, somando ${mb(totalAntes)}.\n`,
  );

  const novaUrlPara = new Map();
  let totalDepois = 0;

  for (const chave of aFazer) {
    const antes = tamanhoDe.get(chave);
    const destino = chaveComprimida(chave);

    const { data: blob, error: erroDownload } = await sb.storage.from(BUCKET).download(chave);
    if (erroDownload) {
      console.log(`  ! ${chave}: download falhou (${erroDownload.message})`);
      continue;
    }

    const original = Buffer.from(await blob.arrayBuffer());
    const { width } = await sharp(original).metadata();
    const comprimida = await sharp(original)
      .resize({ width: Math.min(width, LARGURA_MAXIMA), withoutEnlargement: true })
      .webp({ quality: QUALIDADE, effort: 6 })
      .toBuffer();

    if (comprimida.length >= antes) {
      console.log(`  = ${chave} (já estava enxuta)`);
      continue;
    }

    const corte = (100 - (comprimida.length / antes) * 100).toFixed(0);
    console.log(
      `  ${simular ? '~' : '✓'} ${chave}\n      ${kb(antes)} → ${kb(comprimida.length)} (-${corte}%)`,
    );
    totalDepois += comprimida.length;

    if (simular) {
      novaUrlPara.set(chave, '(simulado)');
      continue;
    }

    const { error: erroUpload } = await sb.storage.from(BUCKET).upload(destino, comprimida, {
      contentType: 'image/webp',
      upsert: true,
    });
    if (erroUpload) {
      console.log(`  ! ${chave}: upload falhou (${erroUpload.message})`);
      continue;
    }

    const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(destino);
    novaUrlPara.set(chave, urlData.publicUrl);
  }

  // Só agora o banco é tocado, e só para as imagens que subiram com sucesso.
  let linhasAtualizadas = 0;
  for (const ref of referencias) {
    const mudancas = {};
    for (const [coluna, url] of Object.entries(ref.colunas)) {
      const nova = novaUrlPara.get(chaveDaUrl(url));
      if (nova) mudancas[coluna] = nova;
    }
    if (!Object.keys(mudancas).length) continue;

    // Na simulação a contagem é o que interessa; o valor guardado é só o
    // marcador '(simulado)' e nunca chega ao banco.
    if (simular) {
      linhasAtualizadas++;
      continue;
    }

    const { error } = await sb.from(ref.tabela).update(mudancas).eq('id', ref.id);
    if (error) {
      console.log(`  ! ${ref.tabela}#${ref.id}: update falhou (${error.message})`);
      continue;
    }
    linhasAtualizadas++;
  }

  console.log(
    `\n${simular ? '[SIMULAÇÃO] ' : ''}${mb(totalAntes)} → ${mb(totalDepois)}` +
      (totalAntes ? ` (-${(100 - (totalDepois / totalAntes) * 100).toFixed(0)}%)` : '') +
      `\n${linhasAtualizadas} linhas ${simular ? 'seriam atualizadas' : 'atualizadas'}.`,
  );

  console.log(
    simular
      ? '\nNada foi escrito. Rode sem --simular para aplicar.'
      : '\nOs arquivos originais continuam no bucket, intactos.',
  );
}

main().catch((erro) => {
  console.error(`\n${erro.message}`);
  process.exit(1);
});
