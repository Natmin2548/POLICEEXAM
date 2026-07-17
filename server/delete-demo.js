import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting deletion of demo exam data...');

    // 1. Delete all Questions
    const deleteQuestions = await prisma.question.deleteMany({});
    console.log(`Deleted ${deleteQuestions.count} questions.`);

    // 2. Delete all ExamSets
    const deleteExams = await prisma.examSet.deleteMany({});
    console.log(`Deleted ${deleteExams.count} exam sets.`);

    // 3. Reset user stage progress
    const deleteProgress = await prisma.userStageProgress.deleteMany({});
    console.log(`Deleted ${deleteProgress.count} user stage progress entries.`);

    console.log('Successfully cleared all demo/mock exam data from database!');
  } catch (error) {
    console.error('Error deleting demo data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
