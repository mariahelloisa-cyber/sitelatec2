-- ============================================================================
-- LATec — CORREÇÃO DAS FALHAS V3 e V5 DO PLACAR
-- ============================================================================
--
-- >>> NÃO COLE O ARQUIVO INTEIRO DE UMA VEZ <<<
--
-- A PARTE B contém um INSERT ativo. Rodá-lo cedo demais FECHA a janela de
-- teste descrita no fim do arquivo (a única forma de provar, sem criar conta
-- descartável, que um autenticado comum não escreve).
--
-- ORDEM CORRETA:
--   1. FASE 1 da "JANELA DE TESTE" (terminal)  -> prova o item 7
--   2. PARTE A   (já executada em 2026-09-16)
--   3. PARTE B   -> registra o admin
--   4. FASE 3 da "JANELA DE TESTE" (terminal)  -> prova o item 8
--   5. PARTE D   (opcional)
--
-- Resultado do placar em 2026-09-16 (supabase/verificacao.sql):
--
--   V1  Policies de escrita sem is_admin() ......... 0   PASSA
--   V2  Tabelas com RLS desligado .................. 0   PASSA
--   V3  Grants de escrita da role anon ............ 12   FALHA  <-- PARTE A
--   V4  Tabelas com policies <> 4 .................. 0   PASSA
--   V4b Tabelas com RLS ligado e ZERO policies ..... 4   FALHA  <-- ver NOTA
--   V5  Administradores na allowlist ............... 0   FALHA  <-- PARTE B
--   V6  Policies do bucket banners ................. 4   PASSA
--   V6b Policies de escrita do bucket sem is_admin.. 0   PASSA
--
-- LEITURA DO RESULTADO
-- ----------------------------------------------------------------------------
-- A parte crítica FOI CORRIGIDA: V1, V2, V4, V6 e V6b passaram, e o teste
-- externo de escrita anônima retorna 401/42501 nas 15 tabelas com dados.
-- Nenhuma das 3 falhas reabre a vulnerabilidade original. Mas duas precisam
-- de ação, e uma delas quebra o painel.
--
-- V5 = 0  -> BLOQUEADOR FUNCIONAL, não de segurança.
--            A allowlist está VAZIA. Hoje NINGUÉM consegue usar o painel
--            administrativo: is_admin() retorna false para toda conta, então
--            toda escrita é negada, inclusive a sua. O bloco 1.3 do
--            security_hardening.sql (o INSERT) nunca foi executado.
--
-- V3 = 12 -> RISCO LATENTE, não exploração ativa.
--            12 grants = 4 tabelas x 3 privilégios (INSERT/UPDATE/DELETE).
--            São as MESMAS 4 tabelas do V4b: elas têm RLS ligado e ZERO
--            policies, então o RLS nega tudo e o grant não é explorável AGORA.
--            O problema é que essa é exatamente a combinação que virou a
--            falha crítica original: basta alguém desligar o RLS dessa tabela
--            pelo Dashboard para a escrita anônima voltar, sem nenhum aviso.
--            Defesa em profundidade: revogar o grant também.
--
-- V4b = 4 -> IDENTIFICADAS. Não é falha: são tabelas de backup esquecidas.
--
--            cursos_cadastrados_backup_antes_recovery
--            cursos_cadastrados_backup_encoding
--            cursos_cadastrados_backup_flex
--            cursos_cadastrados_backup_metodologia
--
--            "RLS ligado + zero policies" = tabela TRANCADA: nega anon E
--            authenticated, inclusive leitura. Confirmado por teste externo
--            em 2026-09-16: GET anônimo nas 4 devolve `[]` (HTTP 200, zero
--            linhas) — o RLS filtra tudo, nenhum dado sai.
--
--            O site NÃO lê nenhuma delas (nenhuma aparece em src/), então a
--            PARTE C não é necessária: deixá-las trancadas não quebra nada.
--            Mas elas contêm cópias reais do catálogo de cursos e continuam
--            publicadas como endpoint no PostgREST (respondem 200, não 404).
--            Backup de dado real exposto como endpoint é superfície de ataque
--            sem contrapartida: ver PARTE D.
-- ============================================================================


-- ############################################################################
-- PARTE A — revogar os grants de escrita sobrando da role anon  (corrige V3)
-- ############################################################################
-- Varre TODAS as tabelas de public, inclusive as 4 que este repositório não
-- conhece, e tira INSERT/UPDATE/DELETE da anon. Não mexe em SELECT, então a
-- leitura pública do site continua funcionando.
--
-- Seguro de rodar quantas vezes quiser.

do $revoga$
declare
  r record;
begin
  for r in
    select c.relname
    from pg_class c
    where c.relnamespace = 'public'::regnamespace
      and c.relkind = 'r'
  loop
    execute format('revoke insert, update, delete on public.%I from anon', r.relname);
    raise notice 'anon: INSERT/UPDATE/DELETE revogados em public.%', r.relname;
  end loop;
end
$revoga$;

-- Impede que tabelas CRIADAS NO FUTURO já nasçam com grant de escrita para
-- anon. Sem isto, a próxima tabela feita pelo Table Editor repete o problema.
alter default privileges in schema public
  revoke insert, update, delete on tables from anon;

-- CONFERIR (esperado: zero linhas):
--   select table_name, privilege_type
--   from information_schema.role_table_grants
--   where grantee = 'anon' and table_schema = 'public'
--     and privilege_type in ('INSERT','UPDATE','DELETE');


-- ############################################################################
-- PARTE B — registrar o administrador  (corrige V5)  <<< EDITE O E-MAIL >>>
-- ############################################################################
-- SEM ESTE PASSO O PAINEL NÃO ABRE PARA NINGUÉM.
--
-- PASSO 1 — JÁ FEITO em 2026-09-16. O projeto tem UMA única conta:
--
--   id      46e4ec23-5506-4b1e-997c-c15ffc505a39
--   email   adminlatec@gmail.com
--   e-mail confirmado em 2026-08-05, último login em 2026-09-16
--
-- Não há nenhuma outra conta — o que é o esperado num projeto sem área de
-- aluno, e confirma que o cadastro público aberto não chegou a ser abusado.
--
-- ATENÇÃO À ORDEM: antes de rodar o INSERT abaixo, veja a seção
-- "JANELA DE TESTE" no fim deste arquivo. Enquanto public.admins está vazia,
-- esta mesma conta serve de cobaia para provar que um autenticado comum NÃO
-- escreve (item 7 da auditoria). Depois do INSERT essa prova fica impossível
-- sem criar uma conta descartável.

-- PASSO 2 — registrar o admin. Pronto para rodar, sem edição:

insert into public.admins (user_id, email)
select id, email from auth.users
where email = 'adminlatec@gmail.com'
on conflict (user_id) do nothing;

-- PASSO 3 — CONFERIR. Tem que voltar exatamente 1 linha:

select * from public.admins;


-- ############################################################################
-- PARTE C — (SÓ SE NECESSÁRIO) liberar leitura das tabelas trancadas
-- ############################################################################
-- Rode o BLOCO 1B do verificacao.sql primeiro. Se alguma das 4 tabelas for
-- lida pelo site, ela precisa de policy de SELECT — senão a seção
-- correspondente da página aparece vazia.
--
-- Para cada tabela nessa situação, troque NOME_DA_TABELA e rode:
--
--   alter table public.NOME_DA_TABELA enable row level security;
--   alter table public.NOME_DA_TABELA force row level security;
--
--   create policy "NOME_DA_TABELA: select publico" on public.NOME_DA_TABELA
--     for select to anon, authenticated using (true);
--   create policy "NOME_DA_TABELA: insert admin" on public.NOME_DA_TABELA
--     for insert to authenticated with check (public.is_admin());
--   create policy "NOME_DA_TABELA: update admin" on public.NOME_DA_TABELA
--     for update to authenticated
--     using (public.is_admin()) with check (public.is_admin());
--   create policy "NOME_DA_TABELA: delete admin" on public.NOME_DA_TABELA
--     for delete to authenticated using (public.is_admin());
--
-- E acrescente o nome dela ao array `tabelas` da PARTE 2 do
-- security_hardening.sql, para que a próxima execução do script a cubra.


-- ############################################################################
-- PARTE D — tirar as 4 tabelas de backup da superfície pública
-- ############################################################################
-- Situação: elas estão TRANCADAS pelo RLS (não vazam dado), mas continuam
-- publicadas como endpoint do PostgREST e guardam cópias reais do catálogo
-- de cursos. Enquanto viverem no schema `public`, dependem do RLS continuar
-- ligado — o mesmo fio de cabelo que falhou na primeira vez.
--
-- O site não lê nenhuma delas, então qualquer uma das opções abaixo é segura.
-- ESCOLHA UMA.
--
-- --- OPÇÃO 1 (recomendada): mover para um schema fora da API ---------------
-- O PostgREST só publica os schemas configurados (public, graphql_public).
-- Movendo para `backup`, as tabelas somem da API mas os dados continuam lá,
-- consultáveis pelo SQL Editor. É reversível.
--
--   create schema if not exists backup;
--   revoke all on schema backup from anon, authenticated;
--
--   alter table public.cursos_cadastrados_backup_antes_recovery  set schema backup;
--   alter table public.cursos_cadastrados_backup_encoding        set schema backup;
--   alter table public.cursos_cadastrados_backup_flex            set schema backup;
--   alter table public.cursos_cadastrados_backup_metodologia     set schema backup;
--
--   notify pgrst, 'reload schema';
--
--   CONFERIR: GET .../rest/v1/cursos_cadastrados_backup_flex deve passar a
--   responder 404 (antes respondia 200 com `[]`).
--
-- --- OPÇÃO 2: apagar de vez -------------------------------------------------
-- Só se você tiver certeza de que não precisa mais desses backups.
-- NÃO TEM VOLTA.
--
--   drop table public.cursos_cadastrados_backup_antes_recovery;
--   drop table public.cursos_cadastrados_backup_encoding;
--   drop table public.cursos_cadastrados_backup_flex;
--   drop table public.cursos_cadastrados_backup_metodologia;
--
-- --- OPÇÃO 3: não fazer nada ------------------------------------------------
-- Aceitável. Elas estão trancadas e a PARTE A já revogou os grants. Registre
-- a decisão para o pentester, porque ele vai encontrar os endpoints.


-- ############################################################################
-- JANELA DE TESTE — aproveite que a allowlist está vazia
-- ############################################################################
-- O projeto tem uma única conta. Criar uma conta descartável só para o teste
-- do "autenticado não-admin" daria trabalho e deixaria lixo em auth.users.
--
-- Só que AGORA, com public.admins vazia, adminlatec@gmail.com É, na prática,
-- um autenticado comum: is_admin() retorna false para ela. Dá para provar os
-- dois itens com a MESMA conta, de graça, se a ordem for respeitada.
--
--   FASE 1 — ANTES do INSERT da PARTE B (allowlist vazia):
--            prova que autenticado fora da allowlist NÃO escreve (item 7).
--
--     No PowerShell, na pasta do projeto:
--       $env:EMAIL_NAO_ADMIN='adminlatec@gmail.com'
--       $env:SENHA_NAO_ADMIN='<a senha>'
--       & "C:\Program Files\Git\bin\bash.exe" scripts/verificar-seguranca.sh
--
--     ESPERADO: seção 4 toda [OK] ("não-admin bloqueado" em cada tabela).
--     Se alguma linha disser "NÃO-ADMIN CONSEGUE ESCREVER", sobrou policy
--     permissiva e a correção está incompleta.
--
--   FASE 2 — rode o INSERT da PARTE B.
--
--   FASE 3 — DEPOIS do INSERT: prova que o admin legítimo escreve (item 8).
--
--       $env:EMAIL_NAO_ADMIN=''      # limpa, senão a seção 4 agora falha
--       $env:SENHA_NAO_ADMIN=''      # de propósito: a conta virou admin
--       $env:EMAIL_ADMIN='adminlatec@gmail.com'
--       $env:SENHA_ADMIN='<a senha>'
--       & "C:\Program Files\Git\bin\bash.exe" scripts/verificar-seguranca.sh
--
--     ESPERADO: seção 5 toda [OK], incluindo "is_admin() retorna true".
--
-- A senha vai só em variável de ambiente da sua sessão, nunca em arquivo.
-- Se preferir não usar a conta real, crie uma descartável em
-- Authentication -> Users -> Add user, NÃO a insira em public.admins, use-a
-- na FASE 1 e apague depois.


-- ############################################################################
-- DEPOIS DE RODAR: reconferir
-- ############################################################################
--   1. supabase/verificacao.sql   -> V3 e V5 devem virar PASSA
--   2. o script de terminal, conforme a FASE 3 acima
