#!/bin/bash
# Prueba mínima de function calling contra OVHcloud AI Endpoints en modo ANÓNIMO (sin clave).
# Prompt ficticio, sin datos personales. Uso: ./prueba-ovh-anonimo.sh <modelo>
M=${1:-gpt-oss-120b}
curl -sS -m 60 https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions \
  -H "Content-Type: application/json" -D - -o /dev/stdout \
  -d '{
  "model": "'"$M"'",
  "messages": [
    {"role":"system","content":"Eres un asistente personal. Hoy es lunes 19-10-2026, zona Europe/Madrid. Usa herramientas cuando haga falta."},
    {"role":"user","content":"Crea una cita con el dentista el jueves que viene a las cinco y media de la tarde, una hora."}
  ],
  "tools": [{"type":"function","function":{"name":"crear_evento","description":"Crea un evento en el calendario","parameters":{"type":"object","properties":{"titulo":{"type":"string"},"inicio":{"type":"string","description":"ISO 8601 con zona"},"fin":{"type":"string","description":"ISO 8601 con zona"}},"required":["titulo","inicio","fin"]}}},
            {"type":"function","function":{"name":"buscar_correos","description":"Busca correos","parameters":{"type":"object","properties":{"consulta":{"type":"string"}},"required":["consulta"]}}}],
  "tool_choice": "auto",
  "max_tokens": 800
}'
