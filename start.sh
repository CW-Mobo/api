#!/usr/bin/env bash
set -Eeuo pipefail

ai_pid=""
api_pid=""

cleanup() {
  local exit_code=$?
  trap - EXIT INT TERM

  if [[ -n "$api_pid" ]]; then
    kill "$api_pid" 2>/dev/null || true
  fi
  if [[ -n "$ai_pid" ]]; then
    kill "$ai_pid" 2>/dev/null || true
  fi
  if [[ -n "$api_pid" ]]; then
    wait "$api_pid" 2>/dev/null || true
  fi
  if [[ -n "$ai_pid" ]]; then
    wait "$ai_pid" 2>/dev/null || true
  fi

  exit "$exit_code"
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

/opt/ai-venv/bin/uvicorn main:app \
  --app-dir /app/ai_service \
  --host 127.0.0.1 \
  --port 8001 &
ai_pid=$!

ai_ready=false
for ((attempt = 1; attempt <= 180; attempt++)); do
  if ! kill -0 "$ai_pid" 2>/dev/null; then
    wait "$ai_pid"
    exit 1
  fi

  if python3 -c 'from urllib.request import urlopen; urlopen("http://127.0.0.1:8001/health", timeout=1).read()' >/dev/null 2>&1; then
    ai_ready=true
    break
  fi

  sleep 1
done

if [[ "$ai_ready" != true ]]; then
  echo "O serviço Keras não iniciou dentro do tempo esperado." >&2
  exit 1
fi

node /app/dist/index.js &
api_pid=$!

set +e
wait -n "$ai_pid" "$api_pid"
exit_code=$?
set -e
exit "$exit_code"
