const fs = require('fs');
const https = require('https');

// Read .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const getEnvVar = (name) => {
  const match = envFile.match(new RegExp(`${name}="?([^"\\n]+)"?`));
  return match ? match[1] : null;
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1];
const sql = fs.readFileSync('./migrations/COMPLETE_RESET.sql', 'utf8');

console.log('🚀 Executing complete database reset...');
console.log(`📡 Project: ${projectRef}`);
console.log(`📄 SQL size: ${(sql.length / 1024).toFixed(2)} KB\n`);

const options = {
  hostname: `${projectRef}.supabase.co`,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': supabaseServiceKey,
    'Authorization': `Bearer ${supabaseServiceKey}`,
    'Prefer': 'return=representation'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📊 Response status: ${res.statusCode}`);
    
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Database reset completed successfully!');
      console.log('\n📋 Response:', data);
    } else {
      console.error('❌ Migration failed!');
      console.error('Response:', data);
      
      console.log('\n💡 Alternative: Copy the SQL from migrations/COMPLETE_RESET.sql');
      console.log('   and paste it into the Supabase SQL Editor at:');
      console.log(`   ${supabaseUrl}/project/${projectRef}/sql/new`);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.log('\n💡 Please run the migration manually:');
  console.log('   1. Go to: ' + supabaseUrl.replace('.supabase.co', '.supabase.co/project/' + projectRef + '/sql'));
  console.log('   2. Copy the SQL from: migrations/COMPLETE_RESET.sql');
  console.log('   3. Paste and run it in the SQL Editor');
});

req.write(JSON.stringify({ sql_query: sql }));
req.end();
