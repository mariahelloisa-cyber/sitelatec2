import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // <-- Importação do Supabase
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ParticleText from '../components/ParticleText';

// Configuração da seção "Acompanhe a LATec" (redes sociais) da página Sobre Nós
const REDES_SOCIAIS_SOBRE_CONFIG = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'reclameaqui', label: 'Reclame Aqui' },
  { key: 'google', label: 'Google Meu Negócio' },
];

// Campos da galeria "Nosso Espaço" da página Sobre Nós (9 fotos fixas)
const GALERIA_SOBRE_CAMPOS = Array.from({ length: 9 }, (_, i) => `imagem_${i + 1}`);

export default function Inicio() {
  const SENHA_ADMIN_DEFINIDA = "123456"; // <-- MUDAS AQUI A TUA SENHA DO PAINEL!

  // --- Estados do Painel Administrativo Embutido ---
  const [modoAdmin, setModoAdmin] = useState(false);
  const [abaAdmin, setAbaAdmin] = useState('dashboard'); // aba ativa do painel admin
  const [novoTitulo, setNovoTitulo] = useState("");
  const [mensagemStatus, setMensagemStatus] = useState("");
  useEffect(() => {
    // Lê a chave mágica que veio da tela de login
    const isPainelLiberado = localStorage.getItem('painel_liberado');
    if (isPainelLiberado === 'true') {
      setModoAdmin(true); // O ecrã fica preto e abre o painel automaticamente!
      localStorage.removeItem('painel_liberado'); // Apaga a chave logo a seguir para não prender o site
    }
  }, []);

  // --- Estado para os Banners Dinâmicos do Supabase ---
  const [banners, setBanners] = useState([]);
  const [indexAtual, setIndexAtual] = useState(0);
  // --- Estados para o Formulário de Depoimentos ---
  const [novoNomeAluno, setNovoNomeAluno] = useState("");
  const [novoInstagram, setNovoInstagram] = useState("");
  const [novoVideoUrl, setNovoVideoUrl] = useState("");
  const [novoNomeSelo, setNovoNomeSelo] = useState("");
  const [novoTituloDiferencial, setNovoTituloDiferencial] = useState("");
  const [novaNoticiaDestaque, setNovaNoticiaDestaque] = useState(false);
  const [novoTempoLeitura, setNovoTempoLeitura] = useState("");
  // --- Estados para Edição de Notícias ---
  const [noticiaEditando, setNoticiaEditando] = useState(null); // Armazena o ID ou objeto da notícia que está sendo editada
  const [editTitulo, setEditTitulo] = useState("");
  const [editResumo, setEditResumo] = useState("");
  const [editCorpo, setEditCorpo] = useState("");
  const [editTempoLeitura, setEditTempoLeitura] = useState("");
  const [editDestaque, setEditDestaque] = useState(false);
  // --- Estados para o Gerenciador de FAQ ---
  const [faqsAdmin, setFaqsAdmin] = useState([]);
  const [novaPerguntafaq, setNovaPerguntaFaq] = useState("");
  const [novaRespostafaq, setNovaRespostaFaq] = useState("");
  const [novoTopicofaq, setNovoTopicofaq] = useState("Geral");
  // --- Estados para o Gerenciador de Vagas ---
  const [vagasAdmin, setVagasAdmin] = useState([]);
  const [novaVagaTitulo, setNovaVagaTitulo] = useState("");
  const [novaVagaDepartamento, setNovaVagaDepartamento] = useState("");
  const [novaVagaLocalizacao, setNovaVagaLocalizacao] = useState("");
  const [novaVagaTipoContrato, setNovaVagaTipoContrato] = useState("CLT");
  const [novaVagaDescricao, setNovaVagaDescricao] = useState("");
  const [novaVagaLink, setNovaVagaLink] = useState("");
  
  
  // --- Estados para as restantes seções (agora 100% Supabase) ---
  const [listaSelos, setListaSelos] = useState([]);
  const [listaDiferenciais, setListaDiferenciais] = useState([]);
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const [cursosDestaque, setCursosDestaque] = useState([]);
  const [noticiasDestaque, setNoticiasDestaque] = useState([]);
  const [bannerLateral, setBannerLateral] = useState(null);
  const [fotoHistoria, setFotoHistoria] = useState(null);
  const [depoimentos, setDepoimentos] = useState([]);

  // --- Estados para o Contato e Redes Sociais do Rodapé (editável no Admin) ---
  const [contatoFooterForm, setContatoFooterForm] = useState({
    endereco_linha1: "",
    endereco_linha2: "",
    telefone: "",
    whatsapp_numero: "",
    email: "",
    instagram_url: "",
    facebook_url: "",
    linkedin_url: "",
  });

  // --- Estados para a Seção "Destaques" da página Sobre Nós (imagem + 8 tópicos) ---
  const [destaquesSobreForm, setDestaquesSobreForm] = useState({
    imagem_url: "",
    esquerda_1: "",
    esquerda_2: "",
    esquerda_3: "",
    esquerda_4: "",
    direita_1: "",
    direita_2: "",
    direita_3: "",
    direita_4: "",
  });

  // --- Estados para a Seção "Acompanhe a LATec" (redes sociais) da página Sobre Nós ---
  const [redesSociaisSobreForm, setRedesSociaisSobreForm] = useState(
    REDES_SOCIAIS_SOBRE_CONFIG.reduce((acc, { key }) => {
      acc[`${key}_imagem`] = "";
      acc[`${key}_link`] = "";
      return acc;
    }, {})
  );

  // --- Estados para a Galeria "Nosso Espaço" da página Sobre Nós (9 fotos) ---
  const [galeriaSobreForm, setGaleriaSobreForm] = useState(
    GALERIA_SOBRE_CAMPOS.reduce((acc, campo) => {
      acc[campo] = "";
      return acc;
    }, {})
  );

  // --- Estados para o Formulário de Contato (leva para o WhatsApp) ---
  const [contatoForm, setContatoForm] = useState({ nome: "", email: "", telefone: "", curso: "", mensagem: "" });
  const [contatoStatus, setContatoStatus] = useState("idle"); // idle | sucesso | erro

  function handleContatoChange(e) {
    const { name, value } = e.target;
    setContatoForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleContatoSubmit(e) {
    e.preventDefault();

    if (!contatoForm.nome.trim() || !contatoForm.email.trim() || !contatoForm.mensagem.trim()) {
      setContatoStatus("erro");
      return;
    }

    const linhas = [
      "Novo contato pelo site da LATec:",
      `Nome: ${contatoForm.nome}`,
      `E-mail: ${contatoForm.email}`,
      contatoForm.telefone.trim() && `Telefone: ${contatoForm.telefone}`,
      contatoForm.curso.trim() && `Curso desejado: ${contatoForm.curso}`,
      `Mensagem: ${contatoForm.mensagem}`,
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/5527998392172?text=${encodeURIComponent(linhas)}`, "_blank");

    setContatoStatus("sucesso");
    setContatoForm({ nome: "", email: "", telefone: "", curso: "", mensagem: "" });
  }

  const [novoTituloNoticia, setNovoTituloNoticia] = useState("");
const [novoResumoNoticia, setNovoResumoNoticia] = useState("");
const [novoCorpoNoticia, setNovoCorpoNoticia] = useState("");

  // --- Estados para o Gerenciador de Cursos em Destaque ---
  const [novoTituloCursoDestaque, setNovoTituloCursoDestaque] = useState("");
  const [novoResumoCursoDestaque, setNovoResumoCursoDestaque] = useState("");
  const [novaDuracaoCursoDestaque, setNovaDuracaoCursoDestaque] = useState("");
  const [novaCategoriaCursoDestaque, setNovaCategoriaCursoDestaque] = useState("");
  // --- Estado para o Gerenciador do Banner Lateral do Blog ---
  const [novoLinkBannerLateral, setNovoLinkBannerLateral] = useState("");

  // --- Estados para o Gerenciador de Cursos Cadastrados (cards com página de detalhe) ---
  const [cursosCadastrados, setCursosCadastrados] = useState([]);
  const [cursoCadEditando, setCursoCadEditando] = useState(null);
  const [novoTituloCursoCad, setNovoTituloCursoCad] = useState("");
  const [novaDescricaoCursoCad, setNovaDescricaoCursoCad] = useState("");
  const [novaCategoriaCursoCad, setNovaCategoriaCursoCad] = useState("");
  const [novoPrecoCursoCad, setNovoPrecoCursoCad] = useState("");
  const [novoPrecoOriginalCursoCad, setNovoPrecoOriginalCursoCad] = useState("");
  const [novaDuracaoCursoCad, setNovaDuracaoCursoCad] = useState("");
  const [novaCargaHorariaCursoCad, setNovaCargaHorariaCursoCad] = useState("");
  const [novoSeloMecCursoCad, setNovoSeloMecCursoCad] = useState(false);
  const [novaGradeCurricularCursoCad, setNovaGradeCurricularCursoCad] = useState("");
  const [novosBlocosConteudoCursoCad, setNovosBlocosConteudoCursoCad] = useState("");

  // 1. Buscar Banners do SUPABASE (Substituindo o Hero do Strapi)
  async function buscarBannersDoSupabase() {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setBanners(data || []);
    } catch (err) {
      console.error("Erro na conexão com os banners do Supabase:", err);
    }
  }

  useEffect(() => {
    buscarBannersDoSupabase();
  }, []);

  // Função para Adicionar um Novo Banner pelo Painel
  // Nova função para fazer upload do arquivo e salvar na tabela
  // Nova função para fazer upload do arquivo direto do PC e salvar
  async function handleAdicionarBanner(e) {
    e.preventDefault();
    const arquivoInput = document.getElementById('arquivo-banner');
    const arquivo = arquivoInput?.files[0];

    if (!arquivo) {
      setMensagemStatus("⚠️ Por favor, selecione um arquivo de imagem!");
      return;
    }

    try {
      setMensagemStatus("⏳ Fazendo upload da imagem...");
      const nomeArquivo = `${Date.now()}-${arquivo.name}`;

      // 1. Envia o arquivo para a pasta (Bucket) do Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('banners')
        .upload(nomeArquivo, arquivo);

      if (uploadError) throw uploadError;

      // 2. Pega o link público gerado
      const { data: urlData } = supabase.storage
        .from('banners')
        .getPublicUrl(nomeArquivo);

      // 3. Salva o link final e o título na tabela
      const { error: insertError } = await supabase.from('banners').insert([
        { titulo: novoTitulo, imagem_url: urlData.publicUrl }
      ]);

      if (insertError) throw insertError;

      setMensagemStatus("✅ Banner publicado com sucesso!");
      setNovoTitulo("");
      if (arquivoInput) arquivoInput.value = ""; 
      buscarBannersDoSupabase(); 
    } catch (err) {
      setMensagemStatus("❌ Erro no processo: " + err.message);
    }
  }

  // Função para Adicionar um Novo Selo com Upload de Logo
  async function handleAdicionarSelo(e) {
    e.preventDefault();
    const arquivoInput = document.getElementById('imagem-selo');
    const arquivo = arquivoInput?.files[0];

    if (!novoNomeSelo.trim()) {
      setMensagemStatus("⚠️ O nome do selo é obrigatório!");
      return;
    }
    if (!arquivo) {
      setMensagemStatus("⚠️ Por favor, selecione uma imagem para o selo!");
      return;
    }

    try {
      setMensagemStatus("⏳ Guardando selo e fazendo upload da imagem...");
      const nomeArquivo = `selo-${Date.now()}-${arquivo.name}`;

      // 1. Upload da imagem para o bucket 'banners'
      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(nomeArquivo, arquivo);

      if (uploadError) throw uploadError;

      // 2. Pega a URL pública do selo
      const { data: urlData } = supabase.storage
        .from('banners')
        .getPublicUrl(nomeArquivo);

      // 3. Insere na tabela 'selos' do Supabase
      const { error: insertError } = await supabase.from('selos').insert([
        { 
          nome: novoNomeSelo, 
          imagem_url: urlData.publicUrl 
        }
      ]);

      if (insertError) throw insertError;

      setMensagemStatus("✅ Selo publicado com sucesso!");
      setNovoNomeSelo("");
      if (arquivoInput) arquivoInput.value = "";
      buscarSelosDoSupabase(); // Atualiza a esteira na hora!
    } catch (err) {
      setMensagemStatus("❌ Erro ao salvar selo: " + err.message);
    }
  }

  // Função para Eliminar um Selo
  async function handleEliminarSelo(id) {
    if (!window.confirm("Tem a certeza que quer eliminar este selo?")) return;
    try {
      const { error } = await supabase.from('selos').delete().eq('id', id);
      if (error) throw error;
      buscarSelosDoSupabase();
    } catch (err) {
      alert("Erro ao eliminar selo: " + err.message);
    }
  }
  
  // Função para Eliminar um Banner pelo Painel
  async function handleEliminarBanner(id) {
    if (!window.confirm("Tens a certeza que queres eliminar este banner?")) return;

    try {
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (error) throw error;
      buscarBannersDoSupabase();
    } catch (err) {
      alert("Erro ao eliminar: " + err.message);
    }
  }
  

  // Função para Adicionar um Novo Diferencial com Upload
  async function handleAdicionarDiferencial(e) {
    e.preventDefault();
    const arquivoInput = document.getElementById('imagem-diferencial');
    const arquivo = arquivoInput?.files[0];

    if (!novoTituloDiferencial.trim()) {
      setMensagemStatus("⚠️ O título do diferencial é obrigatório!");
      return;
    }
    if (!arquivo) {
      setMensagemStatus("⚠️ Por favor, selecione uma imagem para o diferencial!");
      return;
    }

    try {
      setMensagemStatus("⏳ Guardando diferencial e fazendo upload da imagem...");
      const nomeArquivo = `diferencial-${Date.now()}-${arquivo.name}`;

      // 1. Upload da imagem para o bucket 'banners'
      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(nomeArquivo, arquivo);

      if (uploadError) throw uploadError;

      // 2. Pega a URL pública gerada
      const { data: urlData } = supabase.storage
        .from('banners')
        .getPublicUrl(nomeArquivo);

      // 3. Insere o registo final na tabela do Supabase
      const { error: insertError } = await supabase.from('diferenciais').insert([
        { 
          titulo: novoTituloDiferencial, 
          imagem_url: urlData.publicUrl 
        }
      ]);

      if (insertError) throw insertError;

      setMensagemStatus("✅ Diferencial publicado com sucesso!");
      setNovoTituloDiferencial("");
      if (arquivoInput) arquivoInput.value = "";
      buscarDiferenciaisDoSupabase(); // Atualiza a secção no site imediatamente!
    } catch (err) {
      setMensagemStatus("❌ Erro ao salvar diferencial: " + err.message);
    }
  }

  // Função para Eliminar um Diferencial (Versão Segura)
  async function handleEliminarDiferencial(id) {
    if (!window.confirm("Tem a certeza que quer eliminar este diferencial?")) return;
    try {
      const { data, error } = await supabase
        .from('diferenciais')
        .delete()
        .eq('id', id)
        .select();
        
      if (error) throw error;

      if (!data || data.length === 0) {
        alert("⚠️ O diferencial não foi eliminado! Verifique as diretrizes de RLS no SQL Editor.");
        return;
      }

      alert("✅ Diferencial eliminado com sucesso!");
      buscarDiferenciaisDoSupabase();
    } catch (err) {
      alert("❌ Erro ao eliminar diferencial: " + err.message);
    }
  }

// Função para Adicionar Notícia
// Função para Adicionar Notícia Corrigida
async function handleAdicionarNoticia(e) {
  e.preventDefault();
  const arquivoInput = document.getElementById('imagem-noticia');
  const arquivo = arquivoInput?.files[0];

  if (!novoTituloNoticia.trim() || !novoResumoNoticia.trim() || !arquivo) {
    setMensagemStatus("⚠️ Preencha todos os campos e selecione uma imagem!");
    return;
  }

  try {
    setMensagemStatus("⏳ Publicando notícia...");
    const nomeArquivo = `noticia-${Date.now()}-${arquivo.name}`;

    await supabase.storage.from('banners').upload(nomeArquivo, arquivo);
    const { data: urlData } = supabase.storage.from('banners').getPublicUrl(nomeArquivo);

    const { error } = await supabase.from('noticias').insert([
      {
        titulo: novoTituloNoticia,
        resumo: novoResumoNoticia,
        corpo: novoCorpoNoticia,
        imagem_url: urlData.publicUrl,
        destaque: novaNoticiaDestaque,
        tempo_leitura: parseInt(novoTempoLeitura) || 3
      }
    ]);

    if (error) throw error;

    setMensagemStatus("✅ Notícia publicada com sucesso!");
    setNovoTituloNoticia("");
    setNovoResumoNoticia("");
    setNovoCorpoNoticia("");
    setNovoTempoLeitura(""); // <-- Limpa o tempo de leitura
    setNovaNoticiaDestaque(false);
    if (arquivoInput) arquivoInput.value = "";

    // Recarrega a lista instantaneamente na tela
    const { data: newData } = await supabase.from('noticias').select('*').order('created_at', { ascending: false });
    setNoticiasDestaque((newData || []).map(item => ({
      id: item.id,
      titulo: item.titulo,
      resumo: item.resumo,
      corpo: item.corpo,
      fotoUrl: item.imagem_url,
      destaque: item.destaque,
      tempoLeitura: item.tempo_leitura || 3,
      dataCriacao: new Date(item.created_at).toLocaleDateString('pt-PT')
    })));
  } catch (err) {
    setMensagemStatus("❌ Erro: " + err.message);
  }
}

// Função para Deletar Notícia
async function handleEliminarNoticia(id) {
  if (!window.confirm("Tem a certeza que quer eliminar esta notícia?")) return;
  try {
    const { error } = await supabase.from('noticias').delete().eq('id', id);
    if (error) throw error;
    setNoticiasDestaque(prev => prev.filter(n => n.id !== id));
  } catch (err) {
    alert("Erro ao eliminar notícia: " + err.message);
  }
}

// Carrega as FAQs existentes para exibir no painel admin
  async function buscarFaqsAdmin() {
    const { data } = await supabase.from('faqs').select('*').order('created_at', { ascending: false });
    if (data) setFaqsAdmin(data);
  }

  // Executa a busca assim que o modo admin for aberto
  useEffect(() => {
    if (modoAdmin) {
      buscarFaqsAdmin();
      buscarVagasAdmin();
    }
  }, [modoAdmin]);

  // --- FUNÇÕES DE VAGAS ---
  async function buscarVagasAdmin() {
    const { data } = await supabase.from('vagas').select('*').order('created_at', { ascending: false });
    if (data) setVagasAdmin(data);
  }

  async function handleAdicionarVaga(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    
    if (!novaVagaTitulo.trim() || !novaVagaDescricao.trim()) {
      alert("⚠️ Por favor, preenche o Título e a Descrição da vaga!");
      return;
    }

    try {
      const { error } = await supabase.from('vagas').insert([{ 
        titulo: novaVagaTitulo, 
        departamento: novaVagaDepartamento,
        localizacao: novaVagaLocalizacao,
        tipo_contrato: novaVagaTipoContrato,
        descricao: novaVagaDescricao,
        link_formulario: novaVagaLink
      }]);

      if (error) throw error;

      // Limpar campos
      setNovaVagaTitulo(""); setNovaVagaDepartamento(""); setNovaVagaLocalizacao("");
      setNovaVagaTipoContrato("CLT"); setNovaVagaDescricao(""); setNovaVagaLink("");
      
      alert("✅ Vaga adicionada com sucesso!");
      buscarVagasAdmin();
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao adicionar vaga: " + err.message);
    }
  }

  async function handleDeletarVaga(id) {
    if (!window.confirm("Tem a certeza que deseja excluir esta vaga?")) return;
    try {
      const { error } = await supabase.from('vagas').delete().eq('id', id);
      if (error) throw error;
      alert("✅ Vaga removida!");
      buscarVagasAdmin();
    } catch (err) {
      console.error(err);
    }
  }
  // Função para cadastrar uma nova FAQ
 // Função para cadastrar uma nova FAQ
  async function handleAdicionarFaq(e) {
    e.preventDefault();
    
    if (!novaPerguntafaq.trim() || !novaRespostafaq.trim()) {
      alert("⚠️ Por favor, preenche a Pergunta e a Resposta!");
      return;
    }

    try {
      const { error } = await supabase
        .from('faqs')
        .insert([{ 
          pergunta: novaPerguntafaq, 
          resposta: novaRespostafaq, 
          topico: novoTopicofaq 
        }]);

      if (error) {
        console.error("Erro do Supabase:", error);
        alert("❌ Erro ao guardar na base de dados: " + error.message);
        return;
      }

      // Limpa os campos após o sucesso
      setNovaPerguntaFaq("");
      setNovaRespostaFaq("");
      
      // Alerta de sucesso bem no meio do ecrã
      alert("✅ FAQ adicionada com sucesso!");
      
      // Atualiza a lista imediatamente
      buscarFaqsAdmin();
    } catch (err) {
      console.error(err);
      alert("❌ Ocorreu um erro inesperado: " + err.message);
    }
  }

  // Função para deletar uma FAQ
  async function handleDeletarFaq(id) {
    if (!confirm("Tem certeza que deseja excluir esta pergunta?")) return;
    try {
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) throw error;
      setMensagemStatus("FAQ removida!");
      buscarFaqsAdmin();
    } catch (err) {
      console.error(err);
    }
  }

// --- FUNÇÃO PARA CARREGAR OS DADOS NO FORMULÁRIO DE EDIÇÃO ---
  function iniciarEdicaoNoticia(noticia) {
    setNoticiaEditando(noticia.id);
    setEditTitulo(noticia.titulo);
    setEditResumo(noticia.resumo);
    setEditCorpo(noticia.corpo || "");
    setEditTempoLeitura(noticia.tempoLeitura || 3);
    setEditDestaque(noticia.destaque || false);
    // Faz scroll suave até o formulário para facilitar a visualização do usuário
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }

  // --- FUNÇÃO PARA SALVAR A NOTÍCIA EDITADA NO SUPABASE ---
  async function handleSalvarEdicaoNoticia(e) {
    e.preventDefault();

    if (!editTitulo.trim() || !editResumo.trim()) {
      setMensagemStatus("⚠️ Por favor, preencha o título e o subtítulo!");
      return;
    }

    try {
      setMensagemStatus("⏳ Atualizando notícia...");
      const arquivoInput = document.getElementById('imagem-noticia-edit');
      const arquivo = arquivoInput?.files[0];
      let urlImagemFinal = null;

      // Se o usuário selecionou uma nova imagem, faz o upload dela
      if (arquivo) {
        const nomeArquivo = `noticia-${Date.now()}-${arquivo.name}`;
        const { error: uploadError } = await supabase.storage
          .from('banners')
          .upload(nomeArquivo, arquivo);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('banners')
          .getPublicUrl(nomeArquivo);
          
        urlImagemFinal = urlData.publicUrl;
      }

      // Prepara os dados para atualização
      const dadosAtualizados = {
        titulo: editTitulo,
        resumo: editResumo,
        corpo: editCorpo,
        destaque: editDestaque,
        tempo_leitura: parseInt(editTempoLeitura) || 3
      };

      // Se uma nova imagem foi carregada, atualiza o campo de URL
      if (urlImagemFinal) {
        dadosAtualizados.imagem_url = urlImagemFinal;
      }

      // Atualiza o registro na tabela 'noticias'
      const { data: linhasAtualizadas, error: updateError } = await supabase
        .from('noticias')
        .update(dadosAtualizados)
        .eq('id', noticiaEditando)
        .select();

      if (updateError) throw updateError;

      if (!linhasAtualizadas || linhasAtualizadas.length === 0) {
        setMensagemStatus("⚠️ A notícia não foi atualizada! Verifique as diretrizes de RLS (UPDATE) no SQL Editor do Supabase.");
        return;
      }

      setMensagemStatus("✅ Notícia atualizada com sucesso!");
      
      // Limpa os estados de edição
      setNoticiaEditando(null);
      setEditTitulo("");
      setEditResumo("");
      setEditCorpo("");
      setEditTempoLeitura("");
      setEditDestaque(false);
      if (arquivoInput) arquivoInput.value = "";

      // Atualiza a lista na interface imediatamente
      const { data: dataAtualizada } = await supabase
        .from('noticias')
        .select('*')
        .order('created_at', { ascending: false });

      if (dataAtualizada && dataAtualizada.length > 0) {
          setNoticiasDestaque(dataAtualizada.map(item => ({
            id: item.id,
            titulo: item.titulo,
            resumo: item.resumo,
            corpo: item.corpo,
            fotoUrl: item.imagem_url,
            destaque: item.destaque,
            // CORREÇÃO: Puxa o tempo de leitura do banco de dados (se não houver, assume 3)
            tempoLeitura: item.tempo_leitura || 3,
            dataCriacao: new Date(item.created_at).toLocaleDateString('pt-BR')
          })));
        }

    } catch (err) {
      setMensagemStatus("❌ Erro ao atualizar notícia: " + err.message);
    }
  }

  // Função para alternar o modo administrativo por Prompt de Senha
  function gerenciarAcessoAdmin() {
    if (modoAdmin) {
      setModoAdmin(false);
    } else {
      const senhaDigitada = prompt("Insira a senha de administrador para aceder ao painel:");
      if (senhaDigitada === SENHA_ADMIN_DEFINIDA) {
        setModoAdmin(true);
      } else if (senhaDigitada !== null) {
        alert("❌ Senha incorreta!");
      }
    }
  }

  // 2. Buscar Selos do SUPABASE (Substituindo o Strapi)
  async function buscarSelosDoSupabase() {
    try {
      const { data, error } = await supabase
        .from('selos')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setListaSelos(data || []);
    } catch (err) {
      console.error("Erro na conexão com os selos do Supabase:", err);
    }
  }

  useEffect(() => {
    buscarSelosDoSupabase();
  }, []);
  useEffect(() => {
    buscarSelosDoSupabase();
  }, []);

  // 3. Buscar Diferenciais do Strapi
  // 3. Buscar Diferenciais do SUPABASE (Substituindo o Strapi)
  async function buscarDiferenciaisDoSupabase() {
    try {
      const { data, error } = await supabase
        .from('diferenciais')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;

      // Adaptamos para manter compatibilidade exata com o carrossel do site que já usa '.fotoUrl'
      const dadosFormatados = (data || []).map(item => ({
        id: item.id,
        titulo: item.titulo,
        fotoUrl: item.imagem_url
      }));

      setListaDiferenciais(dadosFormatados);
    } catch (err) {
      console.error("Erro na conexão com os diferenciais do Supabase:", err);
    }
  }

  useEffect(() => {
    buscarDiferenciaisDoSupabase();
  }, []);

  // Banner Rotativo Automático do Supabase
  useEffect(() => {
    if (banners.length <= 1 || modoAdmin) return;
    const temporizador = setInterval(() => {
      setIndexAtual((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000); 
    return () => clearInterval(temporizador);
  }, [banners.length, modoAdmin]);

  const irParaEsquerda = () => {
    if (listaDiferenciais.length === 0) return;
    setIndiceAtivo((prev) => (prev === 0 ? listaDiferenciais.length - 1 : prev - 1));
  };

  const irParaDireita = () => {
    if (listaDiferenciais.length === 0) return;
    setIndiceAtivo((prev) => (prev === listaDiferenciais.length - 1 ? 0 : prev + 1));
  };

  const obterDadoDoCard = (posicaoFisica) => {
    if (listaDiferenciais.length === 0) return null;
    const deslocamento = posicaoFisica - 2;
    let indiceDado = (indiceAtivo + deslocamento) % listaDiferenciais.length;
    if (indiceDado < 0) indiceDado += listaDiferenciais.length;
    return listaDiferenciais[indiceDado];
  };

  // --- Cursos em Destaque (agora no Supabase) ---
  async function buscarCursosDestaqueDoSupabase() {
    try {
      const { data, error } = await supabase
        .from('cursos_destaque')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const cursosFormatados = (data || []).map(item => ({
        id: item.id,
        titulo: item.titulo || "Curso sem Título",
        resumo: item.resumo || "",
        duracao: item.duracao || "Curta Duração",
        categoria: (item.categoria || "Geral").toUpperCase(),
        fotoUrl: item.imagem_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600"
      }));
      setCursosDestaque(cursosFormatados);
    } catch (erro) {
      console.error("Erro ao carregar cursos em destaque:", erro);
    }
  }

  useEffect(() => {
    buscarCursosDestaqueDoSupabase();
  }, []);

  // Função para Adicionar um Novo Curso em Destaque com Upload de Imagem
  async function handleAdicionarCursoDestaque(e) {
    e.preventDefault();
    const arquivoInput = document.getElementById('imagem-curso-destaque');
    const arquivo = arquivoInput?.files[0];

    if (!novoTituloCursoDestaque.trim()) {
      setMensagemStatus("⚠️ O título do curso é obrigatório!");
      return;
    }

    try {
      setMensagemStatus("⏳ Guardando curso em destaque...");
      let imagemUrl = "";

      if (arquivo) {
        const nomeArquivo = `curso-destaque-${Date.now()}-${arquivo.name}`;
        const { error: uploadError } = await supabase.storage
          .from('banners')
          .upload(nomeArquivo, arquivo);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('banners')
          .getPublicUrl(nomeArquivo);
        imagemUrl = urlData.publicUrl;
      }

      const { error: insertError } = await supabase.from('cursos_destaque').insert([
        {
          titulo: novoTituloCursoDestaque,
          resumo: novoResumoCursoDestaque,
          duracao: novaDuracaoCursoDestaque,
          categoria: novaCategoriaCursoDestaque,
          imagem_url: imagemUrl
        }
      ]);

      if (insertError) throw insertError;

      setMensagemStatus("✅ Curso em destaque publicado com sucesso!");
      setNovoTituloCursoDestaque("");
      setNovoResumoCursoDestaque("");
      setNovaDuracaoCursoDestaque("");
      setNovaCategoriaCursoDestaque("");
      if (arquivoInput) arquivoInput.value = "";
      buscarCursosDestaqueDoSupabase();
    } catch (err) {
      setMensagemStatus("❌ Erro ao salvar curso em destaque: " + err.message);
    }
  }

  // Função para Eliminar um Curso em Destaque
  async function handleEliminarCursoDestaque(id) {
    if (!window.confirm("Tem a certeza que quer eliminar este curso em destaque?")) return;
    try {
      const { error } = await supabase.from('cursos_destaque').delete().eq('id', id);
      if (error) throw error;
      buscarCursosDestaqueDoSupabase();
    } catch (err) {
      alert("Erro ao eliminar curso em destaque: " + err.message);
    }
  }

  // Buscar Notícias do Supabase
  useEffect(() => {
    async function buscarNoticiasDoSupabase() {
    try {
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const dadosFormatados = (data || []).map(item => ({
        id: item.id,
        titulo: item.titulo,
        resumo: item.resumo,
        corpo: item.corpo,
        fotoUrl: item.imagem_url,
        destaque: item.destaque, // <-- Nova propriedade adicionada aqui
        tempoLeitura: item.tempo_leitura || 3,
        dataCriacao: new Date(item.created_at).toLocaleDateString('pt-PT')
      }));

      setNoticiasDestaque(dadosFormatados);
    } catch (err) {
      console.error("Erro ao buscar notícias do Supabase:", err);
    }
  }

    buscarNoticiasDoSupabase();
    buscarBannerLateralDoSupabase();
    buscarFotoHistoriaDoSupabase();
    buscarCursosCadastradosDoSupabase();
  }, []);

  // --- Banner Lateral do Blog (agora no Supabase) ---
  async function buscarBannerLateralDoSupabase() {
    try {
      const { data, error } = await supabase
        .from('banner_blog_lateral')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setBannerLateral({
          id: data.id,
          fotoUrl: data.imagem_url || "",
          link: data.link || "#"
        });
      } else {
        setBannerLateral(null);
      }
    } catch (erro) {
      console.error("Erro ao carregar banner lateral do blog:", erro);
    }
  }

  // Função para Adicionar/Substituir o Banner Lateral do Blog
  async function handleAdicionarBannerLateral(e) {
    e.preventDefault();
    const arquivoInput = document.getElementById('imagem-banner-lateral');
    const arquivo = arquivoInput?.files[0];

    if (!arquivo) {
      setMensagemStatus("⚠️ Por favor, selecione uma imagem para o banner lateral!");
      return;
    }

    try {
      setMensagemStatus("⏳ Fazendo upload do banner lateral...");
      const nomeArquivo = `banner-lateral-${Date.now()}-${arquivo.name}`;

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(nomeArquivo, arquivo);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('banners')
        .getPublicUrl(nomeArquivo);

      // Substitui o banner anterior (só existe um ativo por vez)
      if (bannerLateral?.id) {
        await supabase.from('banner_blog_lateral').delete().eq('id', bannerLateral.id);
      }

      const { error: insertError } = await supabase.from('banner_blog_lateral').insert([
        { imagem_url: urlData.publicUrl, link: novoLinkBannerLateral || "#" }
      ]);

      if (insertError) throw insertError;

      setMensagemStatus("✅ Banner lateral atualizado com sucesso!");
      setNovoLinkBannerLateral("");
      if (arquivoInput) arquivoInput.value = "";
      buscarBannerLateralDoSupabase();
    } catch (err) {
      setMensagemStatus("❌ Erro ao salvar banner lateral: " + err.message);
    }
  }

  // Função para Eliminar o Banner Lateral do Blog
  async function handleEliminarBannerLateral(id) {
    if (!window.confirm("Tem a certeza que quer eliminar o banner lateral?")) return;
    try {
      const { error } = await supabase.from('banner_blog_lateral').delete().eq('id', id);
      if (error) throw error;
      buscarBannerLateralDoSupabase();
    } catch (err) {
      alert("Erro ao eliminar banner lateral: " + err.message);
    }
  }

  // --- Contato e Redes Sociais do Rodapé ---
  async function buscarContatoFooterDoSupabase() {
    try {
      const { data, error } = await supabase
        .from('contato_footer')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setContatoFooterForm({
          endereco_linha1: data.endereco_linha1 || "",
          endereco_linha2: data.endereco_linha2 || "",
          telefone: data.telefone || "",
          whatsapp_numero: data.whatsapp_numero || "",
          email: data.email || "",
          instagram_url: data.instagram_url || "",
          facebook_url: data.facebook_url || "",
          linkedin_url: data.linkedin_url || "",
        });
      }
    } catch (err) {
      console.error("Erro ao carregar contato do rodapé:", err);
    }
  }

  useEffect(() => {
    buscarContatoFooterDoSupabase();
  }, []);

  function handleContatoFooterChange(e) {
    const { name, value } = e.target;
    setContatoFooterForm((prev) => ({ ...prev, [name]: value }));
  }

  // Salva sempre na mesma linha (id fixo = 1), pois é uma configuração única do site
  async function handleSalvarContatoFooter(e) {
    e.preventDefault();
    try {
      setMensagemStatus("⏳ Salvando informações de contato...");

      const { error } = await supabase
        .from('contato_footer')
        .upsert([{ id: 1, ...contatoFooterForm }], { onConflict: 'id' });

      if (error) throw error;

      setMensagemStatus("✅ Contato e redes sociais atualizados com sucesso!");
    } catch (err) {
      setMensagemStatus("❌ Erro ao salvar contato: " + err.message);
    }
  }

  // --- Seção "Destaques" da página Sobre Nós (imagem central + 8 tópicos) ---
  async function buscarDestaquesSobreDoSupabase() {
    try {
      const { data, error } = await supabase
        .from('sobre_produto_destaque')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setDestaquesSobreForm({
          imagem_url: data.imagem_url || "",
          esquerda_1: data.esquerda_1 || "",
          esquerda_2: data.esquerda_2 || "",
          esquerda_3: data.esquerda_3 || "",
          esquerda_4: data.esquerda_4 || "",
          direita_1: data.direita_1 || "",
          direita_2: data.direita_2 || "",
          direita_3: data.direita_3 || "",
          direita_4: data.direita_4 || "",
        });
      }
    } catch (err) {
      console.error("Erro ao carregar os destaques da página Sobre:", err);
    }
  }

  useEffect(() => {
    buscarDestaquesSobreDoSupabase();
  }, []);

  function handleDestaquesSobreChange(e) {
    const { name, value } = e.target;
    setDestaquesSobreForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSalvarDestaquesSobre(e) {
    e.preventDefault();
    try {
      setMensagemStatus("⏳ Salvando destaques da página Sobre Nós...");

      const arquivoInput = document.getElementById('imagem-destaques-sobre');
      const arquivo = arquivoInput?.files[0];
      let imagemUrlFinal = destaquesSobreForm.imagem_url;

      if (arquivo) {
        const nomeArquivo = `sobre-destaque-${Date.now()}-${arquivo.name}`;
        const { error: uploadError } = await supabase.storage.from('banners').upload(nomeArquivo, arquivo);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('banners').getPublicUrl(nomeArquivo);
        imagemUrlFinal = urlData.publicUrl;
      }

      const dadosFinais = { ...destaquesSobreForm, imagem_url: imagemUrlFinal };

      const { error } = await supabase
        .from('sobre_produto_destaque')
        .upsert([{ id: 1, ...dadosFinais }], { onConflict: 'id' });

      if (error) throw error;

      setDestaquesSobreForm(dadosFinais);
      if (arquivoInput) arquivoInput.value = "";
      setMensagemStatus("✅ Destaques da página Sobre Nós atualizados com sucesso!");
    } catch (err) {
      setMensagemStatus("❌ Erro ao salvar destaques: " + err.message);
    }
  }

  // --- Seção "Acompanhe a LATec" (redes sociais) da página Sobre Nós ---
  async function buscarRedesSociaisSobreDoSupabase() {
    try {
      const { data, error } = await supabase
        .from('sobre_redes_sociais')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setRedesSociaisSobreForm((prev) => {
          const novo = { ...prev };
          REDES_SOCIAIS_SOBRE_CONFIG.forEach(({ key }) => {
            novo[`${key}_imagem`] = data[`${key}_imagem`] || "";
            novo[`${key}_link`] = data[`${key}_link`] || "";
          });
          return novo;
        });
      }
    } catch (err) {
      console.error("Erro ao carregar as redes sociais da página Sobre:", err);
    }
  }

  useEffect(() => {
    buscarRedesSociaisSobreDoSupabase();
  }, []);

  function handleRedesSociaisSobreChange(e) {
    const { name, value } = e.target;
    setRedesSociaisSobreForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSalvarRedesSociaisSobre(e) {
    e.preventDefault();
    try {
      setMensagemStatus("⏳ Salvando redes sociais da página Sobre Nós...");

      const dadosFinais = { ...redesSociaisSobreForm };

      for (const { key } of REDES_SOCIAIS_SOBRE_CONFIG) {
        const arquivoInput = document.getElementById(`imagem-rede-${key}`);
        const arquivo = arquivoInput?.files[0];
        if (arquivo) {
          const nomeArquivo = `sobre-rede-${key}-${Date.now()}-${arquivo.name}`;
          const { error: uploadError } = await supabase.storage.from('banners').upload(nomeArquivo, arquivo);
          if (uploadError) throw uploadError;
          const { data: urlData } = supabase.storage.from('banners').getPublicUrl(nomeArquivo);
          dadosFinais[`${key}_imagem`] = urlData.publicUrl;
        }
      }

      const { error } = await supabase
        .from('sobre_redes_sociais')
        .upsert([{ id: 1, ...dadosFinais }], { onConflict: 'id' });

      if (error) throw error;

      setRedesSociaisSobreForm(dadosFinais);
      REDES_SOCIAIS_SOBRE_CONFIG.forEach(({ key }) => {
        const arquivoInput = document.getElementById(`imagem-rede-${key}`);
        if (arquivoInput) arquivoInput.value = "";
      });
      setMensagemStatus("✅ Redes sociais da página Sobre Nós atualizadas com sucesso!");
    } catch (err) {
      setMensagemStatus("❌ Erro ao salvar redes sociais: " + err.message);
    }
  }

  // --- Galeria "Nosso Espaço" da página Sobre Nós (9 fotos) ---
  async function buscarGaleriaSobreDoSupabase() {
    try {
      const { data, error } = await supabase
        .from('sobre_galeria')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setGaleriaSobreForm((prev) => {
          const novo = { ...prev };
          GALERIA_SOBRE_CAMPOS.forEach((campo) => {
            novo[campo] = data[campo] || "";
          });
          return novo;
        });
      }
    } catch (err) {
      console.error("Erro ao carregar a galeria da página Sobre:", err);
    }
  }

  useEffect(() => {
    buscarGaleriaSobreDoSupabase();
  }, []);

  async function handleSalvarGaleriaSobre(e) {
    e.preventDefault();
    try {
      setMensagemStatus("⏳ Salvando galeria da página Sobre Nós...");

      const dadosFinais = { ...galeriaSobreForm };

      for (const campo of GALERIA_SOBRE_CAMPOS) {
        const arquivoInput = document.getElementById(`imagem-galeria-${campo}`);
        const arquivo = arquivoInput?.files[0];
        if (arquivo) {
          const nomeArquivo = `sobre-galeria-${campo}-${Date.now()}-${arquivo.name}`;
          const { error: uploadError } = await supabase.storage.from('banners').upload(nomeArquivo, arquivo);
          if (uploadError) throw uploadError;
          const { data: urlData } = supabase.storage.from('banners').getPublicUrl(nomeArquivo);
          dadosFinais[campo] = urlData.publicUrl;
        }
      }

      const preenchidos = GALERIA_SOBRE_CAMPOS.filter((campo) => dadosFinais[campo]).length;
      if (preenchidos < 9) {
        setMensagemStatus(`⚠️ Faltam ${9 - preenchidos} foto(s). A galeria só é exibida quando as 9 estiverem preenchidas.`);
        return;
      }

      const { error } = await supabase
        .from('sobre_galeria')
        .upsert([{ id: 1, ...dadosFinais }], { onConflict: 'id' });

      if (error) throw error;

      setGaleriaSobreForm(dadosFinais);
      GALERIA_SOBRE_CAMPOS.forEach((campo) => {
        const arquivoInput = document.getElementById(`imagem-galeria-${campo}`);
        if (arquivoInput) arquivoInput.value = "";
      });
      setMensagemStatus("✅ Galeria da página Sobre Nós atualizada com sucesso!");
    } catch (err) {
      setMensagemStatus("❌ Erro ao salvar galeria: " + err.message);
    }
  }

  // --- Foto da Seção "Nossa História" (página Sobre Nós) ---
  async function buscarFotoHistoriaDoSupabase() {
    try {
      const { data, error } = await supabase
        .from('sobre_historia')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFotoHistoria({ id: data.id, fotoUrl: data.imagem_url || "" });
      } else {
        setFotoHistoria(null);
      }
    } catch (erro) {
      console.error("Erro ao carregar a foto de Nossa História:", erro);
    }
  }

  // Função para Adicionar/Substituir a Foto da Seção "Nossa História"
  async function handleAdicionarFotoHistoria(e) {
    e.preventDefault();
    const arquivoInput = document.getElementById('imagem-sobre-historia');
    const arquivo = arquivoInput?.files[0];

    if (!arquivo) {
      setMensagemStatus("⚠️ Por favor, selecione uma imagem!");
      return;
    }

    try {
      setMensagemStatus("⏳ Fazendo upload da foto de Nossa História...");
      const nomeArquivo = `sobre-historia-${Date.now()}-${arquivo.name}`;

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(nomeArquivo, arquivo);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('banners')
        .getPublicUrl(nomeArquivo);

      // Substitui a foto anterior (só existe uma ativa por vez)
      if (fotoHistoria?.id) {
        await supabase.from('sobre_historia').delete().eq('id', fotoHistoria.id);
      }

      const { error: insertError } = await supabase.from('sobre_historia').insert([
        { imagem_url: urlData.publicUrl }
      ]);

      if (insertError) throw insertError;

      setMensagemStatus("✅ Foto de Nossa História atualizada com sucesso!");
      if (arquivoInput) arquivoInput.value = "";
      buscarFotoHistoriaDoSupabase();
    } catch (err) {
      setMensagemStatus("❌ Erro ao salvar a foto: " + err.message);
    }
  }

  // Função para Eliminar a Foto da Seção "Nossa História"
  async function handleEliminarFotoHistoria(id) {
    if (!window.confirm("Tem a certeza que quer eliminar esta foto?")) return;
    try {
      const { error } = await supabase.from('sobre_historia').delete().eq('id', id);
      if (error) throw error;
      buscarFotoHistoriaDoSupabase();
    } catch (err) {
      alert("Erro ao eliminar a foto: " + err.message);
    }
  }

  // --- Cursos Cadastrados (cards com página de detalhe própria) ---
  async function buscarCursosCadastradosDoSupabase() {
    try {
      const { data, error } = await supabase
        .from('cursos_cadastrados')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCursosCadastrados(data || []);
    } catch (erro) {
      console.error("Erro ao carregar cursos cadastrados:", erro);
    }
  }

  // Função para Adicionar um Novo Curso Cadastrado
  async function handleAdicionarCursoCadastrado(e) {
    e.preventDefault();

    if (!novoTituloCursoCad.trim()) {
      setMensagemStatus("⚠️ Informe o título do curso!");
      return;
    }

    const inputImagem = document.getElementById('imagem-curso-cadastrado');
    const inputImagemCapa = document.getElementById('imagem-capa-curso-cadastrado');
    const arquivoImagem = inputImagem?.files[0];
    const arquivoImagemCapa = inputImagemCapa?.files[0];

    try {
      setMensagemStatus("⏳ Salvando curso...");

      let imagemUrl = "";
      if (arquivoImagem) {
        const nomeArquivo = `curso-${Date.now()}-${arquivoImagem.name}`;
        const { error: uploadError } = await supabase.storage.from('banners').upload(nomeArquivo, arquivoImagem);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('banners').getPublicUrl(nomeArquivo);
        imagemUrl = urlData.publicUrl;
      }

      let imagemCapaUrl = "";
      if (arquivoImagemCapa) {
        const nomeArquivoCapa = `curso-capa-${Date.now()}-${arquivoImagemCapa.name}`;
        const { error: uploadCapaError } = await supabase.storage.from('banners').upload(nomeArquivoCapa, arquivoImagemCapa);
        if (uploadCapaError) throw uploadCapaError;
        const { data: urlCapaData } = supabase.storage.from('banners').getPublicUrl(nomeArquivoCapa);
        imagemCapaUrl = urlCapaData.publicUrl;
      }

      const { error: insertError } = await supabase.from('cursos_cadastrados').insert([{
        titulo: novoTituloCursoCad,
        descricao: novaDescricaoCursoCad,
        categoria: novaCategoriaCursoCad,
        preco: parseFloat(novoPrecoCursoCad) || 0,
        preco_original: novoPrecoOriginalCursoCad ? parseFloat(novoPrecoOriginalCursoCad) : null,
        duracao: novaDuracaoCursoCad,
        carga_horaria: novaCargaHorariaCursoCad,
        selo_mec: novoSeloMecCursoCad,
        imagem_url: imagemUrl,
        imagem_capa_url: imagemCapaUrl,
        grade_curricular: novaGradeCurricularCursoCad,
        blocos_conteudo: novosBlocosConteudoCursoCad,
      }]);

      if (insertError) throw insertError;

      setMensagemStatus("✅ Curso publicado com sucesso!");
      setNovoTituloCursoCad("");
      setNovaDescricaoCursoCad("");
      setNovaCategoriaCursoCad("");
      setNovoPrecoCursoCad("");
      setNovoPrecoOriginalCursoCad("");
      setNovaDuracaoCursoCad("");
      setNovaCargaHorariaCursoCad("");
      setNovoSeloMecCursoCad(false);
      setNovaGradeCurricularCursoCad("");
      setNovosBlocosConteudoCursoCad("");
      if (inputImagem) inputImagem.value = "";
      if (inputImagemCapa) inputImagemCapa.value = "";
      buscarCursosCadastradosDoSupabase();
    } catch (err) {
      setMensagemStatus("❌ Erro ao salvar o curso: " + err.message);
    }
  }

  // --- Carrega um curso cadastrado no formulário para edição ---
  function iniciarEdicaoCursoCadastrado(curso) {
    setCursoCadEditando(curso.id);
    setNovoTituloCursoCad(curso.titulo || "");
    setNovaDescricaoCursoCad(curso.descricao || "");
    setNovaCategoriaCursoCad(curso.categoria || "");
    setNovoPrecoCursoCad(curso.preco ?? "");
    setNovoPrecoOriginalCursoCad(curso.preco_original ?? "");
    setNovaDuracaoCursoCad(curso.duracao || "");
    setNovaCargaHorariaCursoCad(curso.carga_horaria || "");
    setNovoSeloMecCursoCad(curso.selo_mec || false);
    setNovaGradeCurricularCursoCad(curso.grade_curricular || "");
    setNovosBlocosConteudoCursoCad(curso.blocos_conteudo || "");
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }

  function cancelarEdicaoCursoCadastrado() {
    setCursoCadEditando(null);
    setNovoTituloCursoCad("");
    setNovaDescricaoCursoCad("");
    setNovaCategoriaCursoCad("");
    setNovoPrecoCursoCad("");
    setNovoPrecoOriginalCursoCad("");
    setNovaDuracaoCursoCad("");
    setNovaCargaHorariaCursoCad("");
    setNovoSeloMecCursoCad(false);
    setNovaGradeCurricularCursoCad("");
    setNovosBlocosConteudoCursoCad("");
  }

  // Função para Salvar as Alterações de um Curso Cadastrado
  async function handleSalvarEdicaoCursoCadastrado(e) {
    e.preventDefault();

    if (!novoTituloCursoCad.trim()) {
      setMensagemStatus("⚠️ Informe o título do curso!");
      return;
    }

    const inputImagem = document.getElementById('imagem-curso-cadastrado');
    const inputImagemCapa = document.getElementById('imagem-capa-curso-cadastrado');
    const arquivoImagem = inputImagem?.files[0];
    const arquivoImagemCapa = inputImagemCapa?.files[0];

    try {
      setMensagemStatus("⏳ Atualizando curso...");

      const dadosAtualizados = {
        titulo: novoTituloCursoCad,
        descricao: novaDescricaoCursoCad,
        categoria: novaCategoriaCursoCad,
        preco: parseFloat(novoPrecoCursoCad) || 0,
        preco_original: novoPrecoOriginalCursoCad ? parseFloat(novoPrecoOriginalCursoCad) : null,
        duracao: novaDuracaoCursoCad,
        carga_horaria: novaCargaHorariaCursoCad,
        selo_mec: novoSeloMecCursoCad,
        grade_curricular: novaGradeCurricularCursoCad,
        blocos_conteudo: novosBlocosConteudoCursoCad,
      };

      // Só substitui as imagens se o admin escolheu um novo arquivo
      if (arquivoImagem) {
        const nomeArquivo = `curso-${Date.now()}-${arquivoImagem.name}`;
        const { error: uploadError } = await supabase.storage.from('banners').upload(nomeArquivo, arquivoImagem);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('banners').getPublicUrl(nomeArquivo);
        dadosAtualizados.imagem_url = urlData.publicUrl;
      }

      if (arquivoImagemCapa) {
        const nomeArquivoCapa = `curso-capa-${Date.now()}-${arquivoImagemCapa.name}`;
        const { error: uploadCapaError } = await supabase.storage.from('banners').upload(nomeArquivoCapa, arquivoImagemCapa);
        if (uploadCapaError) throw uploadCapaError;
        const { data: urlCapaData } = supabase.storage.from('banners').getPublicUrl(nomeArquivoCapa);
        dadosAtualizados.imagem_capa_url = urlCapaData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from('cursos_cadastrados')
        .update(dadosAtualizados)
        .eq('id', cursoCadEditando);

      if (updateError) throw updateError;

      setMensagemStatus("✅ Curso atualizado com sucesso!");
      if (inputImagem) inputImagem.value = "";
      if (inputImagemCapa) inputImagemCapa.value = "";
      cancelarEdicaoCursoCadastrado();
      buscarCursosCadastradosDoSupabase();
    } catch (err) {
      setMensagemStatus("❌ Erro ao atualizar o curso: " + err.message);
    }
  }

  // Função para Eliminar um Curso Cadastrado
  async function handleEliminarCursoCadastrado(id) {
    if (!window.confirm("Tem a certeza que quer eliminar este curso?")) return;
    try {
      const { error } = await supabase.from('cursos_cadastrados').delete().eq('id', id);
      if (error) throw error;
      if (cursoCadEditando === id) cancelarEdicaoCursoCadastrado();
      buscarCursosCadastradosDoSupabase();
    } catch (err) {
      alert("Erro ao eliminar curso: " + err.message);
    }
  }

  // --- SE MODO ADMIN ESTIVER ATIVO, EXIBE O PAINEL EM VEZ DO SITE ---
  if (modoAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-[#f6f3f7] text-gray-800 flex font-sans overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 shrink-0 bg-gradient-to-b from-[#cd146e] to-[#7a1652] text-white flex flex-col">
          <div className="p-6 flex items-center gap-3 border-b border-white/15">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center font-black text-lg shrink-0">LA</div>
            <div className="min-w-0">
              <h1 className="font-black text-sm leading-tight truncate">LA. Educação</h1>
              <p className="text-[10px] text-white/70">Painel Administrativo</p>
            </div>
          </div>

          <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
              { key: 'banners', label: 'Banners', icon: '🖼️' },
              { key: 'selos', label: 'Selos / Parceiros', icon: '🏅' },
              { key: 'diferenciais', label: 'Diferenciais', icon: '✨' },
              { key: 'noticias', label: 'Notícias, Vagas e FAQ', icon: '📰' },
              { key: 'cursos-destaque', label: 'Cursos em Destaque', icon: '🎓' },
              { key: 'banner-lateral', label: 'Banner Lateral do Blog', icon: '📌' },
              { key: 'sobre-historia', label: 'Nossa História (Sobre Nós)', icon: '📖' },
              { key: 'cursos-cadastrados', label: 'Cursos (Cards)', icon: '📚' },
              { key: 'contato', label: 'Contato e Redes Sociais', icon: '📞' },
              { key: 'destaques-sobre', label: 'Destaques (Sobre Nós)', icon: '⭐' },
              { key: 'redes-sobre', label: 'Redes Sociais (Sobre Nós)', icon: '📱' },
              { key: 'galeria-sobre', label: 'Nosso Espaço (Galeria)', icon: '🖼️' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setAbaAdmin(item.key)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-left transition-colors cursor-pointer ${abaAdmin === item.key ? "bg-white/20 shadow-inner" : "text-white/85 hover:bg-white/10"}`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/15">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setModoAdmin(false);
                alert('Sessão encerrada com segurança.');
              }}
              className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              Sair do Painel ➔
            </button>
          </div>
        </aside>

        {/* CONTEÚDO */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shadow-sm">
            <div>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                {{
                  dashboard: 'Dashboard',
                  banners: 'Banners',
                  selos: 'Selos / Parceiros',
                  diferenciais: 'Diferenciais',
                  noticias: 'Notícias, Vagas e FAQ',
                  'cursos-destaque': 'Cursos em Destaque',
                  'banner-lateral': 'Banner Lateral do Blog',
                  'sobre-historia': 'Nossa História (Sobre Nós)',
                  'cursos-cadastrados': 'Cursos (Cards)',
                  contato: 'Contato e Redes Sociais',
                  'destaques-sobre': 'Destaques (Sobre Nós)',
                  'redes-sobre': 'Redes Sociais (Sobre Nós)',
                  'galeria-sobre': 'Nosso Espaço (Galeria)',
                }[abaAdmin]} <span>✨</span>
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Administrador LaTec</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Última atualização</p>
              <p className="text-xs text-gray-600 font-semibold">{new Date().toLocaleString('pt-BR')}</p>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8">
            {mensagemStatus && (
              <p className="text-sm font-bold text-center p-4 mb-6 bg-white border border-[#cd146e]/30 rounded-xl shadow-sm text-[#cd146e]">{mensagemStatus}</p>
            )}

            {abaAdmin === 'dashboard' && (
              <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    { label: 'Banners Ativos', value: banners.length, icon: '🖼️', bg: 'bg-pink-50', color: 'text-[#cd146e]' },
                    { label: 'Selos / Parceiros', value: listaSelos.length, icon: '🏅', bg: 'bg-blue-50', color: 'text-blue-600' },
                    { label: 'Diferenciais', value: listaDiferenciais.length, icon: '✨', bg: 'bg-amber-50', color: 'text-amber-600' },
                    { label: 'Notícias', value: noticiasDestaque.length, icon: '📰', bg: 'bg-green-50', color: 'text-green-600' },
                    { label: 'Vagas Abertas', value: vagasAdmin.length, icon: '💼', bg: 'bg-purple-50', color: 'text-purple-600' },
                    { label: 'FAQs', value: faqsAdmin.length, icon: '📌', bg: 'bg-cyan-50', color: 'text-cyan-600' },
                    { label: 'Cursos em Destaque', value: cursosDestaque.length, icon: '🎓', bg: 'bg-indigo-50', color: 'text-indigo-600' },
                  ].map((card) => (
                    <div key={card.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wide text-gray-500">{card.label}</span>
                        <div className={`w-9 h-9 rounded-xl ${card.bg} ${card.color} flex items-center justify-center text-base`}>
                          {card.icon}
                        </div>
                      </div>
                      <span className="text-3xl font-black text-gray-900">{card.value}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-4">Ações Rápidas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { key: 'banners', label: 'Gerenciar Banners', desc: 'Atualizar banners e imagens da homepage', icon: '🖼️', bg: 'bg-pink-100', color: 'text-[#cd146e]' },
                      { key: 'selos', label: 'Gerenciar Selos', desc: 'Atualizar selos e parceiros institucionais', icon: '🏅', bg: 'bg-blue-100', color: 'text-blue-600' },
                      { key: 'diferenciais', label: 'Gerenciar Diferenciais', desc: 'Editar os diferenciais exibidos na home', icon: '✨', bg: 'bg-amber-100', color: 'text-amber-600' },
                      { key: 'noticias', label: 'Notícias, Vagas e FAQ', desc: 'Criar posts, vagas de emprego e perguntas frequentes', icon: '📰', bg: 'bg-green-100', color: 'text-green-600' },
                      { key: 'cursos-destaque', label: 'Cursos em Destaque', desc: 'Escolher os cursos exibidos em destaque na home', icon: '🎓', bg: 'bg-indigo-100', color: 'text-indigo-600' },
                      { key: 'banner-lateral', label: 'Banner Lateral do Blog', desc: 'Atualizar a imagem e o link do banner lateral', icon: '📌', bg: 'bg-cyan-100', color: 'text-cyan-600' },
                    ].map((action) => (
                      <button
                        key={action.key}
                        onClick={() => setAbaAdmin(action.key)}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center justify-between text-left hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-11 h-11 rounded-xl ${action.bg} ${action.color} flex items-center justify-center text-lg shrink-0`}>
                            {action.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-gray-900 text-sm truncate">{action.label}</p>
                            <p className="text-xs text-gray-500 truncate">{action.desc}</p>
                          </div>
                        </div>
                        <span className="text-gray-300 text-xl shrink-0">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {abaAdmin === 'banners' && (
              <div className="flex flex-col gap-8">
          {/* --- BLOCO 1: GERENCIAR BANNERS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-gray-200 pb-10">
            <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
              <h3 className="text-base font-black uppercase text-gray-900 mb-4 tracking-wide">Novo Banner</h3>
              <form onSubmit={handleAdicionarBanner} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Título (Opcional)</label>
                  <input type="text" value={novoTitulo} onChange={(e) => setNovoTitulo(e.target.value)} placeholder="Ex: Novas Matrículas" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Arquivo de Imagem</label>
                  <input type="file" id="arquivo-banner" accept="image/*" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 file:bg-[#cd146e] file:text-white file:border-0 file:rounded-full file:px-3 file:py-1 file:text-xs file:font-bold cursor-pointer" />
                </div>
                <button type="submit" className="w-full bg-[#cd146e] hover:bg-[#a61058] text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer">➕ Publicar Banner</button>
              </form>
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-base font-black uppercase text-gray-900 mb-4 tracking-wide">Banners Ativos ({banners.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {banners.map((b) => (
                  <div key={b.id} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden relative shadow-sm">
                    <img src={b.imagem_url} alt="" className="w-full h-32 object-cover" />
                    <button onClick={() => handleEliminarBanner(b.id)} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer">✕</button>
                    <div className="p-3 text-left truncate text-xs font-bold text-gray-800">{b.titulo || "Sem Título"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

              </div>
            )}

            {abaAdmin === 'selos' && (
              <div className="flex flex-col gap-8">
          {/* --- BLOCO 2: GERENCIAR SELOS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-200 pt-10">
            <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
              <h3 className="text-base font-black uppercase text-gray-900 mb-4 tracking-wide">Novo Selo / Parceiro</h3>
              <form onSubmit={handleAdicionarSelo} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Nome da Empresa/Selo</label>
                  <input type="text" value={novoNomeSelo} onChange={(e) => setNovoNomeSelo(e.target.value)} placeholder="Ex: MEC ou Empresa Parceira" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Logo (Do PC)</label>
                  <input type="file" id="imagem-selo" accept="image/*" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 file:bg-[#cd146e] file:text-white file:border-0 file:rounded-full file:px-3 file:py-1 file:text-xs file:font-bold cursor-pointer" />
                </div>
                <button type="submit" className="w-full bg-[#cd146e] hover:bg-[#a61058] text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer">➕ Publicar Selo</button>
              </form>
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-base font-black uppercase text-gray-900 mb-4 tracking-wide">Selos Ativos ({listaSelos.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {listaSelos.map((s) => (
                  <div key={s.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-between relative shadow-sm h-36">
                    <button onClick={() => handleEliminarSelo(s.id)} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer">✕</button>
                    <div className="flex-1 flex items-center justify-center w-full">
                      <img src={s.imagem_url} alt="" className="h-12 w-auto object-contain" />
                    </div>
                    <p className="text-[11px] font-bold text-gray-600 text-center truncate w-full mt-2">{s.nome}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

              </div>
            )}

            {abaAdmin === 'diferenciais' && (
              <div className="flex flex-col gap-8">
          {/* --- BLOCO 3: GERENCIAR DIFERENCIAIS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-200 pt-10">
            <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
              <h3 className="text-base font-black uppercase text-gray-900 mb-4 tracking-wide">Novo Diferencial</h3>
              <form onSubmit={handleAdicionarDiferencial} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Título do Diferencial</label>
                  <input 
                    type="text" 
                    value={novoTituloDiferencial} 
                    onChange={(e) => setNovoTituloDiferencial(e.target.value)} 
                    placeholder="Ex: Suporte 24/7 ou Metodologia Ativa" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white" 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Imagem Ilustrativa (Do PC)</label>
                  <input 
                    type="file" 
                    id="imagem-diferencial" 
                    accept="image/*" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 file:bg-[#cd146e] file:text-white file:border-0 file:rounded-full file:px-3 file:py-1 file:text-xs file:font-bold cursor-pointer" 
                  />
                </div>
                <button type="submit" className="w-full bg-[#cd146e] hover:bg-[#a61058] text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer">➕ Publicar Diferencial</button>
              </form>
            </div>
            
            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-base font-black uppercase text-gray-900 mb-4 tracking-wide">Diferenciais Ativos ({listaDiferenciais.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listaDiferenciais.map((d) => (
                  <div key={d.id} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden relative shadow-sm flex items-center p-3 gap-4">
                    <img src={d.fotoUrl} alt="" className="w-16 h-16 object-cover rounded-lg bg-gray-800 shrink-0" />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-black text-gray-900 truncate">{d.titulo}</p>
                    </div>
                    <button 
                      onClick={() => handleEliminarDiferencial(d.id)} 
                      className="bg-red-600 hover:bg-red-700 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

              </div>
            )}

            {abaAdmin === 'noticias' && (
              <div className="flex flex-col gap-8">
          {/* --- BLOCO 5: GERENCIAR NOTÍCIAS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-200 pt-10 pb-8">
            <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
              
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-black uppercase text-gray-900 tracking-wide">
                  {noticiaEditando ? "✏️ Editar Notícia" : "📝 Nova Notícia"}
                </h3>
                {noticiaEditando && (
                  <button 
                    type="button" 
                    onClick={() => { setNoticiaEditando(null); setEditTitulo(""); setEditResumo(""); setEditCorpo(""); setEditTempoLeitura(""); setEditDestaque(false); }}
                    className="text-[10px] uppercase bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-md font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
              -

              <form onSubmit={noticiaEditando ? handleSalvarEdicaoNoticia : handleAdicionarNoticia} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Título da Notícia</label>
                  <input 
                    type="text" 
                    value={noticiaEditando ? editTitulo : novoTituloNoticia} 
                    onChange={(e) => noticiaEditando ? setEditTitulo(e.target.value) : setNovoTituloNoticia(e.target.value)} 
                    placeholder="Ex: Novo curso aberto!" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white" 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Subtítulo</label>
                  <textarea
                    rows="3"
                    value={noticiaEditando ? editResumo : novoResumoNoticia}
                    onChange={(e) => noticiaEditando ? setEditResumo(e.target.value) : setNovoResumoNoticia(e.target.value)}
                    placeholder="Ex: Inscrições abertas..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Corpo da Notícia</label>
                  <textarea
                    rows="8"
                    value={noticiaEditando ? editCorpo : novoCorpoNoticia}
                    onChange={(e) => noticiaEditando ? setEditCorpo(e.target.value) : setNovoCorpoNoticia(e.target.value)}
                    placeholder="Texto completo da matéria..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">
                    {noticiaEditando ? "Nova Imagem (Opcional)" : "Imagem de Capa"}
                  </label>
                  <input 
                    type="file" 
                    id={noticiaEditando ? "imagem-noticia-edit" : "imagem-noticia"}
                    accept="image/*" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 file:bg-[#cd146e] file:text-white file:border-0 file:rounded-full file:px-3 file:py-1 file:text-xs file:font-bold cursor-pointer" 
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Tempo de Leitura (minutos)</label>
                  <input 
                    type="number" 
                    value={noticiaEditando ? editTempoLeitura : novoTempoLeitura} 
                    onChange={(e) => noticiaEditando ? setEditTempoLeitura(e.target.value) : setNovoTempoLeitura(e.target.value)} 
                    placeholder="Ex: 5" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white" 
                  />
                </div>

                {/* CHECKBOX DE DESTAQUE */}
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 mt-1">
                  <input 
                    type="checkbox" 
                    id="check-destaque"
                    checked={noticiaEditando ? editDestaque : novaNoticiaDestaque}
                    onChange={(e) => noticiaEditando ? setEditDestaque(e.target.checked) : setNovaNoticiaDestaque(e.target.checked)}
                    className="w-4 h-4 rounded text-[#cd146e] focus:ring-[#cd146e] bg-white border-gray-300 cursor-pointer"
                  />
                  <label htmlFor="check-destaque" className="text-xs text-gray-600 font-bold uppercase cursor-pointer select-none">
                    ⭐ Destacar na Home
                  </label>
                </div>

                <button 
                  type="submit" 
                  className={`w-full text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer mt-2 ${noticiaEditando ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#cd146e] hover:bg-[#a61058]'}`}
                >
                  {noticiaEditando ? "💾 Salvar Alterações" : "➕ Publicar Notícia"}
                </button>
              </form>
            </div>
            
            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-base font-black uppercase text-gray-900 mb-4 tracking-wide">Notícias Ativas ({noticiasDestaque.length})</h3>
              <div className="flex flex-col gap-4 max-h-[530px] overflow-y-auto pr-2">
                {noticiasDestaque.map((n) => (
                  <div key={n.id} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden relative shadow-sm flex items-center p-4 gap-4">
                    <img src={n.fotoUrl} alt="" className="w-20 h-20 object-cover rounded-lg bg-gray-800 shrink-0" />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-gray-900 truncate">{n.titulo}</p>
                        {n.destaque && (
                          <span className="bg-[#cd146e]/20 text-[#cd146e] text-[10px] font-black px-2 py-0.5 rounded-full border border-[#cd146e]/30 uppercase shrink-0">
                            ⭐ Destaque
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{n.resumo}</p>
                    </div>
                    
                    {/* BOTÕES DE AÇÃO: EDITAR E EXCLUIR */}
                    <div className="flex flex-col gap-2 shrink-0">

                      <button
                        onClick={() => iniciarEdicaoNoticia(n)}
                        className="bg-amber-500 hover:bg-amber-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                        title="Editar Notícia"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleEliminarNoticia(n.id)}
                        className="bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                        title="Excluir Notícia"
                      >
                        ✕
                      </button>
                    </div>

                  </div>
                ))}
                {noticiasDestaque.length === 0 && (
                  <p className="text-gray-400 text-sm py-8 text-center font-medium">Nenhuma notícia publicada ainda.</p>
                )}
              </div>
            </div>
          </div>

         {/* --- GERENCIADOR DE VAGAS --- */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 text-left shadow-sm mb-8">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-6 border-b border-gray-200 pb-3 inline-flex items-center gap-2">
                💼 Gerenciar Vagas de Emprego
              </h3>
              
              <form onSubmit={handleAdicionarVaga} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Título da Vaga</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Professor de Inglês" 
                      value={novaVagaTitulo}
                      onChange={(e) => setNovaVagaTitulo(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#cd146e] focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Departamento</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Corpo Docente" 
                      value={novaVagaDepartamento}
                      onChange={(e) => setNovaVagaDepartamento(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#cd146e] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Localização</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Lisboa / Híbrido" 
                      value={novaVagaLocalizacao}
                      onChange={(e) => setNovaVagaLocalizacao(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#cd146e] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Tipo de Contrato</label>
                    <select 
                      value={novaVagaTipoContrato} 
                      onChange={(e) => setNovaVagaTipoContrato(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-hidden focus:border-[#cd146e] focus:bg-white"
                    >
                      <option value="CLT">CLT (Efetivo)</option>
                      <option value="PJ">PJ (Prestador de Serviços)</option>
                      <option value="Estágio">Estágio</option>
                      <option value="Freelancer">Freelancer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Link para Inscrição (Formulário/Email)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: https://forms.gle/... ou mailto:rh@empresa.com" 
                    value={novaVagaLink}
                    onChange={(e) => setNovaVagaLink(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#cd146e] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Descrição / Requisitos</label>
                  <textarea 
                    rows="4" 
                    placeholder="Descreve as responsabilidades e requisitos da vaga..." 
                    value={novaVagaDescricao}
                    onChange={(e) => setNovaVagaDescricao(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#cd146e] focus:bg-white"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  onClick={(e) => handleAdicionarVaga(e)}
                  className="bg-[#cd146e] hover:bg-[#a61058] text-white text-[11px] font-black uppercase tracking-wider px-5 py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Adicionar Vaga
                </button>
              </form>

              {/* LISTAGEM DAS VAGAS CADASTRADAS */}
              <div className="mt-6 border-t border-gray-200 pt-5 space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Vagas Abertas:</p>
                {vagasAdmin.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Nenhuma vaga publicada.</p>
                ) : (
                  vagasAdmin.map(vaga => (
                    <div key={vaga.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-xs">
                      <div className="pr-4 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <span className="text-[9px] font-extrabold bg-white text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                          {vaga.tipo_contrato}
                        </span>
                        <strong className="text-xs text-gray-700 font-medium">{vaga.titulo}</strong>
                        <span className="text-[10px] text-gray-400 hidden sm:inline">- {vaga.departamento}</span>
                      </div>
                      <button 
                        onClick={() => handleDeletarVaga(vaga.id)}
                        className="text-red-400 hover:text-red-500 text-xs font-bold uppercase px-2 py-1 transition-colors cursor-pointer shrink-0"
                      >
                        Excluir
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          {/* --- GERENCIADOR DE PERGUNTAS FREQUENTES (FAQ) --- */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 text-left shadow-sm">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-6 border-b border-gray-200 pb-3 inline-flex items-center gap-2">
                📌 Gerenciar Perguntas Frequentes (FAQ)
              </h3>
              
              <form onSubmit={handleAdicionarFaq} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Tópico / Categoria</label>
                  <select 
                    value={novoTopicofaq} 
                    onChange={(e) => setNovoTopicofaq(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-hidden focus:border-[#cd146e] focus:bg-white"
                  >
                    <option value="Geral">Geral</option>
                    <option value="Cursos">Cursos</option>
                    <option value="Inscrições">Inscrições</option>
                    <option value="Certificados">Certificados</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Pergunta</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Como funciona a emissão do certificado?" 
                    value={novaPerguntafaq}
                    onChange={(e) => setNovaPerguntaFaq(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#cd146e] focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Resposta</label>
                  <textarea 
                    rows="3" 
                    placeholder="Digite a resposta detalhada aqui..." 
                    value={novaRespostafaq}
                    onChange={(e) => setNovaRespostaFaq(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#cd146e] focus:bg-white"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="bg-[#cd146e] hover:bg-[#a61058] text-white text-[11px] font-black uppercase tracking-wider px-5 py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Adicionar ao FAQ
                </button>
              </form>

              {/* LISTAGEM DAS PERGUNTAS JÁ CADASTRADAS PARA EXCLUSÃO */}
              <div className="mt-6 border-t border-gray-200 pt-5 space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Perguntas Cadastradas:</p>
                {faqsAdmin.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Nenhuma pergunta cadastrada.</p>
                ) : (
                  faqsAdmin.map(faq => (
                    <div key={faq.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-xs">
                      <div className="pr-4 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <span className="text-[9px] font-extrabold bg-white text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                          {faq.topico}
                        </span>
                        <strong className="text-xs text-gray-700 font-medium">{faq.pergunta}</strong>
                      </div>
                      <button 
                        onClick={() => handleDeletarFaq(faq.id)}
                        className="text-red-400 hover:text-red-500 text-xs font-bold uppercase px-2 py-1 transition-colors cursor-pointer shrink-0"
                      >
                        Excluir
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          
              </div>
            )}

            {abaAdmin === 'cursos-destaque' && (
              <div className="flex flex-col gap-8">
          {/* --- BLOCO: GERENCIAR CURSOS EM DESTAQUE --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
              <h3 className="text-base font-black uppercase text-gray-900 mb-4 tracking-wide">Novo Curso em Destaque</h3>
              <form onSubmit={handleAdicionarCursoDestaque} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Título do Curso</label>
                  <input type="text" value={novoTituloCursoDestaque} onChange={(e) => setNovoTituloCursoDestaque(e.target.value)} placeholder="Ex: Marketing Digital" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Resumo</label>
                  <input type="text" value={novoResumoCursoDestaque} onChange={(e) => setNovoResumoCursoDestaque(e.target.value)} placeholder="Breve descrição do curso" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Duração</label>
                  <input type="text" value={novaDuracaoCursoDestaque} onChange={(e) => setNovaDuracaoCursoDestaque(e.target.value)} placeholder="Ex: 300h" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Categoria</label>
                  <input type="text" value={novaCategoriaCursoDestaque} onChange={(e) => setNovaCategoriaCursoDestaque(e.target.value)} placeholder="Ex: Profissionalizante" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Imagem (Do PC)</label>
                  <input type="file" id="imagem-curso-destaque" accept="image/*" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 file:bg-[#cd146e] file:text-white file:border-0 file:rounded-full file:px-3 file:py-1 file:text-xs file:font-bold cursor-pointer" />
                </div>
                <button type="submit" className="w-full bg-[#cd146e] hover:bg-[#a61058] text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer">➕ Publicar Curso em Destaque</button>
              </form>
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-base font-black uppercase text-gray-900 mb-4 tracking-wide">Cursos em Destaque Ativos ({cursosDestaque.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cursosDestaque.map((c) => (
                  <div key={c.id} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden relative shadow-sm flex items-center p-3 gap-4">
                    <img src={c.fotoUrl} alt="" className="w-16 h-16 object-cover rounded-lg bg-gray-800 shrink-0" />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-black text-gray-900 truncate">{c.titulo}</p>
                      <p className="text-[10px] text-gray-400 truncate uppercase font-bold">{c.categoria} · {c.duracao}</p>
                    </div>
                    <button
                      onClick={() => handleEliminarCursoDestaque(c.id)}
                      className="bg-red-600 hover:bg-red-700 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
              </div>
            )}

            {abaAdmin === 'banner-lateral' && (
              <div className="flex flex-col gap-8">
          {/* --- BLOCO: GERENCIAR BANNER LATERAL DO BLOG --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
              <h3 className="text-base font-black uppercase text-gray-900 mb-4 tracking-wide">
                {bannerLateral ? 'Substituir Banner Lateral' : 'Novo Banner Lateral'}
              </h3>
              <form onSubmit={handleAdicionarBannerLateral} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Link de Destino</label>
                  <input type="text" value={novoLinkBannerLateral} onChange={(e) => setNovoLinkBannerLateral(e.target.value)} placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Arquivo de Imagem</label>
                  <input type="file" id="imagem-banner-lateral" accept="image/*" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 file:bg-[#cd146e] file:text-white file:border-0 file:rounded-full file:px-3 file:py-1 file:text-xs file:font-bold cursor-pointer" />
                </div>
                <button type="submit" className="w-full bg-[#cd146e] hover:bg-[#a61058] text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer">➕ Publicar Banner Lateral</button>
              </form>
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-base font-black uppercase text-gray-900 mb-4 tracking-wide">Banner Lateral Atual</h3>
              {bannerLateral ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden relative shadow-sm max-w-xs">
                  <img src={bannerLateral.fotoUrl} alt="" className="w-full h-40 object-cover" />
                  <button onClick={() => handleEliminarBannerLateral(bannerLateral.id)} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer">✕</button>
                  <div className="p-3 text-left truncate text-xs font-bold text-gray-800">{bannerLateral.link}</div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm py-6 text-center font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  Nenhum banner lateral cadastrado.
                </p>
              )}
            </div>
          </div>
              </div>
            )}

            {abaAdmin === 'sobre-historia' && (
              <div className="flex flex-col gap-8">
          {/* --- BLOCO: FOTO DA SEÇÃO "NOSSA HISTÓRIA" (PÁGINA SOBRE NÓS) --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
              <h3 className="text-base font-black uppercase text-gray-900 mb-4 tracking-wide">
                {fotoHistoria ? 'Substituir Foto' : 'Nova Foto'}
              </h3>
              <p className="text-xs text-gray-400 mb-4">Foto exibida na seção "Nossa História" da página Sobre Nós.</p>
              <form onSubmit={handleAdicionarFotoHistoria} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Arquivo de Imagem</label>
                  <input type="file" id="imagem-sobre-historia" accept="image/*" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 file:bg-[#cd146e] file:text-white file:border-0 file:rounded-full file:px-3 file:py-1 file:text-xs file:font-bold cursor-pointer" />
                </div>
                <button type="submit" className="w-full bg-[#cd146e] hover:bg-[#a61058] text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer">➕ Publicar Foto</button>
              </form>
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-base font-black uppercase text-gray-900 mb-4 tracking-wide">Foto Atual</h3>
              {fotoHistoria ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden relative shadow-sm max-w-xs">
                  <img src={fotoHistoria.fotoUrl} alt="" className="w-full h-40 object-cover" />
                  <button onClick={() => handleEliminarFotoHistoria(fotoHistoria.id)} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer">✕</button>
                </div>
              ) : (
                <p className="text-gray-400 text-sm py-6 text-center font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  Nenhuma foto cadastrada. A foto padrão do site será exibida.
                </p>
              )}
            </div>
          </div>
              </div>
            )}

            {abaAdmin === 'cursos-cadastrados' && (
              <div className="flex flex-col gap-8">
          {/* --- BLOCO: GERENCIAR CURSOS CADASTRADOS (CARDS COM PÁGINA DE DETALHE) --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black uppercase text-gray-900 tracking-wide">
                  {cursoCadEditando ? "✏️ Editar Curso" : "Novo Curso (Card)"}
                </h3>
                {cursoCadEditando && (
                  <button type="button" onClick={cancelarEdicaoCursoCadastrado} className="text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase cursor-pointer">
                    Cancelar
                  </button>
                )}
              </div>
              <form onSubmit={cursoCadEditando ? handleSalvarEdicaoCursoCadastrado : handleAdicionarCursoCadastrado} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Título do Curso</label>
                  <input type="text" value={novoTituloCursoCad} onChange={(e) => setNovoTituloCursoCad(e.target.value)} placeholder="Ex: Técnico em Enfermagem" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Descrição</label>
                  <textarea value={novaDescricaoCursoCad} onChange={(e) => setNovaDescricaoCursoCad(e.target.value)} rows={3} placeholder="Breve descrição do curso" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white resize-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Categoria</label>
                  <input type="text" value={novaCategoriaCursoCad} onChange={(e) => setNovaCategoriaCursoCad(e.target.value)} placeholder="Ex: Técnico" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Preço (R$)</label>
                    <input type="number" step="0.01" value={novoPrecoCursoCad} onChange={(e) => setNovoPrecoCursoCad(e.target.value)} placeholder="299.90" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Preço Original</label>
                    <input type="number" step="0.01" value={novoPrecoOriginalCursoCad} onChange={(e) => setNovoPrecoOriginalCursoCad(e.target.value)} placeholder="opcional" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Duração</label>
                    <input type="text" value={novaDuracaoCursoCad} onChange={(e) => setNovaDuracaoCursoCad(e.target.value)} placeholder="Ex: 12 meses" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Carga Horária</label>
                    <input type="text" value={novaCargaHorariaCursoCad} onChange={(e) => setNovaCargaHorariaCursoCad(e.target.value)} placeholder="Ex: 800h" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white" />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-600 font-bold cursor-pointer">
                  <input type="checkbox" checked={novoSeloMecCursoCad} onChange={(e) => setNovoSeloMecCursoCad(e.target.checked)} className="w-4 h-4 accent-[#cd146e] cursor-pointer" />
                  Exibir selo MEC no card
                </label>
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">
                    {cursoCadEditando ? "Nova Imagem do Card (opcional)" : "Imagem do Card"}
                  </label>
                  <input type="file" id="imagem-curso-cadastrado" accept="image/*" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 file:bg-[#cd146e] file:text-white file:border-0 file:rounded-full file:px-3 file:py-1 file:text-xs file:font-bold cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">
                    {cursoCadEditando ? "Nova Imagem de Capa (opcional)" : "Imagem de Capa (página do curso)"}
                  </label>
                  <input type="file" id="imagem-capa-curso-cadastrado" accept="image/*" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 file:bg-[#cd146e] file:text-white file:border-0 file:rounded-full file:px-3 file:py-1 file:text-xs file:font-bold cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Grade Curricular</label>
                  <textarea
                    value={novaGradeCurricularCursoCad}
                    onChange={(e) => setNovaGradeCurricularCursoCad(e.target.value)}
                    rows={5}
                    placeholder={"1º Semestre\nMatemática Básica | 60h\nPortuguês Instrumental | 40h\n\n2º Semestre\nCálculo I | 80h"}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white font-mono resize-y"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Uma linha sem "|" inicia um semestre novo. Disciplinas no formato "nome | carga horária".</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Conteúdo (Como Funciona)</label>
                  <textarea
                    value={novosBlocosConteudoCursoCad}
                    onChange={(e) => setNovosBlocosConteudoCursoCad(e.target.value)}
                    rows={5}
                    placeholder={"## Metodologia\nTexto explicando a metodologia...\n\n## Material Didático\nMais texto aqui..."}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white font-mono resize-y"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Cada bloco começa com "## Título" seguido do texto.</p>
                </div>
                <button
                  type="submit"
                  className={`w-full text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer ${cursoCadEditando ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#cd146e] hover:bg-[#a61058]'}`}
                >
                  {cursoCadEditando ? "💾 Salvar Alterações" : "➕ Publicar Curso"}
                </button>
              </form>
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
              <h3 className="text-base font-black uppercase text-gray-900 mb-4 tracking-wide">Cursos Cadastrados ({cursosCadastrados.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cursosCadastrados.map((c) => (
                  <div key={c.id} className={`bg-gray-50 border rounded-xl overflow-hidden relative shadow-sm flex items-center p-3 gap-4 ${cursoCadEditando === c.id ? 'border-amber-400 ring-1 ring-amber-300' : 'border-gray-200'}`}>
                    <img src={c.imagem_url} alt="" className="w-16 h-16 object-cover rounded-lg bg-gray-800 shrink-0" />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-black text-gray-900 truncate">{c.titulo}</p>
                      <p className="text-[10px] text-gray-400 truncate uppercase font-bold">{c.categoria} · R$ {(c.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <a href={`/cursos/${c.id}`} target="_blank" rel="noreferrer" className="text-[10px] text-[#cd146e] font-bold hover:underline">Ver página ↗</a>
                    </div>
                    <button
                      onClick={() => iniciarEdicaoCursoCadastrado(c)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer shrink-0"
                      title="Editar curso"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleEliminarCursoCadastrado(c.id)}
                      className="bg-red-600 hover:bg-red-700 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
              </div>
            )}

            {abaAdmin === 'contato' && (
              <div className="flex flex-col gap-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-3xl">
                  <h3 className="text-base font-black uppercase text-gray-900 mb-1 tracking-wide">Contato e Localização</h3>
                  <p className="text-xs text-gray-400 mb-6">Essas informações aparecem no rodapé de todas as páginas do site.</p>
                  <form onSubmit={handleSalvarContatoFooter} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Endereço (linha 1)</label>
                        <input
                          type="text"
                          name="endereco_linha1"
                          value={contatoFooterForm.endereco_linha1}
                          onChange={handleContatoFooterChange}
                          placeholder="Av. Principal, 123 - Centro"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Endereço (linha 2)</label>
                        <input
                          type="text"
                          name="endereco_linha2"
                          value={contatoFooterForm.endereco_linha2}
                          onChange={handleContatoFooterChange}
                          placeholder="Cidade - UF - CEP 00000-000"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Telefone (texto exibido)</label>
                        <input
                          type="text"
                          name="telefone"
                          value={contatoFooterForm.telefone}
                          onChange={handleContatoFooterChange}
                          placeholder="(27) 99839-2172"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Número do WhatsApp (só dígitos, com DDI+DDD)</label>
                        <input
                          type="text"
                          name="whatsapp_numero"
                          value={contatoFooterForm.whatsapp_numero}
                          onChange={handleContatoFooterChange}
                          placeholder="5527998392172"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">E-mail</label>
                      <input
                        type="email"
                        name="email"
                        value={contatoFooterForm.email}
                        onChange={handleContatoFooterChange}
                        placeholder="contato@escolalatec.com.br"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white"
                      />
                    </div>

                    <h3 className="text-base font-black uppercase text-gray-900 mt-2 mb-1 tracking-wide">Redes Sociais</h3>
                    <p className="text-xs text-gray-400 mb-1">Links dos ícones sociais exibidos no rodapé.</p>
                    <div>
                      <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Instagram (URL)</label>
                      <input
                        type="url"
                        name="instagram_url"
                        value={contatoFooterForm.instagram_url}
                        onChange={handleContatoFooterChange}
                        placeholder="https://instagram.com/escolalatec"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Facebook (URL)</label>
                      <input
                        type="url"
                        name="facebook_url"
                        value={contatoFooterForm.facebook_url}
                        onChange={handleContatoFooterChange}
                        placeholder="https://facebook.com/escolalatec"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">LinkedIn (URL)</label>
                      <input
                        type="url"
                        name="linkedin_url"
                        value={contatoFooterForm.linkedin_url}
                        onChange={handleContatoFooterChange}
                        placeholder="https://linkedin.com/company/escolalatec"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#cd146e] hover:bg-[#a61058] text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer mt-2"
                    >
                      💾 Salvar Contato e Redes Sociais
                    </button>
                  </form>
                </div>
              </div>
            )}

            {abaAdmin === 'destaques-sobre' && (
              <div className="flex flex-col gap-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-3xl">
                  <h3 className="text-base font-black uppercase text-gray-900 mb-1 tracking-wide">Destaques da Página Sobre Nós</h3>
                  <p className="text-xs text-gray-400 mb-6">
                    Imagem central e os 8 tópicos exibidos ao redor dela (4 à esquerda, 4 à direita), na seção logo abaixo de "Nossa História".
                  </p>
                  <form onSubmit={handleSalvarDestaquesSobre} className="flex flex-col gap-4">
                    <div>
                      <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Imagem Central</label>
                      {destaquesSobreForm.imagem_url && (
                        <img src={destaquesSobreForm.imagem_url} alt="Prévia" className="w-24 h-32 object-cover rounded-xl mb-2 border border-gray-200" />
                      )}
                      <input
                        type="file"
                        id="imagem-destaques-sobre"
                        accept="image/*"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 file:bg-[#cd146e] file:text-white file:border-0 file:rounded-full file:px-3 file:py-1 file:text-xs file:font-bold cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                      <div className="flex flex-col gap-3">
                        <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider">Tópicos à Esquerda</h4>
                        {[1, 2, 3, 4].map((n) => (
                          <input
                            key={`esquerda_${n}`}
                            type="text"
                            name={`esquerda_${n}`}
                            value={destaquesSobreForm[`esquerda_${n}`]}
                            onChange={handleDestaquesSobreChange}
                            placeholder={`Tópico ${n} (esquerda)`}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white"
                          />
                        ))}
                      </div>
                      <div className="flex flex-col gap-3">
                        <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider">Tópicos à Direita</h4>
                        {[1, 2, 3, 4].map((n) => (
                          <input
                            key={`direita_${n}`}
                            type="text"
                            name={`direita_${n}`}
                            value={destaquesSobreForm[`direita_${n}`]}
                            onChange={handleDestaquesSobreChange}
                            placeholder={`Tópico ${n} (direita)`}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white"
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#cd146e] hover:bg-[#a61058] text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer mt-2"
                    >
                      💾 Salvar Destaques
                    </button>
                  </form>
                </div>
              </div>
            )}

            {abaAdmin === 'redes-sobre' && (
              <div className="flex flex-col gap-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-3xl">
                  <h3 className="text-base font-black uppercase text-gray-900 mb-1 tracking-wide">Acompanhe a LATec (Redes Sociais)</h3>
                  <p className="text-xs text-gray-400 mb-6">
                    Seção com prévias das redes sociais, exibida acima do vídeo institucional na página Sobre Nós.
                  </p>
                  <form onSubmit={handleSalvarRedesSociaisSobre} className="flex flex-col gap-6">
                    {REDES_SOCIAIS_SOBRE_CONFIG.map(({ key, label }) => (
                      <div key={key} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
                        <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider">{label}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-4 items-start">
                          <div>
                            {redesSociaisSobreForm[`${key}_imagem`] && (
                              <img src={redesSociaisSobreForm[`${key}_imagem`]} alt={`Prévia ${label}`} className="w-24 h-32 object-cover rounded-xl mb-2 border border-gray-200" />
                            )}
                            <input
                              type="file"
                              id={`imagem-rede-${key}`}
                              accept="image/*"
                              className="w-24 text-[10px] text-gray-700 file:bg-[#cd146e] file:text-white file:border-0 file:rounded-full file:px-2 file:py-1 file:text-[10px] file:font-bold cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 font-bold block mb-1 uppercase">Link ({label})</label>
                            <input
                              type="url"
                              name={`${key}_link`}
                              value={redesSociaisSobreForm[`${key}_link`]}
                              onChange={handleRedesSociaisSobreChange}
                              placeholder={`https://...`}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#cd146e] focus:bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="submit"
                      className="w-full bg-[#cd146e] hover:bg-[#a61058] text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer mt-2"
                    >
                      💾 Salvar Redes Sociais
                    </button>
                  </form>
                </div>
              </div>
            )}

            {abaAdmin === 'galeria-sobre' && (
              <div className="flex flex-col gap-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-4xl">
                  <h3 className="text-base font-black uppercase text-gray-900 mb-1 tracking-wide">Nosso Espaço (Galeria)</h3>
                  <p className="text-xs text-gray-400 mb-6">
                    9 fotos exibidas na galeria com efeito parallax, na página Sobre Nós, logo abaixo de "Acompanhe a LATec". Envie as 9 para a galeria substituir as fotos de exemplo.
                  </p>
                  <form onSubmit={handleSalvarGaleriaSobre} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {GALERIA_SOBRE_CAMPOS.map((campo, i) => (
                        <div key={campo} className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2 items-center">
                          <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Foto {i + 1}</h4>
                          {galeriaSobreForm[campo] && (
                            <img src={galeriaSobreForm[campo]} alt={`Prévia ${i + 1}`} className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                          )}
                          <input
                            type="file"
                            id={`imagem-galeria-${campo}`}
                            accept="image/*"
                            className="w-full text-[10px] text-gray-700 file:bg-[#cd146e] file:text-white file:border-0 file:rounded-full file:px-2 file:py-1 file:text-[10px] file:font-bold cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#cd146e] hover:bg-[#a61058] text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer mt-2"
                    >
                      💾 Salvar Galeria
                    </button>
                  </form>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    );
  }
  // --- RENDERIZAÇÃO NORMAL DO SITE PÚBLICO (COM TODOS OS COMPONENTES INTACTOS) ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      <Navbar />
      
      {/* --- SEÇÃO 1: BANNER ROTATIVO (AGORA INTEGRADO AO SUPABASE) --- */}
      {banners.length > 0 && (
        <div className="w-full bg-white relative group">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
            <div className="w-full relative overflow-hidden rounded-2xl md:rounded-3xl shadow-sm h-[220px] sm:h-[340px] md:h-[460px]">
              {banners.map((banner, idx) => (
                <img
                  key={banner.id ?? idx}
                  src={banner.imagem_url}
                  alt="LATec Banner"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                    idx === indexAtual ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
              {banners.length > 1 && (
                <>
                  <button 
                    onClick={() => setIndexAtual((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-[#cd146e] text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer z-20 font-bold text-sm"
                  >
                    &#10094;
                  </button>
                  <button 
                    onClick={() => setIndexAtual((prev) => (prev === banners.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-[#cd146e] text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer z-20 font-bold text-sm"
                  >
                    &#10095;
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-black/15 px-2.5 py-1 rounded-full backdrop-blur-xs">
                    {banners.map((_, idx) => (
                      <button
                        key={`dot-banner-${idx}`}
                        onClick={() => setIndexAtual(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === indexAtual ? 'w-4 bg-[#cd146e]' : 'w-1.5 bg-white/50 hover:bg-white'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- SEÇÃO 2: BENEFÍCIOS DO LATEC --- */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-2 md:mt-4 relative z-10 pb-6">
        <div className="bg-white rounded-2xl md:rounded-full shadow-xl border border-gray-100 p-6 md:py-6 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 items-center">
          <div className="flex items-center gap-4 md:px-6">
            <div className="w-12 h-12 rounded-full bg-[#cd146e]/10 flex items-center justify-center text-[#cd146e] shrink-0 shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className="text-gray-700 font-bold text-sm md:text-[15px] leading-snug">Certificado Técnico Autorizado pelo MEC</p>
          </div>
          <div className="flex items-center gap-4 md:px-8 md:border-l md:border-gray-200">
            <div className="w-12 h-12 rounded-full bg-[#cd146e]/10 flex items-center justify-center text-[#cd146e] shrink-0 shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-700 font-bold text-sm md:text-[15px] leading-snug">Educação Acessível e Flexibilidade Total de Horários</p>
          </div>
          <div className="flex items-center gap-4 md:px-8 md:border-l md:border-gray-200">
            <div className="w-12 h-12 rounded-full bg-[#cd146e]/10 flex items-center justify-center text-[#cd146e] shrink-0 shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-700 font-bold text-sm md:text-[15px] leading-snug">Cursos Alinhados ao Mercado de Trabalho</p>
          </div>
        </div>
      </div>

      {/* --- SEÇÃO 3: ESTEIRA DE SELOS --- */}
      {listaSelos.length > 0 && (
        <div className="w-full bg-white mt-4 pb-4 border-b border-gray-100 shadow-inner">
          <div className="w-full bg-[#cd146e] py-4 mb-4 flex justify-center items-center shadow-md">
            <h2 className="text-white text-base md:text-xl font-black uppercase tracking-[0.2em] text-center px-4">
              Selos de Confiança & Reconhecimento
            </h2>
          </div>
          <div className="relative w-full overflow-hidden flex bg-white py-2">
            <div className="animate-marquee flex gap-16 shrink-0 justify-around min-w-full px-8 items-center">
              {listaSelos.map((selo, i) => (
  <img key={`l1-${selo.id || i}`} src={selo.imagem_url} alt={selo.nome} className="h-20 md:h-28 w-auto object-contain inline-block transition-transform hover:scale-105 duration-300" />
))}
            </div>
            <div className="animate-marquee flex gap-16 shrink-0 justify-around min-w-full px-8 items-center">
              {listaSelos.map((selo, i) => (
  <img key={`l1-${selo.id || i}`} src={selo.imagem_url} alt={selo.nome} className="h-20 md:h-28 w-auto object-contain inline-block transition-transform hover:scale-105 duration-300" />
))}
            </div>
          </div>
        </div>
      )}

      {/* --- SEÇÃO: TEXTO DE PARTÍCULAS (LATEC) --- */}
      <div className="w-full bg-white overflow-hidden">
        <div className="w-full h-[180px] md:h-[260px]">
          <ParticleText colors={['#cd146e', '#4690D1']} fontSize={150} replay={false} style={{ minWidth: 0 }} />
        </div>
      </div>

      {/* --- SEÇÃO 4: DIFERENCIAIS --- */}
{listaDiferenciais.length > 0 && (
  <div className="w-full bg-white pt-[3.25rem] pb-16">
  <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-8">
      <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Nossos Diferenciais</h2>
      <p className="text-sm md:text-base text-gray-500 mt-2 font-medium">Por que escolher o LATec para impulsionar o seu futuro profissional?</p>
    </div>
     <div className="w-full flex flex-col items-center">
      <div className="w-full min-h-[460px] flex items-center justify-center relative overflow-x-hidden overflow-y-visible px-2 py-10 gap-3 md:gap-6">
        {[0, 1, 2, 3, 4].map((posicaoFisica) => {
          const itemData = obterDadoDoCard(posicaoFisica);
          if (!itemData) return null;
          let estiloDestaque = posicaoFisica === 2 ? "scale-110 md:scale-115 opacity-100 z-30 shadow-2xl ring-4 ring-[#cd146e]/100" : (posicaoFisica === 1 || posicaoFisica === 3 ? "opacity-40 scale-95 z-20 shadow-md" : "opacity-10 scale-85 z-10 hidden sm:flex");

          const urlImagem = itemData.fotoUrl || itemData.imagem_url || itemData.foto_url;

          return (
            <div
              key={`card-fisico-${posicaoFisica}`}
              style={{ backgroundImage: `url('${urlImagem}')` }}
              className={`w-[22%] min-w-[220px] md:min-w-[300px] h-[360px] rounded-2xl relative bg-cover bg-center transition-all duration-500 ease-in-out transform flex flex-col justify-end p-6 overflow-hidden ${estiloDestaque}`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
              <div className="relative z-20 text-left pl-1 pr-2 pb-1">
                <h4 className="text-white text-base md:text-lg font-extrabold tracking-wide leading-snug uppercase">{itemData.titulo}</h4>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={irParaEsquerda}
          aria-label="Ver diferencial anterior"
          className="w-10 h-10 rounded-full bg-[#cd146e] hover:bg-black text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          {listaDiferenciais.map((_, idx) => (
            <span key={idx} className={`w-2 h-2 rounded-full transition-colors ${idx === indiceAtivo ? 'bg-[#cd146e]' : 'bg-gray-200'}`} />
          ))}
        </div>

        <button
          type="button"
          onClick={irParaDireita}
          aria-label="Ver próximo diferencial"
          className="w-10 h-10 rounded-full bg-[#cd146e] hover:bg-black text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
  </div>
)}
      {/* --- SEÇÃO 5: CURSOS EM DESTAQUE --- */}
      {cursosDestaque.length > 0 && (
        <div className="w-full bg-[#fdf0f6] relative overflow-hidden mt-0">
          <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[42vw] z-10">
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600" 
              alt="Alunos LATec" 
              className="w-full h-full object-cover"
            />
            <div className="absolute right-0 top-[110px] translate-x-1/2 z-30 w-24 h-24 flex items-center justify-center">
              <img 
                src="meclogo.png" 
                alt="Símbolo Oficial MEC"
                className="w-full h-full object-contain drop-shadow-md"
                onError={(e) => {
                  e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Bras%C3%A3o_do_Brasil.svg/1200px-Bras%C3%A3o_do_Brasil.svg.png";
                }}
              />
            </div>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[#fbe4f0] rounded-l-[120px] pointer-events-none z-0 opacity-60 hidden lg:block" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 py-20 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              <div className="lg:col-span-5 w-full flex items-center">
                <div className="block lg:hidden w-full h-[360px] relative rounded-2xl overflow-hidden shadow-md">
                  <div className="absolute top-4 left-4 bg-[#ffe600] text-gray-900 rounded-full w-16 h-16 flex flex-col items-center justify-center text-center p-1 shadow-md z-20">
                    <span className="text-[7px] font-bold uppercase leading-none">Nota MEC</span>
                    <span className="text-xl font-black leading-none">5</span>
                  </div>
                  <img 
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600" 
                    alt="Alunos LATec" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-7 text-left flex flex-col justify-center lg:pl-6">
                <h2 className="text-3xl md:text-[46px] font-black text-gray-900 tracking-tight leading-tight mb-4">
                  Cursos em <span className="text-[#cd146e]">Destaque</span>
                </h2>
                
                <p className="text-sm md:text-base text-gray-700 font-semibold max-w-xl leading-relaxed mb-6">
                  Formações atualizadas e focadas no que o mercado de trabalho está exigindo.
                </p>

                <a href="/cursos" className="text-gray-900 font-extrabold text-sm underline hover:text-[#cd146e] transition-colors mb-8 inline-block w-fit">
                  Ver todos os cursos
                </a>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {cursosDestaque.slice(0, 4).map((curso) => (
                    <a
                      key={`curso-home-${curso.id}`}
                      href={`/cursos/${curso.id}`}
                      className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer border border-gray-100"
                    >
                      <div className="w-full h-32 overflow-hidden relative bg-gray-50">
                        <img 
                          src={curso.fotoUrl} 
                          alt={curso.titulo} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-2 left-2 bg-[#cd146e] text-white font-black text-[8px] tracking-wider uppercase py-0.5 px-2 rounded-full">
                          {curso.categoria}
                        </span>
                      </div>
                      
                      <div className="p-4 flex flex-col flex-grow text-left">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">
                          ⏱ {curso.duracao}
                        </span>
                        <h4 className="text-sm font-black text-gray-800 mb-1 group-hover:text-[#cd146e] transition-colors duration-300 line-clamp-1">
                          {curso.titulo}
                        </h4>
                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed line-clamp-2">
                          {curso.resumo}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SEÇÃO: BLOG LA TEC (100% DINÂMICA, DESIGN ORIGINAL) --- */}
<section className="relative py-16 md:py-24 bg-[#fbf7f9] w-full overflow-hidden">
  <div className="absolute top-20 left-10 hidden lg:block opacity-30">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <pattern id="dots1" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="2" fill="#cd146e" />
      </pattern>
      <rect width="40" height="40" fill="url(#dots1)" />
    </svg>
  </div>
  <div className="absolute top-20 right-10 hidden lg:block opacity-30">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <pattern id="dots2" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="2" fill="#cd146e" />
      </pattern>
      <rect width="40" height="40" fill="url(#dots2)" />
    </svg>
  </div>

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="text-center max-w-3xl mx-auto mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-pink-100 rounded-full shadow-sm mb-6">
        <svg className="w-3.5 h-3.5 text-[#cd146e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span className="text-[10px] font-extrabold text-[#cd146e] tracking-widest uppercase">
          Blog LaTec
        </span>
      </div>

      <h2 className="text-3xl md:text-5xl font-extrabold text-[#1a103c] mb-4 tracking-tight">
        Conteúdos para <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#cd146e] to-[#6039d4]">impulsionar <br className="hidden md:block" /> sua carreira.</span>
      </h2>
      <p className="text-gray-500 text-sm md:text-base font-medium">
        Fique por dentro das novidades, dicas e tendências do mundo educacional.
      </p>
    </div>

    {(() => {
      const destaques = (noticiasDestaque || []).filter((item) => item.destaque === true);

      if (destaques.length === 0) {
        return (
          <p className="text-gray-400 text-sm py-12 text-center font-medium bg-white rounded-3xl border border-dashed border-slate-200">
            Nenhuma notícia marcada como destaque para exibir aqui. Vá ao painel Admin e ative a estrela ⭐!
          </p>
        );
      }

      const [principal, segundo, terceiro, quarto] = destaques;

      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* CARD PRINCIPAL (grande, esquerda) */}
          {principal && (
            <a
              href={`/blog/${principal.slug || principal.id}`}
              className="relative bg-black rounded-3xl overflow-hidden group min-h-[400px] lg:min-h-[500px] flex flex-col cursor-pointer shadow-lg"
            >
              <img
                src={principal.fotoUrl}
                alt={principal.titulo}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/60 to-transparent"></div>

              <div className="relative z-10 mt-auto p-6 md:p-8 flex flex-col">
                <span className="bg-[#cd146e] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider mb-3 w-max">
                  {principal.categoria || "Blog"}
                </span>
                <h3 className="text-white text-2xl md:text-3xl font-bold mb-3 leading-snug">
                  {principal.titulo}
                </h3>
                <p className="text-gray-300 text-sm mb-6 max-w-md line-clamp-2">
                  {principal.resumo}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-300 text-xs font-medium">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {principal.tempoLeitura} min de leitura
                    </span>
                    <span className="w-px h-3 bg-gray-500"></span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {principal.dataCriacao}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#cd146e] text-white flex items-center justify-center transform group-hover:bg-[#a61058] group-hover:translate-x-1 transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          )}

          {/* COLUNA DA DIREITA: 2 cards médios + 1 card largo */}
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 flex-1">
              {[segundo, terceiro].map((item, idx) =>
                item ? (
                  <a
                    key={item.id}
                    href={`/blog/${item.slug || item.id}`}
                    className="relative bg-black rounded-3xl overflow-hidden group min-h-[240px] flex flex-col cursor-pointer shadow-lg"
                  >
                    <img
                      src={item.fotoUrl}
                      alt={item.titulo}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/70 to-transparent"></div>
                    <div className="relative z-10 mt-auto p-5 flex flex-col h-full justify-end">
                      <span className="bg-[#cd146e] text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2.5 w-max">
                        {item.categoria || "Blog"}
                      </span>
                      <h3 className="text-white text-base md:text-lg font-bold mb-4 leading-snug">
                        {item.titulo}
                      </h3>
                      <div className="flex items-center gap-2.5 text-gray-300 text-[11px] font-medium mt-auto">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {item.tempoLeitura} min de leitura
                        </span>
                        <span className="w-px h-3 bg-gray-500"></span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {item.dataCriacao}
                        </span>
                      </div>
                    </div>
                  </a>
                ) : (
                  <div key={`empty-${idx}`} className="hidden sm:block" />
                )
              )}
            </div>

            {quarto && (
              <a
                href={`/blog/${quarto.slug || quarto.id}`}
                className="relative bg-black rounded-3xl overflow-hidden group min-h-[220px] flex flex-col cursor-pointer shadow-lg flex-1"
              >
                <img
                  src={quarto.fotoUrl}
                  alt={quarto.titulo}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/70 to-transparent"></div>
                <div className="relative z-10 mt-auto p-6 flex flex-col h-full justify-end">
                  <span className="bg-[#cd146e] text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider mb-3 w-max">
                    {quarto.categoria || "Blog"}
                  </span>
                  <h3 className="text-white text-lg md:text-xl font-bold mb-4 leading-snug max-w-lg">
                    {quarto.titulo}
                  </h3>
                  <div className="flex items-center gap-3 text-gray-300 text-xs font-medium mt-auto">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {quarto.tempoLeitura} min de leitura
                    </span>
                    <span className="w-px h-3 bg-gray-500"></span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {quarto.dataCriacao}
                    </span>
                  </div>
                </div>
              </a>
            )}
          </div>
        </div>
      );
    })()}

    <div className="mt-12 flex justify-center">
      <a
        href="/blog"
        className="bg-[#cd146e] hover:bg-[#a61058] text-white font-extrabold text-sm py-4 px-8 rounded-full transition-colors flex items-center gap-2 shadow-md cursor-pointer"
      >
        Ver todos os artigos
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </a>
    </div>
  </div>
</section>

      {/* --- SEÇÃO: FORMULÁRIO DE CONTATO --- */}
      <section className="relative py-16 md:py-20 bg-black w-full overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
              Fale com a <span className="text-[#cd146e]">LATec</span>
            </h2>
            <p className="text-gray-500 text-sm md:text-base font-medium">
              Preencha o formulário abaixo e nossa equipe entrará em contato com você pelo WhatsApp.
            </p>
          </div>

          {contatoStatus === 'sucesso' && (
            <div className="w-full bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Perfeito! Abrimos o WhatsApp com sua mensagem pronta para enviar.
            </div>
          )}

          {contatoStatus === 'erro' && (
            <div className="w-full bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Preencha ao menos o nome, e-mail e mensagem antes de enviar.
            </div>
          )}

          <div className="w-full bg-[#F8F9FA] rounded-[2rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)] border border-gray-100 p-8 md:p-10">
            <form onSubmit={handleContatoSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Nome Completo <span className="text-[#cd146e]">*</span>
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={contatoForm.nome}
                    onChange={handleContatoChange}
                    placeholder="Seu nome completo"
                    required
                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#cd146e]/10 focus:border-[#cd146e] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    E-mail <span className="text-[#cd146e]">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={contatoForm.email}
                    onChange={handleContatoChange}
                    placeholder="seu@email.com"
                    required
                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#cd146e]/10 focus:border-[#cd146e] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Telefone</label>
                  <input
                    type="tel"
                    name="telefone"
                    value={contatoForm.telefone}
                    onChange={handleContatoChange}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#cd146e]/10 focus:border-[#cd146e] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Curso Desejado</label>
                  <input
                    type="text"
                    name="curso"
                    value={contatoForm.curso}
                    onChange={handleContatoChange}
                    placeholder="Ex: Técnico em Enfermagem"
                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#cd146e]/10 focus:border-[#cd146e] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Mensagem <span className="text-[#cd146e]">*</span>
                </label>
                <textarea
                  name="mensagem"
                  value={contatoForm.mensagem}
                  onChange={handleContatoChange}
                  placeholder="Como podemos te ajudar?"
                  required
                  rows={5}
                  className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#cd146e]/10 focus:border-[#cd146e] transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#cd146e] to-[#a61058] hover:from-[#a61058] hover:to-[#8a0d49] text-white font-black text-sm uppercase tracking-wider py-4 rounded-2xl shadow-lg shadow-[#cd146e]/20 transition-all cursor-pointer active:scale-[0.99]"
              >
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}