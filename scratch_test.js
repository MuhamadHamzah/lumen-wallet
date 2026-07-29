const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env manually
const envPath = ".env";
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    env[key] = value;
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key length:", supabaseAnonKey ? supabaseAnonKey.length : 0);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing credentials in .env!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  const tables = ['feedbacks', 'interactions', 'escrows', 'multisig_proposals'];
  
  for (const table of tables) {
    console.log(`\n--- Testing table: ${table} ---`);
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.error(`Error on table ${table}:`, error.message, error);
    } else {
      console.log(`Table ${table} connected successfully! Data count returned:`, data.length);
      console.log(`Sample row:`, data[0]);
    }
  }

  // Let's test a sample upsert to interactions to see if it fails due to schema or constraint issues
  console.log(`\n--- Testing upsert to interactions ---`);
  const testUpsert = [{
    address: 'GTestAddress' + Math.random().toString(36).substring(2, 7),
    action: 'Test Action Upsert',
    tx_hash: '0xTestHashUpsert',
    time: new Date().toISOString()
  }];
  
  const { data: upsertData, error: upsertError } = await supabase
    .from('interactions')
    .upsert(testUpsert, { onConflict: 'address,action,time' });
    
  if (upsertError) {
    console.error(`Upsert failed:`, upsertError.message, upsertError);
  } else {
    console.log(`Upsert succeeded! Returned data:`, upsertData);
  }
}

testConnection();
