const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importAttempts() {
  console.log('🔄 Importing real quiz history from project ฤ...');

  const backupPath = path.resolve(__dirname, '../../server/backup_before_reset/quiz_attempts_backup.json');
  if (!fs.existsSync(backupPath)) {
    console.error('❌ Backup file not found at:', backupPath);
    return;
  }

  const raw = fs.readFileSync(backupPath, 'utf8');
  const list = JSON.parse(raw);
  console.log(`📦 Found ${list.length} quiz attempts in project ฤ.`);

  // Find or create user
  let user = await prisma.user.findFirst({
    where: { email: 'nni893399@gmail.com' },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        username: 'meen',
        email: 'nni893399@gmail.com',
        password: 'hashed_password',
        fullName: 'มีน',
        role: 'ADMIN',
      },
    });
  }

  // Clear previous attempts for clean import
  await prisma.quizAttempt.deleteMany({
    where: { userId: user.id },
  });

  // Batch insert
  for (const a of list) {
    const totalQ = a.totalQuestions || 20;
    const correct = typeof a.correctCount === 'number' ? a.correctCount : Math.round(((a.scorePct || 0) * totalQ) / 100);
    const scorePct = a.scorePct !== undefined ? a.scorePct : Math.round((correct / totalQ) * 100);

    await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        title: a.setTitle || 'แบบทดสอบ',
        category: a.subject || 'ทั่วไป',
        score: correct,
        totalScore: totalQ,
        passed: scorePct >= 60,
        timeSpent: 300,
        createdAt: new Date(a.createdAt),
      },
    });
  }

  const count = await prisma.quizAttempt.count({
    where: { userId: user.id },
  });

  console.log(`✅ Successfully imported ${count} real quiz attempts for user: ${user.fullName}`);
}

importAttempts()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
