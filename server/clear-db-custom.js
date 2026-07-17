import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function run() {
  try {
    console.log('--- Database Reset Starting ---');

    // 1. Delete all dependent tables to avoid constraint violations
    console.log('Deleting incorrect questions...');
    await prisma.incorrectQuestion.deleteMany();

    console.log('Deleting vocab records...');
    await prisma.vocabRecord.deleteMany();

    console.log('Deleting premium requests...');
    await prisma.premiumRequest.deleteMany();

    console.log('Deleting stage progress...');
    await prisma.userStageProgress.deleteMany();

    console.log('Deleting password resets...');
    await prisma.passwordReset.deleteMany();

    console.log('Deleting questions...');
    await prisma.question.deleteMany();

    console.log('Deleting exam sets...');
    await prisma.examSet.deleteMany();

    // 2. Delete all users except 'Roblox_manface'
    console.log('Deleting all users except Roblox_manface...');
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        username: {
          not: 'Roblox_manface'
        }
      }
    });
    console.log(`Deleted ${deletedUsers.count} users.`);

    // 3. Check if Roblox_manface exists, if not, create it
    let robloxUser = await prisma.user.findUnique({
      where: { username: 'Roblox_manface' }
    });
    if (!robloxUser) {
      console.log('Roblox_manface not found, creating it...');
      const robloxHash = await bcrypt.hash('123456', 10);
      robloxUser = await prisma.user.create({
        data: {
          username: 'Roblox_manface',
          email: 'roblox@example.com',
          password: robloxHash,
          fullName: 'Roblox Manface',
          role: 'USER',
          emailVerified: true
        }
      });
      console.log('Created Roblox_manface user.');
    }

    // 4. Create new Admin user
    console.log('Creating Admin user...');
    const adminHash = await bcrypt.hash('Natse2005', 10);
    const adminUser = await prisma.user.create({
      data: {
        username: 'Admin',
        email: 'admin@example.com',
        password: adminHash,
        fullName: 'Admin System',
        role: 'ADMIN',
        emailVerified: true
      }
    });
    console.log('Created Admin user successfully.');

    console.log('--- Database Reset Completed Successfully ---');
  } catch (err) {
    console.error('Error resetting database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
