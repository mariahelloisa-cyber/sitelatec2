import ListaCursos from './ListaCursos';
import heroTecnicos from '../assets/bannertecnico.png';

// Página do tipo "Técnicos": mesma estrutura do catálogo, sem as abas de
// filtro e com a sua própria hero.
export default function CursosTecnicos() {
  return (
    <ListaCursos
      hero={{
        tag: 'Cursos Técnicos',
        tituloInicio: 'Cursos ',
        tituloDestaque: 'Técnicos',
        imagem: heroTecnicos,
      }}
      categoriasPermitidas={['Técnicos']}
      tituloListagem="CURSOS TÉCNICOS"
    />
  );
}
