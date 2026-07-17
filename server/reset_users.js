import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function resetAllUsers() {
  console.log("Starting reset of all user accounts (retaining their admin privileges)...");
  
  // Find all users
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      username: true
    }
  });

  const userIds = allUsers.map(u => u.id);
  console.log(`Found ${userIds.length} user accounts to reset.`);

  // 1. Delete all stage progress
  const deleteProgress = await prisma.userStageProgress.deleteMany({
    where: {
      userId: { in: userIds }
    }
  });
  console.log(`Deleted ${deleteProgress.count} stage progress records.`);

  // 2. Reset user attributes (points, level, xp, streak, subject scores) but leave role untouched
  const resetUsersResult = await prisma.user.updateMany({
    data: {
      level: 1,
      pigLevel: 1,
      xp: 0,
      pigXp: 0,
      points: 0,
      streak: 0,
      scoreGeneral: 0,
      scoreThai: 0,
      scoreEnglish: 0,
      scoreComputer: 0,
      scoreSocial: 0,
      scoreSecretariat: 0,
      scoreLaw: 0,
      pigHunger: 80,
      pigThirst: 80
    }
  });
  console.log(`Successfully reset points, levels, XP, and scores for ${resetUsersResult.count} users.`);
}

resetAllUsers()
  .catch(e => {
    console.error("Reset script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
