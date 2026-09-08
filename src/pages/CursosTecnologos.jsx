import ListaCursos from './ListaCursos';
import heroTecnologos from '../assets/fundoo.webp';

// Página do tipo "Tecnólogos": mesma estrutura do catálogo, sem as abas de
// filtro e com a sua própria hero.
export default function CursosTecnologos() {
  return (
    <ListaCursos
      hero={{
        tag: 'Cursos Tecnólogos',
        tituloInicio: 'Cursos ',
        tituloDestaque: 'Tecnólogos',
        imagem: heroTecnologos,
      }}
      categoriasPermitidas={['Tecnólogos']}
      tituloListagem="CURSOS TECNÓLOGOS"
    />
  );
}
