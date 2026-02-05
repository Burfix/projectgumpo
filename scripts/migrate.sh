#!/bin/bash

# Database Migration Runner
# This script helps run migrations against your Supabase database

set -e

echo "🗄️  Project Goose - Database Migration"
echo "======================================"
echo ""

# Check for DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set"
    echo ""
    echo "Get your database URL from Supabase:"
    echo "1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/database"
    echo "2. Copy the 'Connection string' (use 'Transaction' mode)"
    echo "3. Run: export DATABASE_URL='your-connection-string'"
    echo ""
    exit 1
fi

# List available migrations
echo "Available migrations:"
echo ""
ls -1 migrations/*.sql | nl
echo ""

# Ask which migration to run
read -p "Enter migration number (or 'all' for all migrations): " CHOICE

if [ "$CHOICE" = "all" ]; then
    echo ""
    echo "🚀 Running all migrations..."
    for migration in migrations/*.sql; do
        echo "  → Running: $migration"
        psql "$DATABASE_URL" -f "$migration"
    done
    echo "✓ All migrations completed!"
elif [ "$CHOICE" -ge 1 ] 2>/dev/null; then
    MIGRATION=$(ls -1 migrations/*.sql | sed -n "${CHOICE}p")
    if [ -n "$MIGRATION" ]; then
        echo ""
        echo "🚀 Running: $MIGRATION"
        psql "$DATABASE_URL" -f "$MIGRATION"
        echo "✓ Migration completed!"
    else
        echo "❌ Invalid migration number"
        exit 1
    fi
else
    echo "❌ Invalid choice"
    exit 1
fi

echo ""
echo "✨ Database updated successfully!"
