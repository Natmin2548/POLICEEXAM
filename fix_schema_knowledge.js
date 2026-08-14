const fs = require('fs');
let schema = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/server/prisma/schema.prisma', 'utf8');

const modelToAdd = `
model KnowledgeDocument {
  id        Int      @id @default(autoincrement())
  title     String
  category  String   @default("ทั่วไป")
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;

if (!schema.includes('model KnowledgeDocument')) {
  schema += '\n' + modelToAdd;
  fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/server/prisma/schema.prisma', schema);
  console.log('KnowledgeDocument model added to schema');
} else {
  console.log('KnowledgeDocument already exists');
}
