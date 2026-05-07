import "dotenv/config";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // Create Super Admin User
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@mydigitalacademy.com' },
    update: {},
    create: {
      email: 'admin@mydigitalacademy.com',
      passwordHash: 'hashed_password_placeholder',
      firstName: 'Super',
      lastName: 'Admin',
      isSuperAdmin: true,
    },
  })
  console.log(`Created Super Admin with id: ${superAdmin.id}`)

  // Create Demo School (Tenant)
  const demoSchool = await prisma.tenant.upsert({
    where: { domain: 'demo-school' },
    update: {},
    create: {
      name: 'Demo International School',
      domain: 'demo-school',
      isActive: true,
    },
  })
  console.log(`Created Demo School with id: ${demoSchool.id}`)

  // Create Default Roles
  const adminRole = await prisma.role.upsert({
    where: { 
      name_tenantId: {
        name: 'School Admin',
        tenantId: demoSchool.id
      }
    },
    update: {},
    create: {
      name: 'School Admin',
      tenantId: demoSchool.id,
      isSystem: true,
    },
  })

  // Create School Admin User
  const schoolAdmin = await prisma.user.upsert({
    where: { email: 'admin@demoschool.com' },
    update: {},
    create: {
      email: 'admin@demoschool.com',
      passwordHash: 'hashed_password_placeholder',
      firstName: 'Demo',
      lastName: 'Admin',
      tenantId: demoSchool.id,
      roleId: adminRole.id
    },
  })
  console.log(`Created School Admin with id: ${schoolAdmin.id}`)

  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
