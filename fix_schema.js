const fs = require('fs');
let code = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/server/prisma/schema.prisma', 'utf8');

const target = 'status    String   @default("ACCEPTED")';
const replacement = 'status    String   @default("ACCEPTED")\n    role      String   @default("MEMBER")';

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/server/prisma/schema.prisma', code);
  console.log('Schema updated successfully');
} else {
  console.log('Target not found in schema');
}
