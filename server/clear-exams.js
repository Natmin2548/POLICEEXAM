import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('กำลังลบข้อสอบและชุดข้อสอบทั้งหมดในระบบ...');
    
    // Delete all questions
    const deletedQuestions = await prisma.question.deleteMany({});
    console.log(`- ลบข้อถามทั้งหมดเรียบร้อยแล้ว: ${deletedQuestions.count} ข้อ`);
    
    // Delete all exam sets
    const deletedExams = await prisma.examSet.deleteMany({});
    console.log(`- ลบชุดข้อสอบทั้งหมดเรียบร้อยแล้ว: ${deletedExams.count} ชุด`);
    
    console.log('✨ ลบข้อสอบเดโม่และข้อสอบเดิมในระบบทั้งหมดสำเร็จ!');
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
