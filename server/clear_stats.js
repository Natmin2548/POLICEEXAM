import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find user MIN2909
  const user = await prisma.user.findUnique({
    where: { username: 'MIN2909' }
  });

  if (!user) {
    console.log('User MIN2909 not found');
    return;
  }

  console.log(`Found user: ${user.username} (ID: ${user.id})`);

  // Delete UserStageProgress records for this user
  const deleteProgress = await prisma.userStageProgress.deleteMany({
    where: { userId: user.id }
  });

  console.log(`Successfully deleted ${deleteProgress.count} stage progress stats/records for user MIN2909.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
