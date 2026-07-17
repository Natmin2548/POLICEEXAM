import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const targetUsername = 'MIN2909';
  const targetPassword = 'min0123';
  const targetEmail = 'min2909@example.com';

  console.log(`Starting admin user recreation for: ${targetUsername}...`);

  try {
    // 1. Delete if exists
    const existing = await prisma.user.findUnique({
      where: { username: targetUsername }
    });

    if (existing) {
      console.log(`Found existing user ${targetUsername}. Deleting...`);
      await prisma.user.delete({
        where: { id: existing.id }
      });
      console.log('Existing user deleted successfully.');
    }

    // Also delete by email if exists (to prevent unique constraint error)
    const existingEmail = await prisma.user.findUnique({
      where: { email: targetEmail }
    });

    if (existingEmail) {
      console.log(`Found existing user with email ${targetEmail}. Deleting...`);
      await prisma.user.delete({
        where: { id: existingEmail.id }
      });
      console.log('Existing email user deleted successfully.');
    }

    // 2. Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(targetPassword, salt);

    // 3. Create new user
    const newUser = await prisma.user.create({
      data: {
        username: targetUsername,
        email: targetEmail,
        password: hashedPassword,
        fullName: 'Admin Min',
        role: 'ADMIN',
        emailVerified: true,
        points: 9999,
        level: 5,
        xp: 0
      }
    });

    console.log('=== Success! ===');
    console.log(`Created admin user successfully:`);
    console.log(`ID: ${newUser.id}`);
    console.log(`Username: ${newUser.username}`);
    console.log(`Role: ${newUser.role}`);
    console.log(`Email Verified: ${newUser.emailVerified}`);

  } catch (error) {
    console.error('An error occurred during admin update:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
