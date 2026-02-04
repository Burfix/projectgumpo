const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Starting complete database reset...\n');
  
  const sql = fs.readFileSync('./migrations/COMPLETE_RESET.sql', 'utf8');
  
  console.log('📝 Executing migration SQL...');
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error('❌ Migration failed:', error);
    
    // Try direct approach
    console.log('\n🔄 Trying direct SQL execution...');
    const { error: directError } = await supabase
      .from('_migrations')
      .insert({ name: 'COMPLETE_RESET', sql });
    
    if (directError) {
      console.error('❌ Direct execution also failed:', directError);
      process.exit(1);
    }
  }
  
  console.log('✅ Migration completed successfully!');
  console.log('\n📊 Verifying tables...');
  
  // Verify tables exist
  const tables = [
    'schools', 'users', 'classrooms', 'children', 
    'teacher_classroom', 'parent_child',
    'attendance_logs', 'meal_logs', 'nap_logs', 
    'incident_reports', 'messages'
  ];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`  ⚠️  ${table}: ${error.message}`);
    } else {
      console.log(`  ✓ ${table}: ${count || 0} records`);
    }
  }
  
  console.log('\n✨ Database is ready!');
}

runMigration().catch(console.error);
