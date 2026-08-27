// Converte o texto digitado no admin em uma grade curricular estruturada.
//
// Formato esperado:
//   1º Semestre
//   Matemática Básica | 60h
//   Português Instrumental | 40h
//
//   2º Semestre
//   Cálculo I | 80h
//
// Linhas sem "|" iniciam um novo semestre. Linhas com "nome | horas"
// são as disciplinas desse semestre.
export function parseGradeCurricular(texto) {
  if (!texto) return [];

  const linhas = texto
    .split('\n')
    .map((linha) => linha.trim())
    .filter((linha) => linha.length > 0);

  const semestres = [];
  let atual = null;

  for (const linha of linhas) {
    if (linha.includes('|')) {
      if (!atual) {
        atual = { titulo: 'Disciplinas', disciplinas: [] };
        semestres.push(atual);
      }
      const [nome, horas] = linha.split('|').map((parte) => parte.trim());
      if (nome) atual.disciplinas.push({ nome, horas: horas || '' });
    } else {
      atual = { titulo: linha, disciplinas: [] };
      semestres.push(atual);
    }
  }

  return semestres.filter((semestre) => semestre.disciplinas.length > 0);
}

// Converte a grade estruturada (usada no formulário do admin) de volta para o
// texto no formato "1º Semestre\nDisciplina | horas\n\n2º Semestre\n...",
// que é o formato salvo no banco e lido por parseGradeCurricular.
export function serializeGradeCurricular(semestres) {
  if (!Array.isArray(semestres)) return '';

  return semestres
    .map((semestre) => {
      const disciplinas = (semestre.disciplinas || []).filter((d) => (d.nome || '').trim());
      if (!semestre.titulo?.trim() && disciplinas.length === 0) return '';

      const linhas = [semestre.titulo?.trim() || 'Disciplinas'];
      disciplinas.forEach((d) => {
        linhas.push(`${d.nome.trim()} | ${(d.horas || '').trim()}`);
      });
      return linhas.join('\n');
    })
    .filter(Boolean)
    .join('\n\n');
}
