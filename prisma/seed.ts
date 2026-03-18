import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  const roles = ['admin', 'editor', 'viewer']
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  console.log('Roles seeded: admin, editor, viewer')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
