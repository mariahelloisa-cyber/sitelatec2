-- ============================================================================
-- LATec — VERIFICAÇÃO PÓS-APLICAÇÃO (V1 a V6)
-- ============================================================================
-- Rode DEPOIS de aplicar as 4 partes do security_hardening.sql.
--
-- COMO USAR: cole o arquivo inteiro no SQL Editor do Supabase e aperte Run.
-- Este arquivo é 100% SOMENTE LEITURA — não altera nada.
--
-- O BLOCO 1 devolve UMA tabela com o veredito de cada verificação. Se todas as
-- linhas mostrarem PASSA, os requisitos 1 a 5 estão cumpridos no banco.
--
-- Se alguma linha mostrar FALHA, rode a consulta de detalhe correspondente no
-- BLOCO 2 para ver exatamente qual tabela/policy está errada.
--
-- (V7 é o teste de escrita anônima e roda do terminal, não aqui:
--  bash scripts/verificar-seguranca.sh)
-- ============================================================================


-- ############################################################################
-- BLOCO 1 — PLACAR (rode isto primeiro)
-- ############################################################################

with
-- V1: toda policy de escrita precisa mencionar is_admin(). Uma policy de
-- escrita com qual/with_check = 'true' é a falha original voltando.
v1 as (
  select count(*) as n
  from pg_policies
  where schemaname = 'public'
    and cmd <> 'SELECT'
    and coalesce(qual, '')       not like '%is_admin%'
    and coalesce(with_check, '') not like '%is_admin%'
),
-- V2: tabela com RLS desligado fica aberta para anon. Foi assim que as 7
-- tabelas vulneráveis surgiram.
v2 as (
  select count(*) as n
  from pg_class
  where relnamespace = 'public'::regnamespace
    and relkind = 'r'
    and not relrowsecurity
),
-- V3: a role anon não pode ter INSERT/UPDATE/DELETE em nenhuma tabela.
v3 as (
  select count(*) as n
  from information_schema.role_table_grants
  where grantee = 'anon'
    and table_schema = 'public'
    and privilege_type in ('INSERT', 'UPDATE', 'DELETE')
),
-- V4: cada tabela de conteúdo deve ter exatamente 4 policies
-- (select publico + insert/update/delete admin). Menos que 4 = policy faltando;
-- mais que 4 = sobrou policy antiga, e policies PERMISSIVE se somam com OR.
v4 as (
  select count(*) as n
  from (
    select tablename
    from pg_policies
    where schemaname = 'public' and tablename <> 'admins'
    group by tablename
    having count(*) <> 4
  ) as fora_do_padrao
),
-- V4b: tabela com RLS LIGADO e ZERO policies bloqueia até a leitura pública —
-- o site carregaria vazio. O V4 acima não pega esse caso, porque pg_policies
-- só lista policies que existem: uma tabela sem nenhuma simplesmente não
-- aparece lá. `admins` é de propósito assim e por isso fica de fora.
v4b as (
  select count(*) as n
  from pg_class c
  where c.relnamespace = 'public'::regnamespace
    and c.relkind = 'r'
    and c.relrowsecurity
    and c.relname <> 'admins'
    and not exists (
      select 1 from pg_policies p
      where p.schemaname = 'public' and p.tablename = c.relname
    )
),
-- V5: allowlist vazia = painel não abre para ninguém.
v5 as (
  select count(*) as n from public.admins
),
-- V6: policies do bucket. Esperado: 4, sendo as 3 de escrita com is_admin().
v6_total as (
  select count(*) as n
  from pg_policies
  where schemaname = 'storage' and tablename = 'objects'
    and (coalesce(qual, '') like '%banners%'
      or coalesce(with_check, '') like '%banners%')
),
v6_frouxas as (
  select count(*) as n
  from pg_policies
  where schemaname = 'storage' and tablename = 'objects'
    and cmd <> 'SELECT'
    and (coalesce(qual, '') like '%banners%'
      or coalesce(with_check, '') like '%banners%')
    and coalesce(qual, '')       not like '%is_admin%'
    and coalesce(with_check, '') not like '%is_admin%'
)
select * from (
  select 1 as ord, 'V1' as id,
         'Policies de escrita sem is_admin()' as verificacao,
         v1.n::text as valor, '0' as esperado,
         case when v1.n = 0 then 'PASSA' else 'FALHA' end as veredito
  from v1
  union all
  select 2, 'V2', 'Tabelas em public com RLS DESLIGADO',
         v2.n::text, '0',
         case when v2.n = 0 then 'PASSA' else 'FALHA' end
  from v2
  union all
  select 3, 'V3', 'Grants de escrita da role anon',
         v3.n::text, '0',
         case when v3.n = 0 then 'PASSA' else 'FALHA' end
  from v3
  union all
  select 4, 'V4', 'Tabelas com numero de policies <> 4',
         v4.n::text, '0',
         case when v4.n = 0 then 'PASSA' else 'FALHA' end
  from v4
  union all
  select 5, 'V4b', 'Tabelas com RLS ligado e ZERO policies (site quebra)',
         v4b.n::text, '0',
         case when v4b.n = 0 then 'PASSA' else 'FALHA' end
  from v4b
  union all
  select 6, 'V5', 'Administradores na allowlist',
         v5.n::text, '>= 1',
         case when v5.n >= 1 then 'PASSA' else 'FALHA' end
  from v5
  union all
  select 7, 'V6', 'Policies do bucket banners (total)',
         v6_total.n::text, '4',
         case when v6_total.n = 4 then 'PASSA' else 'FALHA' end
  from v6_total
  union all
  select 8, 'V6b', 'Policies de escrita do bucket sem is_admin()',
         v6_frouxas.n::text, '0',
         case when v6_frouxas.n = 0 then 'PASSA' else 'FALHA' end
  from v6_frouxas
) as placar
order by ord;


-- ############################################################################
-- BLOCO 1B — DIAGNÓSTICO DAS FALHAS V3 / V4b  (rode isto, já descomentado)
-- ############################################################################
-- Mostra, numa tabela só, TODA tabela de public que esteja fora do padrão:
-- sem policy nenhuma, ou ainda com grant de escrita para a role anon.
--
-- É esta consulta que diz o nome das tabelas que o placar contou mas não
-- nomeou. Some as linhas: se forem 4 tabelas com 3 grants cada, V3=12 e V4b=4
-- são o mesmo problema visto de dois ângulos.

select
  c.relname                                   as tabela,
  c.relrowsecurity                            as rls_ligado,
  coalesce(pol.qtd, 0)                        as policies,
  coalesce(gr.privilegios, '(nenhum)')        as grants_de_escrita_anon,
  case
    when coalesce(pol.qtd, 0) = 0 and gr.privilegios is not null
      then 'FECHADA, mas com grant sobrando -> revogar'
    when coalesce(pol.qtd, 0) = 0
      then 'FECHADA (sem policy): anon e authenticated nao acessam'
    when gr.privilegios is not null
      then 'PERIGO: tem policy E grant de escrita para anon'
    else 'ok'
  end                                         as diagnostico
from pg_class c
left join (
  select tablename, count(*) as qtd
  from pg_policies
  where schemaname = 'public'
  group by tablename
) pol on pol.tablename = c.relname
left join (
  select table_name, string_agg(privilege_type, ', ' order by privilege_type) as privilegios
  from information_schema.role_table_grants
  where grantee = 'anon'
    and table_schema = 'public'
    and privilege_type in ('INSERT', 'UPDATE', 'DELETE')
  group by table_name
) gr on gr.table_name = c.relname
where c.relnamespace = 'public'::regnamespace
  and c.relkind = 'r'
  and (coalesce(pol.qtd, 0) = 0 or gr.privilegios is not null)
order by (gr.privilegios is not null) desc, c.relname;


-- ############################################################################
-- BLOCO 2 — DETALHE (rode só a consulta da verificação que deu FALHA)
-- ############################################################################

-- --- V1: quais policies de escrita estão frouxas -----------------------------
-- select tablename, policyname, cmd, qual, with_check
-- from pg_policies
-- where schemaname = 'public'
--   and cmd <> 'SELECT'
--   and coalesce(qual, '')       not like '%is_admin%'
--   and coalesce(with_check, '') not like '%is_admin%'
-- order by tablename, cmd;

-- --- V2: quais tabelas estão com RLS desligado --------------------------------
-- select relname as tabela_sem_rls
-- from pg_class
-- where relnamespace = 'public'::regnamespace
--   and relkind = 'r'
--   and not relrowsecurity
-- order by relname;

-- --- V3: quais grants de escrita a anon ainda tem -----------------------------
-- select table_name, privilege_type
-- from information_schema.role_table_grants
-- where grantee = 'anon'
--   and table_schema = 'public'
--   and privilege_type in ('INSERT', 'UPDATE', 'DELETE')
-- order by table_name, privilege_type;

-- --- V4: contagem de policies por tabela (o esperado e 4 em cada) -------------
-- select tablename, count(*) as policies,
--        case when count(*) = 4 then 'ok' else 'REVISAR' end as situacao
-- from pg_policies
-- where schemaname = 'public' and tablename <> 'admins'
-- group by tablename
-- order by (count(*) = 4), tablename;

-- --- V5: quem esta na allowlist -----------------------------------------------
-- select user_id, email, created_at from public.admins order by created_at;

-- --- V6: policies do bucket de storage ----------------------------------------
-- select policyname, cmd, roles, qual, with_check
-- from pg_policies
-- where schemaname = 'storage' and tablename = 'objects'
-- order by cmd;

-- --- EXTRA: limites do bucket (nao da para conferir pela API com a anon key) --
-- select id, public, file_size_limit, allowed_mime_types
-- from storage.buckets where id = 'banners';
--   ESPERADO: public = true
--             file_size_limit = 5242880
--             allowed_mime_types = {image/png,image/jpeg,image/webp,image/gif,image/avif}
--             (sem image/svg+xml)
