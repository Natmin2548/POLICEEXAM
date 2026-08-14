const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'nni893399@gmail.com' } });
  console.log('Role in DB:', user?.role);
}
main().finally(() => prisma.$disconnect());
