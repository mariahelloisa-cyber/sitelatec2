// Quem emite o certificado depende do tipo do curso:
//   Técnicos            -> LATec (certificação própria)
//   Profissionalizantes -> LA Educação
//   Tecnólogos          -> Unicive
//
// Fonte única: mudou a certificadora de algum tipo, muda só aqui.

export const CERTIFICADORA_LATEC = 'LATec';
export const CERTIFICADORA_PROFISSIONALIZANTES = 'LA Educação';
export const CERTIFICADORA_TECNOLOGOS = 'Unicive';

// Remove acentos sem depender de caracteres combinantes literais no código
const REGEX_ACENTOS = new RegExp('[\\u0300-\\u036f]', 'g');

function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(REGEX_ACENTOS, '')
    .toLowerCase()
    .trim();
}

// Nome de quem emite o certificado de um curso, a partir da categoria dele.
// Retorna null quando a categoria não é reconhecida.
export function certificadoraDaCategoria(categoria) {
  const chave = normalizar(categoria);
  if (!chave) return null;
  if (chave.startsWith('tecnico')) return CERTIFICADORA_LATEC;
  if (chave.startsWith('tecnologo')) return CERTIFICADORA_TECNOLOGOS;
  if (chave.startsWith('profissionalizante')) return CERTIFICADORA_PROFISSIONALIZANTES;
  return null;
}

// A LATec certifica só os técnicos — é o que decide, por exemplo, se o selo
// SISTEC pode aparecer no curso.
export function certificadoPelaLatec(categoria) {
  return certificadoraDaCategoria(categoria) === CERTIFICADORA_LATEC;
}

// Nome da certificadora só quando ela NÃO é a LATec. Nos técnicos a
// certificação é nossa, então não há parceira a informar.
export function certificadoraParceira(categoria) {
  const certificadora = certificadoraDaCategoria(categoria);
  if (!certificadora || certificadora === CERTIFICADORA_LATEC) return null;
  return certificadora;
}

// Ressalva de transparência, exibida apenas nos cursos de parceiro.
export function textoCertificacao(categoria) {
  const parceira = certificadoraParceira(categoria);
  if (!parceira) return null;
  return `A certificação deste curso é emitida por ${parceira}, instituição parceira, e não pela LATec.`;
}

export const TEXTO_RESSALVA_TECNOLOGOS =
  `Os cursos de Tecnólogo não são certificados pela LATec: a certificação é emitida pela ${CERTIFICADORA_TECNOLOGOS}, instituição parceira.`;
