const fs = require('fs');
let env = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/server/.env', 'utf8');

env = env.replace('aws-0-ap-southeast-1.pooler.supabase.com:5432', 'aws-0-ap-southeast-1.pooler.supabase.com:6543');
fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/server/.env', env);
console.log('.env updated successfully for DIRECT_URL');
