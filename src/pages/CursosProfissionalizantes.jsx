import ListaCursos from './ListaCursos';
import heroProfissionalizantes from '../assets/bannerprofissional.png';

// Página do tipo "Profissionalizantes": reúne as três faixas (comuns,
// avançados e premium), sem as abas de filtro e com a sua própria hero.
export default function CursosProfissionalizantes() {
  return (
    <ListaCursos
      hero={{
        tag: 'Cursos Profissionalizantes',
        tituloInicio: 'Cursos ',
        tituloDestaque: 'Profissionalizantes',
        imagem: heroProfissionalizantes,
      }}
      categoriasPermitidas={[
        'Profissionalizantes comuns',
        'Profissionalizantes avançados',
        'Profissionalizantes premium',
      ]}
      mostrarFiltroCategoria
      tituloListagem="CURSOS PROFISSIONALIZANTES"
    />
  );
}
