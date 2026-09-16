#!/usr/bin/env bash
# ============================================================================
# Teste isolado de login — LATec
# ============================================================================
# Só verifica se um par e-mail/senha autentica no Supabase, e diz se a conta
# está ou não na allowlist de admins. Serve para resolver "Invalid login
# credentials" sem ficar rodando a suíte inteira a cada tentativa.
#
# NÃO É SQL. Rode no PowerShell, na pasta do projeto:
#
#     & "C:\Program Files\Git\bin\bash.exe" scripts/testar-login.sh 'email@x.com' 'senha'
#
# A senha vai como argumento e NÃO é impressa em lugar nenhum.
# ============================================================================

set -uo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || { echo "ERRO: .env não encontrado."; exit 1; }
U=$(grep -E '^VITE_SUPABASE_URL=' .env | cut -d= -f2- | tr -d '\r')
K=$(grep -E '^VITE_SUPABASE_ANON_KEY=' .env | cut -d= -f2- | tr -d '\r')

EMAIL="${1:-}"
SENHA="${2:-}"

if [ -z "$EMAIL" ] || [ -z "$SENHA" ]; then
  echo "USO: bash scripts/testar-login.sh 'email@exemplo.com' 'a-senha'"
  exit 1
fi

echo
echo "E-mail testado: [$EMAIL]"
# Mostrar o tamanho, e não a senha, já revela os erros mais comuns: colar o
# placeholder, sobrar espaço, ou a senha ter vindo vazia da variável.
echo "Senha recebida: ${#SENHA} caracteres"
case "$EMAIL" in
  *" "*) echo "  AVISO: o e-mail tem ESPAÇO — provável erro de cópia." ;;
esac
case "$SENHA" in
  *" "*) echo "  AVISO: a senha tem ESPAÇO — confira se foi cópia acidental." ;;
esac

RESP=$(curl -s -m 20 -X POST "$U/auth/v1/token?grant_type=password" \
  -H "apikey: $K" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$SENHA\"}")

echo
if echo "$RESP" | grep -q '"access_token"'; then
  TOK=$(echo "$RESP" | grep -oE '"access_token":"[^"]*"' | cut -d'"' -f4)
  echo "LOGIN OK."

  EH_ADMIN=$(curl -s -m 20 -X POST "$U/rest/v1/rpc/is_admin" \
    -H "apikey: $K" -H "Authorization: Bearer $TOK" \
    -H "Content-Type: application/json" -d '{}')

  if [ "$EH_ADMIN" = "true" ]; then
    echo "is_admin() = true  -> conta ESTÁ na allowlist."
    echo "   Serve para o teste do ADMIN (item 8):"
    echo "     \$env:EMAIL_ADMIN='$EMAIL'"
  elif [ "$EH_ADMIN" = "false" ]; then
    echo "is_admin() = false -> conta NÃO está na allowlist."
    echo "   É exatamente a cobaia que falta para o teste do NÃO-ADMIN (item 7):"
    echo "     \$env:EMAIL_NAO_ADMIN='$EMAIL'"
  else
    echo "is_admin() devolveu algo inesperado: $EH_ADMIN"
  fi
else
  MOTIVO=$(echo "$RESP" \
    | grep -oE '"(error_description|msg|error|message)":"[^"]*"' \
    | head -1 | cut -d'"' -f4)
  echo "LOGIN RECUSADO: ${MOTIVO:-resposta inesperada}"
  echo
  case "$MOTIVO" in
    "Invalid login credentials")
      echo "O e-mail não existe OU a senha está errada. O Supabase usa a mesma"
      echo "mensagem para os dois casos de propósito, para não permitir"
      echo "descobrir quais e-mails estão cadastrados."
      echo
      echo "Como resolver:"
      echo "  1. Dashboard -> Authentication -> Users: confira se o e-mail"
      echo "     aparece na lista, EXATAMENTE como digitado acima."
      echo "  2. Nos 3 pontinhos da linha do usuário -> Reset password, e"
      echo "     defina uma senha nova, simples e sem espaços."
      echo "  3. Rode este script de novo com a senha nova."
      ;;
    "Email not confirmed")
      echo "A conta existe, mas o e-mail não foi confirmado."
      echo "No Dashboard, ao criar o usuário, marque 'Auto Confirm User' —"
      echo "ou confirme manualmente na linha do usuário."
      ;;
  esac
  exit 1
fi
