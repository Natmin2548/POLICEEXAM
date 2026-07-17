import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Reset user statistics to defaults
    const result = await prisma.user.updateMany({
      data: {
        points: 0,
        level: 1,
        xp: 0,
        pigLevel: 1,
        pigXp: 0,
        streak: 0,
        scoreGeneral: 0,
        scoreThai: 0,
        scoreEnglish: 0,
        scoreComputer: 0,
        scoreSocial: 0,
        scoreSecretariat: 0,
        scoreLaw: 0
      }
    });
    console.log(`Successfully reset points, levels, XP, and scores to default values for all users (Total: ${result.count} accounts).`);

    // 2. Clear exam completion progress statistics (UserStageProgress)
    const progressCount = await prisma.userStageProgress.deleteMany({});
    console.log(`Successfully cleared all exam completion records (Total: ${progressCount.count} records).`);

    // 3. Clear incorrect question tracking records (IncorrectQuestion)
    const incorrectCount = await prisma.incorrectQuestion.deleteMany({});
    console.log(`Successfully cleared all incorrect questions records (Total: ${incorrectCount.count} records).`);

    // 4. Clear vocabulary practice history records (VocabRecord)
    const vocabCount = await prisma.vocabRecord.deleteMany({});
    console.log(`Successfully cleared all vocab practice records (Total: ${vocabCount.count} records).`);

    console.log('✨ All user statistics, points, and completion progress records have been completely cleared and reset to 0.');
  } catch (error) {
    console.error('Error during statistics reset:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
