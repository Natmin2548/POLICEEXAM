import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const username = process.argv[2];

if (!username) {
  console.log('กรุณาระบุ username เช่น: node server/delete-user.js myusername');
  process.exit(1);
}

async function main() {
  try {
    const user = await prisma.user.delete({
      where: { username: username },
    });
    console.log(`ลบผู้ใช้ ${user.username} ออกจากฐานข้อมูลเรียบร้อยแล้ว!`);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการลบผู้ใช้:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
