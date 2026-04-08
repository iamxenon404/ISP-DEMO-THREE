import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const password = await bcrypt.hash('password', 10)

  // Seed plans
  const plans = [
    { name: 'Basic',    speed: '10Mbps',  price: 5000  },
    { name: 'Standard', speed: '50Mbps',  price: 15000 },
    { name: 'Fiber',    speed: '100Mbps', price: 25000 },
  ]

  const createdPlans = []
  for (const p of plans) {
    const plan = await prisma.plan.upsert({
      where:  { id: plans.indexOf(p) + 1 },
      update: p,
      create: p,
    })
    createdPlans.push(plan)
  }

  console.log('✅ Plans seeded')

  // Seed users
  const users = [
    { name: 'Admin User',    email: 'admin@isp.com',      role: 'admin'      as const },
    { name: 'John Customer', email: 'customer@isp.com',   role: 'customer'   as const },
    { name: 'Sarah Support', email: 'support@isp.com',    role: 'support'    as const },
    { name: 'Tech Mike',     email: 'technician@isp.com', role: 'technician' as const },
  ]

  for (const u of users) {
    const user = await prisma.user.upsert({
      where:  { email: u.email },
      update: {},
      create: { ...u, password, status: 'active' },
    })

    // Give customer an active subscription on Standard plan
    if (u.role === 'customer') {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + 30)

      await prisma.subscription.upsert({
        where:  { userId: user.id },
        update: {},
        create: {
          userId:     user.id,
          planId:     createdPlans[1].id, // Standard 50Mbps
          status:     'active',
          expiryDate: expiry,
        },
      })
    }
  }

  console.log('✅ Users seeded')
  console.table(users.map((u) => ({ role: u.role, email: u.email, password: 'password' })))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())