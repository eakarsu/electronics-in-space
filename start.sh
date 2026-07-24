#!/usr/bin/env bash
set -euo pipefail
# Local demo credential bridge (managed by tools/fix_demo_autofill.mjs)
demo_credentials_project_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if [ -f "$demo_credentials_project_dir/.env" ]; then
  while IFS= read -r demo_credentials_line || [ -n "$demo_credentials_line" ]; do
    case "$demo_credentials_line" in ''|'#'*) continue ;; esac
    demo_credentials_line="${demo_credentials_line#export }"
    demo_credentials_key="${demo_credentials_line%%=*}"
    demo_credentials_value="${demo_credentials_line#*=}"
    case "$demo_credentials_key" in
      NODE_ENV|ENABLE_DEMO_CREDENTIAL_AUTOFILL|DEMO_EMAIL|DEMO_PASSWORD|SEED_ADMIN_EMAIL|SEED_ADMIN_PASSWORD|ADMIN_EMAIL|ADMIN_PASSWORD|DEFAULT_EMAIL|DEFAULT_PASSWORD) ;;
      *) continue ;;
    esac
    [ -n "${!demo_credentials_key+x}" ] && continue
    demo_credentials_first="${demo_credentials_value:0:1}"
    demo_credentials_last="${demo_credentials_value: -1}"
    if { [ "$demo_credentials_first" = '"' ] && [ "$demo_credentials_last" = '"' ]; } || { [ "$demo_credentials_first" = "'" ] && [ "$demo_credentials_last" = "'" ]; }; then
      demo_credentials_value="${demo_credentials_value:1:${#demo_credentials_value}-2}"
    fi
    export "$demo_credentials_key=$demo_credentials_value"
  done < "$demo_credentials_project_dir/.env"
fi
demo_credentials_email=""
demo_credentials_password=""
if [ -n "${DEMO_EMAIL:-}" ] && [ -n "${DEMO_PASSWORD:-}" ]; then
  demo_credentials_email="$DEMO_EMAIL"
  demo_credentials_password="$DEMO_PASSWORD"
elif [ -n "${SEED_ADMIN_EMAIL:-}" ] && [ -n "${SEED_ADMIN_PASSWORD:-}" ]; then
  demo_credentials_email="$SEED_ADMIN_EMAIL"
  demo_credentials_password="$SEED_ADMIN_PASSWORD"
elif [ -n "${ADMIN_EMAIL:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
  demo_credentials_email="$ADMIN_EMAIL"
  demo_credentials_password="$ADMIN_PASSWORD"
elif [ -n "${DEFAULT_EMAIL:-}" ] && [ -n "${DEFAULT_PASSWORD:-}" ]; then
  demo_credentials_email="$DEFAULT_EMAIL"
  demo_credentials_password="$DEFAULT_PASSWORD"
fi
if [ "${NODE_ENV:-development}" != production ] && [ "${ENABLE_DEMO_CREDENTIAL_AUTOFILL:-true}" = true ] && [ -n "$demo_credentials_email" ] && [ -n "$demo_credentials_password" ]; then
  export VITE_ENABLE_DEMO_CREDENTIAL_AUTOFILL=true
  export VITE_DEMO_EMAIL="$demo_credentials_email"
  export VITE_DEMO_PASSWORD="$demo_credentials_password"
  export REACT_APP_ENABLE_DEMO_CREDENTIAL_AUTOFILL=true
  export REACT_APP_DEMO_EMAIL="$demo_credentials_email"
  export REACT_APP_DEMO_PASSWORD="$demo_credentials_password"
  export NEXT_PUBLIC_ENABLE_DEMO_CREDENTIAL_AUTOFILL=true
  export NEXT_PUBLIC_DEMO_EMAIL="$demo_credentials_email"
  export NEXT_PUBLIC_DEMO_PASSWORD="$demo_credentials_password"
else
  export VITE_ENABLE_DEMO_CREDENTIAL_AUTOFILL=false
  export REACT_APP_ENABLE_DEMO_CREDENTIAL_AUTOFILL=false
  export NEXT_PUBLIC_ENABLE_DEMO_CREDENTIAL_AUTOFILL=false
  unset VITE_DEMO_EMAIL VITE_DEMO_PASSWORD REACT_APP_DEMO_EMAIL REACT_APP_DEMO_PASSWORD NEXT_PUBLIC_DEMO_EMAIL NEXT_PUBLIC_DEMO_PASSWORD
fi
unset demo_credentials_email demo_credentials_password demo_credentials_project_dir demo_credentials_line demo_credentials_key demo_credentials_value demo_credentials_first demo_credentials_last

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
