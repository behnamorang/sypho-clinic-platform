#!/usr/bin/env bash
# =============================================================================
# Sypho.io — Database Migration Runner
# =============================================================================
# Applies all SQL migrations in order to the configured Supabase PostgreSQL DB.
#
# Prerequisites:
#   - psql (PostgreSQL client) must be installed
#   - DATABASE_URL must be set (either in .env.local or exported in shell)
#
# Usage:
#   # Option A: Load from .env.local
#   source .env.local && bash scripts/apply-migrations.sh
#
#   # Option B: Pass DATABASE_URL directly
#   DATABASE_URL="postgresql://..." bash scripts/apply-migrations.sh
#
# Where to find DATABASE_URL:
#   Supabase Dashboard → Project Settings → Database → Connection String (URI mode)
#   Choose "Transaction pooler" (port 6543) for application use,
#   or "Session mode" (port 5432) for migration runs (preferred).
#
# GDPR Note: DATABASE_URL contains credentials — never commit it to source control.
# =============================================================================

set -euo pipefail

MIGRATIONS_DIR="$(dirname "$0")/../database/migrations"
SCRIPT_NAME="$(basename "$0")"

# ----------------------------------------------------------------
# Validate prerequisites
# ----------------------------------------------------------------

if ! command -v psql &> /dev/null; then
  echo "❌ [$SCRIPT_NAME] psql not found. Install with: sudo apt-get install postgresql-client"
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "❌ [$SCRIPT_NAME] DATABASE_URL is not set."
  echo ""
  echo "Set it by:"
  echo "  1. Adding DATABASE_URL to .env.local, then: source .env.local"
  echo "  2. Or exporting it: export DATABASE_URL='postgresql://...'"
  echo ""
  echo "Find the connection string in:"
  echo "  Supabase Dashboard → Project Settings → Database → Connection String"
  exit 1
fi

echo "🗄️  [$SCRIPT_NAME] Connecting to database..."
psql "$DATABASE_URL" -c "SELECT version();" &> /dev/null || {
  echo "❌ [$SCRIPT_NAME] Cannot connect to database. Check your DATABASE_URL."
  exit 1
}
echo "✅  [$SCRIPT_NAME] Connected successfully."
echo ""

# ----------------------------------------------------------------
# Run migrations in order
# ----------------------------------------------------------------

MIGRATIONS=(
  "001_initial_schema.sql"
  "002_auth_onboarding_helpers.sql"
  "003_booking_portal.sql"
)

for migration in "${MIGRATIONS[@]}"; do
  FILE="$MIGRATIONS_DIR/$migration"

  if [[ ! -f "$FILE" ]]; then
    echo "⚠️  [$SCRIPT_NAME] Migration file not found: $FILE — skipping."
    continue
  fi

  echo "⏳  Applying: $migration ..."
  psql "$DATABASE_URL" \
    --single-transaction \
    --set ON_ERROR_STOP=on \
    -f "$FILE" \
    -v VERBOSITY=default \
    2>&1 | tail -3

  echo "✅  Applied: $migration"
  echo ""
done

echo "🎉  [$SCRIPT_NAME] All migrations applied successfully."
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env.local and fill in all Supabase variables"
echo "  2. Run: npm run dev"
echo "  3. Visit: http://localhost:3000"
