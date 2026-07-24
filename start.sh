#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$PROJECT_DIR/.env" ]]; then
  set -a
  source "$PROJECT_DIR/.env"
  set +a
fi
BACKEND_PORT="${BACKEND_PORT:-${PORT:-3008}}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
export PORT="$BACKEND_PORT" BACKEND_PORT FRONTEND_PORT
if [[ -z "${AUDIT_CHAIN_KEY:-}" && -n "${JWT_REFRESH_SECRET:-}" ]]; then
  export AUDIT_CHAIN_KEY="$JWT_REFRESH_SECRET"
fi
INSTALL=false
DEMO_RESET=false
MIGRATE=false
for argument in "$@"; do
  case "$argument" in
    --install) INSTALL=true ;;
    --migrate) MIGRATE=true ;;
    --demo-reset) DEMO_RESET=true ;;
    *) echo "Unknown option: $argument" >&2; exit 2 ;;
  esac
done
for port in "$BACKEND_PORT" "$FRONTEND_PORT"; do
  if lsof -tiTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port $port is already in use; no process was stopped." >&2
    exit 1
  fi
done
if "$INSTALL"; then
  (cd "$PROJECT_DIR/backend" && npm ci)
  (cd "$PROJECT_DIR/frontend" && npm ci)
elif [[ ! -d "$PROJECT_DIR/backend/node_modules" || ! -d "$PROJECT_DIR/frontend/node_modules" ]]; then
  echo "Dependencies are missing. Re-run with --install." >&2
  exit 1
fi
if "$DEMO_RESET"; then
  echo "Resetting the explicitly configured local demo database. Existing demo data will be deleted."
  (cd "$PROJECT_DIR/backend" && ALLOW_DEMO_RESET=true node reset-demo.js)
else
  (cd "$PROJECT_DIR/backend" && node migrate.js)
  (cd "$PROJECT_DIR/backend" && node create-admin.js)
fi
(cd "$PROJECT_DIR/backend" && node server.js) &
BACKEND_PID=$!
(cd "$PROJECT_DIR/frontend" && VITE_API_PROXY_TARGET="http://127.0.0.1:$BACKEND_PORT" npm run dev -- --host 127.0.0.1 --port "$FRONTEND_PORT") &
FRONTEND_PID=$!
cleanup() {
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM
echo "SpaceLab is starting at http://127.0.0.1:$FRONTEND_PORT"
wait "$BACKEND_PID" "$FRONTEND_PID"
