#!/usr/bin/env bash
# Comprueba CORS (preflight OPTIONS y POST sin clave válida) contra endpoints chat/completions.
# No usa ninguna clave real. Uso: bash prueba-cors.sh > resultado-cors.txt
O="https://ejemplo.github.io"
B='{"model":"x","messages":[{"role":"user","content":"hola"}]}'
CF="https://api.cloudflare.com/client/v4/accounts/0123456789abcdef0123456789abcdef/ai/v1/chat/completions"
date -u +"Fecha: %Y-%m-%dT%H:%M:%SZ"
for u in https://api.groq.com/openai/v1/chat/completions https://openrouter.ai/api/v1/chat/completions \
  https://generativelanguage.googleapis.com/v1beta/openai/chat/completions "$CF" \
  https://api.mistral.ai/v1/chat/completions https://api.cerebras.ai/v1/chat/completions \
  https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions; do
  echo "=== OPTIONS $u"
  curl -sS -i -m 20 -X OPTIONS "$u" -H "Origin: $O" -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: authorization,content-type" | grep -i -E "^HTTP/2|access-control"
  echo "=== POST (clave falsa) $u"
  curl -sS -i -m 20 -X POST "$u" -H "Origin: $O" -H "Authorization: Bearer clave-falsa" \
    -H "Content-Type: application/json" -d "$B" | grep -i -E "^HTTP/2|access-control-allow-origin"
done
