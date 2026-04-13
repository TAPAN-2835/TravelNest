/**
 * Run this once to promote a user to ADMIN role.
 * Usage: node make_admin.js your@email.com
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node make_admin.js <email>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
    select: { id: true, email: true, name: true, role: true },
  });

  console.log('✅ User promoted to ADMIN:', updated);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
