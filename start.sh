#!/bin/bash


DB_NAME="space_electronics_db"
BACKEND_DIR="$(cd "$(dirname "$0")/backend" && pwd)"
FRONTEND_DIR="$(cd "$(dirname "$0")/frontend" && pwd)"
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Stopping any existing processes on port 3008..."
lsof -ti:3008 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo "==> Creating database $DB_NAME (if not exists)..."
createdb "$DB_NAME" 2>/dev/null || echo "Database already exists"

echo "==> Running schema..."
psql "$DB_NAME" -f "$BACKEND_DIR/db/schema.sql"

echo "==> Running seed..."
psql "$DB_NAME" -f "$BACKEND_DIR/db/seed.sql"

echo "==> Installing backend dependencies..."
cd "$BACKEND_DIR"
npm install

echo "==> Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm install

echo "==> Copying .env to backend..."
cp "$ROOT_DIR/.env" "$BACKEND_DIR/.env"

echo "==> Starting backend on port 3008..."
cd "$BACKEND_DIR"
npm run dev &

echo "==> Starting frontend on port 5173..."
cd "$FRONTEND_DIR"
npm run dev &

echo ""
echo "SpaceLab is running!"
echo "  Backend:  http://localhost:3008"
echo "  Frontend: http://localhost:5173"
echo ""
wait
