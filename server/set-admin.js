import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const username = process.argv[2];

if (!username) {
  console.log('กรุณาระบุ username เช่น: node set-admin.js myusername');
  process.exit(1);
}

async function main() {
  try {
    const user = await prisma.user.update({
      where: { username: username },
      data: { role: 'ADMIN' },
    });
    console.log(`อัปเดตผู้ใช้ ${user.username} เป็นบทบาท ADMIN เรียบร้อยแล้ว!`);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอัปเดต:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
