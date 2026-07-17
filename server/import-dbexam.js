import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING DBEXAM QUESTION BANK IMPORT ---');
  
  // Find creator admin ID
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    admin = await prisma.user.findFirst();
  }
  const creatorId = admin ? admin.id : 1;
  console.log(`Using creator ID: ${creatorId}`);

  const qbDir = 'c:\\Users\\minam\\.gemini\\antigravity-ide\\scratch\\police-exam\\DBEXAM\\question_bank';
  if (!fs.existsSync(qbDir)) {
    console.error(`Question bank directory not found at: ${qbDir}`);
    process.exit(1);
  }

  // Delete existing secretariat exam sets in the database to prevent duplicate sets on re-runs
  console.log('Cleaning up existing secretariat exam sets...');
  await prisma.examSet.deleteMany({
    where: { category: 'secretariat' }
  });

  const files = fs.readdirSync(qbDir).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} JSON files in question bank:`, files);

  for (const file of files) {
    const filePath = path.join(qbDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const examTitle = file.replace('.json', '');
    const entries = data.entries || [];
    if (entries.length === 0) {
      console.log(`Skipping empty file: ${file}`);
      continue;
    }

    console.log(`Importing set: "${examTitle}" with ${entries.length} questions...`);

    await prisma.examSet.create({
      data: {
        title: `งานสารบรรณ - ${examTitle}`,
        category: 'secretariat',
        subcategory: 'งานสารบรรณ',
        totalCount: entries.length,
        createdById: creatorId,
        questions: {
          create: entries.map((entry, idx) => {
            const choices = entry.choices || [];
            
            // Map letter answers (A, B, C, D) to numbers (0, 1, 2, 3)
            let correctAnswer = 0;
            if (entry.answer === 'A') correctAnswer = 0;
            else if (entry.answer === 'B') correctAnswer = 1;
            else if (entry.answer === 'C') correctAnswer = 2;
            else if (entry.answer === 'D') correctAnswer = 3;
            else if (typeof entry.answer === 'number') correctAnswer = entry.answer;

            return {
              questionText: entry.question,
              choice1: choices[0] || 'ตัวเลือก ก',
              choice2: choices[1] || 'ตัวเลือก ข',
              choice3: choices[2] || 'ตัวเลือก ค',
              choice4: choices[3] || 'ตัวเลือก ง',
              correctAnswer: correctAnswer,
              explanation: entry.explanation || 'คำอธิบายของข้อนี้...',
              sortOrder: idx
            };
          })
        }
      }
    });
  }

  console.log('--- IMPORT COMPLETED SUCCESSFULLY ---');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Import script failed:', err);
  process.exit(1);
});
