import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function run() {
  // Delete in correct order to respect foreign keys
  console.log('Deleting incorrect questions...');
  await p.incorrectQuestion.deleteMany();
  
  console.log('Deleting questions...');
  await p.question.deleteMany();
  
  console.log('Deleting exam sets...');
  await p.examSet.deleteMany();
  
  console.log('Deleting vocab records...');
  await p.vocabRecord.deleteMany();
  
  console.log('Deleting premium requests...');
  await p.premiumRequest.deleteMany();
  
  console.log('Deleting stage progress...');
  await p.userStageProgress.deleteMany();
  
  console.log('Deleting password resets...');
  await p.passwordReset.deleteMany();
  
  console.log('Deleting users...');
  const u = await p.user.deleteMany();
  console.log('✅ Deleted', u.count, 'users and ALL related data');
  
  await p.$disconnect();
}

run();
