-- Corrige o categoria_id dos cursos "Tecnólogos" para que o painel admin
-- (que usa categoria_id, não o texto categoria) mostre a categoria certa.
-- Cole e rode no SQL Editor do Supabase.

-- 1) Garante que existe uma categoria "Tecnólogos" na tabela public.categorias.
insert into public.categorias (nome)
select 'Tecnólogos'
where not exists (
  select 1 from public.categorias where lower(trim(nome)) = 'tecnólogos'
);

-- 2) Vincula todos os cursos com categoria = 'Tecnólogos' ao id dessa categoria.
update public.cursos_cadastrados
set categoria_id = (select id from public.categorias where lower(trim(nome)) = 'tecnólogos' limit 1)
where categoria = 'Tecnólogos';
