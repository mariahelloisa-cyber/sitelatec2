#!/usr/bin/env bash
# ============================================================================
# Verificação de segurança pós-correção — LATec
# ============================================================================
# Confere, contra o Supabase real, se as correções de RLS surtiram efeito.
#
# ############################################################################
# ISTO NÃO É SQL. NÃO COLE NO SQL EDITOR DO SUPABASE.
# ############################################################################
# É um script de terminal. Colado no SQL Editor, o Postgres tenta interpretar
# a primeira linha como SQL e responde:
#     ERROR: 42601: syntax error at or near "-"   LINE 3: set -uo pipefail
#
# RODE ASSIM, no terminal do Windows (PowerShell), dentro da pasta do projeto:
#
#     cd C:\Users\Micro\Downloads\sitelatec2
#     & "C:\Program Files\Git\bin\bash.exe" scripts/verificar-seguranca.sh
#
# (o caminho completo é necessário porque `bash` não está no PATH do
#  PowerShell nesta máquina; dentro do Git Bash basta
#  `bash scripts/verificar-seguranca.sh`)
#
# Quem roda as verificações DENTRO do SQL Editor é outro arquivo:
#     supabase/verificacao.sql
#
# Lê VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY do .env.
#
# NÃO É DESTRUTIVO. O teste de escrita grava em cada linha o valor que ela já
# tem (`{"id": <mesmo id>}`), então o dado não muda. O que interessa é a
# RESPOSTA: com `Prefer: return=representation`, o PostgREST devolve `[]`
# quando o RLS filtrou a linha, e o objeto da linha quando a escrita passou.
#
# Para testar o item 3 (usuário autenticado comum), exporte antes:
#   export EMAIL_NAO_ADMIN='...'  SENHA_NAO_ADMIN='...'
# Para testar o item 4 (administrador legítimo):
#   export EMAIL_ADMIN='...'  SENHA_ADMIN='...'
# Sem essas variáveis os testes correspondentes são reportados como PULADO.
# ============================================================================

set -uo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || { echo "ERRO: .env não encontrado."; exit 1; }
U=$(grep -E '^VITE_SUPABASE_URL=' .env | cut -d= -f2- | tr -d '\r')
K=$(grep -E '^VITE_SUPABASE_ANON_KEY=' .env | cut -d= -f2- | tr -d '\r')
[ -n "$U" ] && [ -n "$K" ] || { echo "ERRO: variáveis ausentes no .env."; exit 1; }

FALHAS=0
ok()    { printf '  \033[32m[OK]\033[0m      %s\n' "$1"; }
falha() { printf '  \033[31m[FALHA]\033[0m   %s\n' "$1"; FALHAS=$((FALHAS+1)); }
pulado(){ printf '  \033[33m[PULADO]\033[0m  %s\n' "$1"; }

TABELAS="banners selos depoimentos diferenciais noticias faqs vagas \
cursos_destaque banner_blog_lateral sobre_historia cursos_cadastrados \
categorias contato_footer home_carrossel_3d sobre_galeria \
sobre_produto_destaque sobre_redes_sociais"

# Pega o id da primeira linha da tabela, ou vazio se não houver linhas.
primeiro_id() {
  curl -s -m 20 "$U/rest/v1/$1?select=id&limit=1" -H "apikey: $K" \
    | grep -oE '"id":("?[^,"}]*"?)' | head -1 | cut -d: -f2-
}

# Escrita no-op. $1=tabela $2=id (já no formato JSON) $3=token de acesso.
escrita_noop() {
  local filtro="$2"
  filtro="${filtro%\"}"; filtro="${filtro#\"}"
  curl -s -m 20 -X PATCH "$U/rest/v1/$1?id=eq.$filtro" \
    -H "apikey: $K" -H "Authorization: Bearer $3" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" -d "{\"id\":$2}"
}

# login() devolve o token na global TOKEN_LOGIN e o motivo da falha em
# MOTIVO_LOGIN. Não escreve no stdout de propósito: `TOK=$(login ...)` rodaria
# a função numa subshell, e as globais nunca voltariam para quem chamou.
TOKEN_LOGIN=""
MOTIVO_LOGIN=""

login() {
  local resposta
  TOKEN_LOGIN=""
  MOTIVO_LOGIN=""

  # Erro nº 1 mais comum: colar o texto de exemplo em vez da senha de verdade.
  # Sem esta checagem o sintoma é idêntico ao de senha errada, e se perde
  # tempo procurando problema de permissão onde não há.
  case "$2" in
    '<a senha>'|'<senha>'|'...'|'SUA_SENHA'|'')
      MOTIVO_LOGIN="o valor passado é o texto de exemplo (\"$2\"), não a senha real"
      return 0
      ;;
  esac

  resposta=$(curl -s -m 20 -X POST "$U/auth/v1/token?grant_type=password" \
    -H "apikey: $K" -H "Content-Type: application/json" \
    -d "{\"email\":\"$1\",\"password\":\"$2\"}")

  if echo "$resposta" | grep -q '"access_token"'; then
    # Atribui à global, nunca imprime: um `echo` aqui despejaria o JWT de
    # sessão no terminal e no log de quem estivesse gravando a saída.
    TOKEN_LOGIN=$(echo "$resposta" | grep -oE '"access_token":"[^"]*"' | cut -d'"' -f4)
    return 0
  fi

  # Repassa a mensagem do GoTrue (ex.: "Invalid login credentials",
  # "Email not confirmed"). Aparece só no seu terminal, durante a auditoria.
  MOTIVO_LOGIN=$(echo "$resposta" \
    | grep -oE '"(error_description|msg|error|message)":"[^"]*"' \
    | head -1 | cut -d'"' -f4)
  [ -n "$MOTIVO_LOGIN" ] || MOTIVO_LOGIN="resposta inesperada do servidor de auth"
}

echo
echo "=== 1. Cadastro público desabilitado ==================================="
CFG=$(curl -s -m 20 "$U/auth/v1/settings" -H "apikey: $K")
if echo "$CFG" | grep -q '"disable_signup":true'; then
  ok "disable_signup = true (ninguém consegue criar conta sozinho)"
else
  falha "disable_signup = false — qualquer um ainda pode se cadastrar"
fi

echo
echo "=== 2. Infraestrutura da allowlist ====================================="
RPC=$(curl -s -m 20 -X POST "$U/rest/v1/rpc/is_admin" -H "apikey: $K" \
      -H "Content-Type: application/json" -d '{}')
if echo "$RPC" | grep -q "PGRST202"; then
  falha "RPC public.is_admin NÃO existe — a PARTE 1 do SQL não foi aplicada"
else
  ok "RPC public.is_admin existe"
fi
ADM=$(curl -s -m 20 "$U/rest/v1/admins?select=user_id" -H "apikey: $K")
# Duas respostas significam "protegida", e as duas são aceitáveis:
#   42501 permission denied  -> o REVOKE cortou o acesso no nível de GRANT
#                               (mais forte: nem chega a avaliar RLS)
#   []                       -> o RLS filtrou todas as linhas
# Qualquer corpo com user_id dentro significa vazamento da allowlist.
if echo "$ADM" | grep -q "PGRST205"; then
  falha "Tabela public.admins NÃO existe — a PARTE 1 do SQL não foi aplicada"
elif echo "$ADM" | grep -q '"42501"'; then
  ok "public.admins negada a anon no nível de GRANT (42501)"
elif [ "$ADM" = "[]" ]; then
  ok "public.admins existe e é invisível para anon (RLS filtrou)"
else
  falha "public.admins está LEGÍVEL por anon: $ADM"
fi

echo
echo "=== 3. Escrita ANÔNIMA (sem login) — deve ser bloqueada em todas ======="
for t in $TABELAS; do
  ID=$(primeiro_id "$t")
  if [ -z "$ID" ]; then pulado "$t (tabela vazia)"; continue; fi
  R=$(escrita_noop "$t" "$ID" "$K")
  if [ "$R" = "[]" ] || echo "$R" | grep -q '"code":"42501"'; then
    ok "$t — escrita anônima bloqueada"
  else
    falha "$t — *** ESCRITA ANÔNIMA AINDA PASSA ***"
  fi
done

echo
echo "=== 4. Escrita por AUTENTICADO NÃO-ADMIN — deve ser bloqueada =========="
if [ -n "${EMAIL_NAO_ADMIN:-}" ] && [ -n "${SENHA_NAO_ADMIN:-}" ]; then
  login "$EMAIL_NAO_ADMIN" "$SENHA_NAO_ADMIN"; TOK="$TOKEN_LOGIN"
  if [ -z "$TOK" ]; then
    falha "não foi possível autenticar o usuário não-admin: $MOTIVO_LOGIN"
  elif [ "$(curl -s -m 20 -X POST "$U/rest/v1/rpc/is_admin" -H "apikey: $K" \
            -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" \
            -d '{}')" = "true" ]; then
    # Sem esta checagem, usar uma conta que JÁ está na allowlist faria a seção
    # inteira reportar "NÃO-ADMIN CONSEGUE ESCREVER" — alarme falso, porque a
    # conta escreve exatamente porque é admin. Isso acontece se o INSERT da
    # PARTE B já tiver sido rodado antes deste teste.
    pulado "$EMAIL_NAO_ADMIN JÁ está em public.admins — não serve de cobaia."
    pulado "  Use outra conta (Authentication -> Users -> Add user, sem"
    pulado "  inserir em public.admins) para provar o item 7."
  else
    for t in $TABELAS; do
      ID=$(primeiro_id "$t")
      [ -z "$ID" ] && continue
      R=$(escrita_noop "$t" "$ID" "$TOK")
      if [ "$R" = "[]" ] || echo "$R" | grep -q '"code":"42501"'; then
        ok "$t — não-admin bloqueado"
      else
        falha "$t — *** NÃO-ADMIN CONSEGUE ESCREVER ***"
      fi
    done
  fi
else
  pulado "defina EMAIL_NAO_ADMIN e SENHA_NAO_ADMIN para rodar este teste"
fi

echo
echo "=== 5. Escrita por ADMIN legítimo — deve FUNCIONAR ====================="
if [ -n "${EMAIL_ADMIN:-}" ] && [ -n "${SENHA_ADMIN:-}" ]; then
  login "$EMAIL_ADMIN" "$SENHA_ADMIN"; TOK="$TOKEN_LOGIN"
  if [ -z "$TOK" ]; then
    falha "não foi possível autenticar o administrador: $MOTIVO_LOGIN"
  else
    IS=$(curl -s -m 20 -X POST "$U/rest/v1/rpc/is_admin" -H "apikey: $K" \
         -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" -d '{}')
    [ "$IS" = "true" ] && ok "is_admin() retorna true para esta conta" \
                       || falha "is_admin() retornou '$IS' — conta fora da allowlist"
    for t in $TABELAS; do
      ID=$(primeiro_id "$t")
      [ -z "$ID" ] && continue
      R=$(escrita_noop "$t" "$ID" "$TOK")
      if [ "$R" = "[]" ]; then
        falha "$t — *** ADMIN FOI BLOQUEADO (o painel vai quebrar) ***"
      elif echo "$R" | grep -q '"code"'; then
        falha "$t — erro inesperado: $(echo "$R" | head -c 120)"
      else
        ok "$t — admin escreve normalmente"
      fi
    done
  fi
else
  pulado "defina EMAIL_ADMIN e SENHA_ADMIN para rodar este teste"
fi

echo
echo "========================================================================"
if [ "$FALHAS" -eq 0 ]; then
  printf '\033[32mTODAS AS VERIFICAÇÕES EXECUTADAS PASSARAM.\033[0m\n'
  echo "Atenção: itens marcados PULADO não foram verificados."
else
  printf '\033[31m%s VERIFICAÇÃO(ÕES) FALHARAM — NÃO libere para pentest.\033[0m\n' "$FALHAS"
fi
echo "========================================================================"
exit "$FALHAS"
