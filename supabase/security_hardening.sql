-- ============================================================================
-- LATec — ENDURECIMENTO DE SEGURANÇA (RLS / AUTORIZAÇÃO)
-- ============================================================================
--
-- >>> COMO RODAR ESTE ARQUIVO <<<
--
-- Ele está dividido em 4 PARTES INDEPENDENTES, cada uma com o próprio
-- begin/commit. RODE UMA PARTE DE CADA VEZ no SQL Editor do Supabase
-- (selecione o bloco e aperte Run) e confira a saída antes de ir para a
-- próxima.
--
-- NÃO rode o arquivo inteiro de uma vez. A PARTE 4 (policies de Storage)
-- costuma falhar por falta de ownership de `storage.objects` em projetos
-- Supabase — e, se tudo estivesse numa transação só, esse erro reverteria
-- também a PARTE 2, que é a correção crítica. Foi exatamente isso que
-- aconteceu na primeira tentativa de aplicar este script: o banco ficou
-- intacto e a vulnerabilidade seguiu aberta.
--
-- Se uma PARTE der erro, as anteriores permanecem aplicadas. A PARTE 4 tem
-- um plano B pelo Dashboard, descrito nela.
--
-- ----------------------------------------------------------------------------
-- CONTEXTO DO PROBLEMA CORRIGIDO POR ESTE SCRIPT
-- ----------------------------------------------------------------------------
-- O schema anterior (supabase/schema_completo.sql) concedia INSERT / UPDATE /
-- DELETE em TODAS as tabelas de conteúdo, e no bucket de Storage "banners",
-- para a role `authenticated` com `using (true)` / `with check (true)` — ou
-- seja, para qualquer conta logada, sem nenhum conceito de administrador.
--
-- PIOR AINDA — CONFIRMADO POR TESTE ATIVO EM 2026-09-16:
--
-- Um teste de escrita anônima (PATCH gravando o mesmo valor já existente, com
-- `Prefer: return=representation`, usando APENAS a anon key e SEM nenhum login)
-- foi ACEITO pelo banco nas seguintes 7 tabelas:
--
--     noticias                 <-- e esta está no schema_completo.sql como
--                                  "insert/delete to authenticated"! A produção
--                                  divergiu do que está versionado.
--     contato_footer
--     categorias
--     home_carrossel_3d
--     sobre_galeria
--     sobre_produto_destaque
--     sobre_redes_sociais
--
-- Ou seja: nessas tabelas nem cadastro era necessário. Qualquer pessoa com a
-- anon key (que está publicada no bundle, por design) podia reescrever as
-- notícias do blog e o telefone/WhatsApp/redes sociais do rodapé do site.
-- A causa é RLS DESABILITADO nessas tabelas — as 6 últimas foram criadas pelo
-- Table Editor do Dashboard e nunca passaram por este repositório.
--
-- As outras tabelas testadas (banners, selos, depoimentos, diferenciais, faqs,
-- banner_blog_lateral, sobre_historia, cursos_cadastrados) bloquearam a escrita
-- anônima — nelas valia a falha original, de escrita liberada para qualquer
-- conta autenticada.
--
-- Este script corrige os dois casos de uma vez e substitui o modelo por uma
-- allowlist explícita de administradores (tabela public.admins).
--
-- ----------------------------------------------------------------------------
-- AÇÕES MANUAIS QUE ESTE SQL NÃO FAZ
-- ----------------------------------------------------------------------------
--   [x] Desabilitar o cadastro público (Authentication -> Sign In / Providers).
--       CONFIRMADO APLICADO em 2026-09-16: disable_signup = true.
--   [ ] Rotacionar a senha da conta de admin: a senha "123456" esteve
--       publicada em texto puro no bundle JavaScript do site.
-- ============================================================================


-- ############################################################################
-- PARTE 1 de 4 — ALLOWLIST DE ADMINISTRADORES
-- ############################################################################
-- Rode este bloco sozinho. Depois EDITE e rode o INSERT do bloco 1.3.

begin;

-- 1.1 — Tabela de allowlist.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
alter table public.admins force row level security;

-- Sem nenhuma policy, o RLS nega tudo para anon e authenticated: a tabela é
-- invisível e imutável pelo PostgREST. Ela é gerenciada apenas pelo SQL Editor
-- / service_role, que passam por cima do RLS.
revoke all on public.admins from anon, authenticated;

-- 1.2 — Função de verificação usada por todas as policies e pelo frontend.
-- SECURITY DEFINER para conseguir ler public.admins mesmo com RLS ativo;
-- search_path fixo para impedir sequestro de schema.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $fn$
  select exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  );
$fn$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

commit;

-- 1.3 — REGISTRAR OS ADMINISTRADORES  <<< EDITE O E-MAIL E RODE >>>
-- Troque pelo endereço real da conta do painel. Rode uma vez por admin.
--
--   insert into public.admins (user_id, email)
--   select id, email from auth.users where email = 'admin@latec.com.br'
--   on conflict (user_id) do nothing;
--
-- CONFERIR (tem que retornar pelo menos 1 linha — se voltar vazio, o e-mail
-- está errado e NINGUÉM vai conseguir usar o painel):
--
--   select * from public.admins;


-- ############################################################################
-- PARTE 2 de 4 — POLICIES DAS 17 TABELAS DE CONTEÚDO  [CORREÇÃO CRÍTICA]
-- ############################################################################
-- Esta é a parte que fecha a escrita anônima. Rode este bloco sozinho.
--
-- Modelo aplicado a cada tabela:
--   SELECT                   -> anon + authenticated (o site é público)
--   INSERT / UPDATE / DELETE -> somente authenticated E presente em public.admins

begin;

do $migracao$
declare
  t text;
  p record;
  tabelas text[] := array[
    'banners',
    'selos',
    'depoimentos',
    'diferenciais',
    'noticias',
    'faqs',
    'vagas',
    'cursos_destaque',
    'banner_blog_lateral',
    'sobre_historia',
    'cursos_cadastrados',
    'categorias',
    'contato_footer',
    'home_carrossel_3d',
    'sobre_galeria',
    'sobre_produto_destaque',
    'sobre_redes_sociais'
  ];
begin
  foreach t in array tabelas loop
    -- Pula tabelas inexistentes neste projeto em vez de abortar o script.
    if to_regclass('public.' || quote_ident(t)) is null then
      raise notice 'IGNORADA: public.% nao existe neste projeto.', t;
      continue;
    end if;

    -- Liga o RLS. É isto que fecha a escrita anônima nas 7 tabelas que
    -- estavam com RLS desligado.
    execute format('alter table public.%I enable row level security', t);
    -- Impede que o dono da tabela escape do RLS.
    execute format('alter table public.%I force row level security', t);

    -- Defesa em profundidade: mesmo com RLS ligado, a role `anon` não tem
    -- motivo para ter permissão de escrita no nível de GRANT. Se alguém
    -- desligar o RLS de novo pelo Dashboard, isto ainda segura a escrita
    -- anônima. `authenticated` mantém os grants — quem filtra lá é o RLS.
    execute format('revoke insert, update, delete on public.%I from anon', t);
    execute format('grant select on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);

    -- Remove TODAS as policies antigas da tabela, inclusive as `using (true)`
    -- de schema_completo.sql, sob qualquer nome. Sem isto, uma policy
    -- permissiva esquecida continuaria valendo: no Postgres, policies
    -- PERMISSIVE se somam com OR — basta uma frouxa para liberar tudo.
    for p in
      select policyname from pg_policies
      where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;

    -- Os nomes de tabela vêm do array literal acima, não de entrada externa.
    -- Ainda assim usamos %I para o identificador, e passamos o argumento duas
    -- vezes em vez de usar especificador posicional (%1$I), que é sintaxe
    -- menos comum e mais fácil de quebrar.
    execute format(
      'create policy "%s: select publico" on public.%I'
      || ' for select to anon, authenticated using (true)', t, t);

    execute format(
      'create policy "%s: insert admin" on public.%I'
      || ' for insert to authenticated with check (public.is_admin())', t, t);

    execute format(
      'create policy "%s: update admin" on public.%I'
      || ' for update to authenticated'
      || ' using (public.is_admin()) with check (public.is_admin())', t, t);

    execute format(
      'create policy "%s: delete admin" on public.%I'
      || ' for delete to authenticated using (public.is_admin())', t, t);

    raise notice 'OK: public.% -> RLS forcado, grants de escrita de anon revogados, 4 policies recriadas.', t;
  end loop;

  -- REDE DE SEGURANÇA: a lista acima é fixa. Se alguém criar uma tabela nova
  -- pelo Table Editor do Dashboard, ela nasce com RLS DESLIGADO e fica aberta
  -- para escrita anônima — que foi exatamente como as 7 tabelas vulneráveis
  -- surgiram. Este bloco não corrige sozinho (seria arriscado mexer às cegas
  -- em tabela desconhecida), mas GRITA o nome dela na saída do SQL Editor.
  for p in
    select c.relname
    from pg_class c
    where c.relnamespace = 'public'::regnamespace
      and c.relkind = 'r'
      and not (c.relname = any (tabelas))
      and c.relname <> 'admins'
  loop
    raise warning 'ATENCAO: tabela public.% NAO esta na lista deste script e nao foi protegida. Revise manualmente.', p.relname;
  end loop;
end
$migracao$;

commit;

-- Faz o PostgREST recarregar o cache de schema (senão a RPC is_admin pode
-- continuar respondendo 404 por alguns minutos).
notify pgrst, 'reload schema';


-- ############################################################################
-- PARTE 3 de 4 — LIMITES DO BUCKET DE STORAGE
-- ############################################################################
-- Rode este bloco sozinho. Se der "must be owner of table buckets", use o
-- plano B logo abaixo.

begin;

update storage.buckets
set
  public = true,              -- as imagens do site saem daqui, a leitura fica aberta
  file_size_limit = 5242880,  -- 5 MB
  allowed_mime_types = array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'image/avif'
  ]
where id = 'banners';
-- NOTA: 'image/svg+xml' é intencionalmente EXCLUÍDO. SVG é um documento XML que
-- pode conter <script>; servido de um bucket público, vira XSS armazenado no
-- domínio do Storage.

commit;

-- PLANO B (se o UPDATE acima falhar por permissão):
--   Dashboard -> Storage -> banners -> ícone de engrenagem / "Edit bucket":
--     - Restrict file upload size: 5 MB
--     - Allowed MIME types: image/png, image/jpeg, image/webp, image/gif, image/avif
--
-- CONFERIR:
--   select id, public, file_size_limit, allowed_mime_types
--   from storage.buckets where id = 'banners';


-- ############################################################################
-- PARTE 4 de 4 — POLICIES DO BUCKET DE STORAGE
-- ############################################################################
-- Rode este bloco sozinho. `storage.objects` pertence a `supabase_storage_admin`
-- e em muitos projetos o SQL Editor NÃO consegue alterar policies dele. Se der
-- "must be owner of table objects", use o plano B abaixo — é equivalente.

begin;

-- Remove TODA policy de storage.objects que se refira ao bucket 'banners',
-- sob QUALQUER nome — não só as 7 que este repositório conhece.
--
-- Isso importa: policies criadas pelo Dashboard recebem nomes automáticos
-- ("Allow uploads 1abc2de_0" e afins) que não estão em nenhuma lista fixa.
-- Como policies PERMISSIVE se somam com OR, UMA dessas esquecida anula
-- todas as restrições criadas abaixo. Dropar por nome literal deixava
-- exatamente esse buraco aberto.
--
-- O filtro por 'banners' é proposital: policies de outros buckets não são
-- tocadas.
do $storage$
declare
  p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and (coalesce(qual, '') like '%banners%'
        or coalesce(with_check, '') like '%banners%')
  loop
    execute format('drop policy %I on storage.objects', p.policyname);
    raise notice 'REMOVIDA policy antiga de storage.objects: %', p.policyname;
  end loop;
end
$storage$;

create policy "banners bucket: leitura publica"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'banners');

create policy "banners bucket: insert admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'banners' and public.is_admin());

create policy "banners bucket: update admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'banners' and public.is_admin())
  with check (bucket_id = 'banners' and public.is_admin());

create policy "banners bucket: delete admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'banners' and public.is_admin());

commit;

-- PLANO B (se os comandos acima falharem por permissão):
--   Dashboard -> Storage -> Policies -> objects -> New policy (For full
--   customization), criando as 4 policies abaixo no bucket `banners`:
--
--     SELECT | roles: anon, authenticated | USING:
--       bucket_id = 'banners'
--     INSERT | roles: authenticated       | WITH CHECK:
--       bucket_id = 'banners' and public.is_admin()
--     UPDATE | roles: authenticated       | USING e WITH CHECK:
--       bucket_id = 'banners' and public.is_admin()
--     DELETE | roles: authenticated       | USING:
--       bucket_id = 'banners' and public.is_admin()
--
--   E APAGUE as policies antigas "upload autenticado" / "delete autenticado",
--   senão elas continuam valendo em paralelo (policies PERMISSIVE se somam
--   com OR — uma frouxa anula as restritivas).


-- ############################################################################
-- VERIFICAÇÃO PÓS-APLICAÇÃO
-- ############################################################################
--
-- >>> AS VERIFICAÇÕES V1 a V6 AGORA VIVEM EM supabase/verificacao.sql <<<
--
-- Lá elas estão como SQL executável (é só colar o arquivo no SQL Editor e
-- apertar Run), e cada uma já devolve um veredito PASSA/FALHA pronto, em vez
-- de saída crua para interpretar na mão.
--
-- As cópias abaixo ficam aqui só como referência rápida.
--
-- V1 — Nenhuma policy de escrita pode ter qual/with_check = 'true'.
--      Todas têm que mencionar is_admin():
--
--   select tablename, policyname, cmd, qual, with_check
--   from pg_policies
--   where schemaname = 'public' and cmd <> 'SELECT'
--   order by tablename, cmd;
--
-- V2 — Nenhuma tabela de conteúdo pode ficar com RLS desligado.
--      Foi assim que as 7 tabelas acabaram abertas para anon.
--      ESPERADO: zero linhas.
--
--   select relname from pg_class
--   where relnamespace = 'public'::regnamespace and relkind = 'r'
--     and not relrowsecurity;
--
-- V3 — A role anon não pode ter nenhum grant de escrita.
--      ESPERADO: zero linhas.
--
--   select table_name, privilege_type
--   from information_schema.role_table_grants
--   where grantee = 'anon' and table_schema = 'public'
--     and privilege_type in ('INSERT','UPDATE','DELETE');
--
-- V4 — Contagem de policies por tabela. ESPERADO: 4 em cada uma das 17.
--
--   select tablename, count(*) from pg_policies
--   where schemaname = 'public' group by tablename order by tablename;
--
-- V5 — A allowlist não pode estar vazia, senão o painel não abre pra ninguém:
--
--   select * from public.admins;
--
-- V6 — Policies do bucket (esperado: 4, e as de escrita citando is_admin):
--
--   select policyname, cmd, qual, with_check from pg_policies
--   where schemaname = 'storage' and tablename = 'objects';
--
--
-- V7 — TESTE EXTERNO DE ESCRITA ANÔNIMA (o que detectou a falha original).
--      Roda do terminal, não no SQL Editor. Grava em cada linha o valor que
--      ela já tem, então não altera dado nenhum. TODAS devem responder `[]`;
--      qualquer tabela que devolva o objeto da linha continua vulnerável:
--
--   K='<ANON_KEY>'; U='https://<PROJETO>.supabase.co'
--   for t in noticias contato_footer home_carrossel_3d sobre_galeria \
--            sobre_produto_destaque sobre_redes_sociais; do
--     printf '%-24s ' "$t"
--     curl -s -X PATCH "$U/rest/v1/$t?id=eq.1" -H "apikey: $K" \
--       -H "Content-Type: application/json" \
--       -H "Prefer: return=representation" -d '{"id":1}'
--     echo
--   done
