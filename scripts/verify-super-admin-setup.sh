#!/bin/bash

# Super Admin Write Access - Migration Verification Script
# This script helps verify that all required database objects are in place

echo "🔍 Checking Super Admin Write Access Implementation..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ psql command not found. Please install PostgreSQL client tools.${NC}"
    exit 1
fi

# Get database URL from user
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}Enter your Supabase database URL:${NC}"
    read DATABASE_URL
fi

echo "Testing database connection..."
if ! psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
    echo -e "${RED}❌ Cannot connect to database. Check your DATABASE_URL.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database connection successful${NC}"
echo ""

# Function to check if object exists
check_exists() {
    local query=$1
    local name=$2
    local type=$3
    
    result=$(psql "$DATABASE_URL" -t -c "$query" 2>/dev/null | tr -d '[:space:]')
    
    if [ "$result" = "1" ]; then
        echo -e "${GREEN}✅ $type: $name${NC}"
        return 0
    else
        echo -e "${RED}❌ $type: $name (NOT FOUND)${NC}"
        return 1
    fi
}

# Check PRINCIPAL role in enum
echo "Checking user_role enum..."
check_exists "SELECT COUNT(*) FROM pg_enum WHERE enumlabel = 'PRINCIPAL' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role');" "PRINCIPAL" "Enum value"

# Check tables
echo ""
echo "Checking tables..."
check_exists "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'parent_child';" "parent_child" "Table"
check_exists "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'classrooms';" "classrooms" "Table"
check_exists "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teacher_classroom';" "teacher_classroom" "Table"
check_exists "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'super_admin_audit';" "super_admin_audit" "Table"

# Check indexes
echo ""
echo "Checking indexes..."
check_exists "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_parent_child_parent';" "idx_parent_child_parent" "Index"
check_exists "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_teacher_classroom_teacher';" "idx_teacher_classroom_teacher" "Index"
check_exists "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'super_admin_audit_actor_idx';" "super_admin_audit_actor_idx" "Index"

# Check RLS policies
echo ""
echo "Checking RLS policies..."
check_exists "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'parent_child' AND policyname LIKE '%super_admin%';" "parent_child (super_admin policy)" "RLS Policy"
check_exists "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'classrooms';" "classrooms (policies)" "RLS Policies"
check_exists "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'teacher_classroom';" "teacher_classroom (policies)" "RLS Policies"

# Check if RLS is enabled
echo ""
echo "Checking if RLS is enabled..."
check_exists "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename = 'parent_child' AND rowsecurity = true;" "parent_child" "RLS Enabled"
check_exists "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename = 'classrooms' AND rowsecurity = true;" "classrooms" "RLS Enabled"
check_exists "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename = 'teacher_classroom' AND rowsecurity = true;" "teacher_classroom" "RLS Enabled"
check_exists "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename = 'super_admin_audit' AND rowsecurity = true;" "super_admin_audit" "RLS Enabled"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Verification complete!"
echo ""
echo "If any items are marked with ❌, run the migration:"
echo "  psql \$DATABASE_URL -f migrations/005_add_principal_role_and_audit.sql"
echo ""
echo "For more information, see:"
echo "  - SUPER_ADMIN_WRITE_ACCESS_IMPLEMENTATION.md"
echo "  - SUPER_ADMIN_QUICK_START.md"
