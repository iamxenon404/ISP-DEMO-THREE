import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const password = await bcrypt.hash('password', 10)

  const users = [
    { name: 'Admin User',    email: 'admin@isp.com',      role: 'admin'      as const },
    { name: 'John Customer', email: 'customer@isp.com',   role: 'customer'   as const },
    { name: 'Sarah Support', email: 'support@isp.com',    role: 'support'    as const },
    { name: 'Tech Mike',     email: 'technician@isp.com', role: 'technician' as const },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where:  { email: u.email },
      update: {},
      create: { ...u, password, status: 'active' },
    })
  }

  console.log('✅ Seeded demo users:')
  console.table(users.map((u) => ({ role: u.role, email: u.email, password: 'password' })))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())