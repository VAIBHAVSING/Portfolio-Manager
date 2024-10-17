import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const password = await hash('password123',10)
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'John Doe',
      password,
      username: 'johndoe',
      AuthOption: 'Credentials',
      investments: {
        create: [
          { type: 'Equity', amount: 50000 },
          { type: 'Fixed Deposit', amount: 25000 },
        ],
      },
      loans: {
        create: [
          { type: 'Home Loan', amount: 200000 },
          { type: 'Car Loan', amount: 30000 },
        ],
      },
      expenses: {
        create: [
          { category: 'Groceries', amount: 500 },
          { category: 'Utilities', amount: 200 },
        ],
      },
      portfolios: {
        create: {
          name: 'Main Portfolio',
          holdings: {
            create: [
              { assetType: 'STOCK', exchange: 'NSE', assetSymbol: 'AAPL', quantity: 10, averagePrice: 150, todayGain: 50, totalGain: 500 },
              { assetType: 'MUTUALFUND', exchange: 'NSE', assetSymbol: 'HDFC_MF', quantity: 100, averagePrice: 20, todayGain: 10, totalGain: 200 },
            ],
          },
        },
      },
      netWorthHistory: {
        create: [
          { date: new Date('2023-06-01'), value: 100000 },
          { date: new Date('2023-07-01'), value: 102000 },
          { date: new Date('2023-08-01'), value: 105000 },
          { date: new Date('2023-09-01'), value: 106000 },
          { date: new Date('2023-10-01'), value: 108000 },
          { date: new Date('2023-11-01'), value: 110000 },
        ],
      },
    },
  })
  console.log({ user })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })