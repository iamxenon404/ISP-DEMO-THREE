import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const password = await bcrypt.hash('password', 10)

  console.log('🌱 Seeding plans...')
  const plans = [
    { name: 'Basic',    speed: 10,  price: 5000  },
    { name: 'Standard', speed: 50,  price: 15000 },
    { name: 'Premium',  speed: 100, price: 25000 },
  ]

  const createdPlans = []
  for (const p of plans) {
    const plan = await prisma.plan.upsert({
      where: { id: createdPlans.length + 1 },
      update: p,
      create: p,
    })
    createdPlans.push(plan)
    console.log(`  ✓ Created plan: ${plan.name} - ${plan.speed}Mbps`)
  }

  console.log('👥 Seeding users...')
  const users = [
    { name: 'John Customer', email: 'customer@isp.com',   role: 'customer' },
    { name: 'Admin User',    email: 'admin@isp.com',      role: 'admin' },
    { name: 'Sarah Support', email: 'support@isp.com',    role: 'support' },
    { name: 'Tech Mike',     email: 'technician@isp.com', role: 'technician' },
  ]

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password,
        role: u.role as any,
        status: 'active',
      },
    })
    console.log(`  ✓ Created user: ${user.name} (${user.role})`)

    // Give customer an active subscription on Standard plan (50Mbps)
    if (u.role === 'customer') {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + 30) // 30 days from now

      const sub = await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          planId: createdPlans[1].id, // Standard plan
          status: 'active',
          expiryDate: expiry,
        },
      })
      console.log(`    └─ Subscription: ${createdPlans[1].name} plan, expires ${expiry.toDateString()}`)
    }
  }

  console.log('\n✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())