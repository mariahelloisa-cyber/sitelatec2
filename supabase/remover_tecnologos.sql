-- Remove todos os cursos "Tecnólogos" e a própria categoria.
-- Cole e rode no SQL Editor do Supabase. Não tem como desfazer.

delete from public.cursos_cadastrados
where lower(trim(categoria)) = 'tecnólogos'
   or categoria_id in (
     select id from public.categorias where lower(trim(nome)) = 'tecnólogos'
   );

delete from public.categorias
where lower(trim(nome)) = 'tecnólogos';
