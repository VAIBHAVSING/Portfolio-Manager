import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { handler } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(handler)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId } = params
  const { name, value, todayGain, totalGain } = await request.json()

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { portfolios: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let portfolio = user.portfolios[0]
    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          userId,
          name: 'Default Portfolio',
        },
      })
    }

    const newHolding = await prisma.holding.create({
      data: {
        portfolioId: portfolio.id,
        assetType: 'MUTUALFUND',
        exchange: 'NSE', // Assuming NSE for mutual funds
        assetSymbol: name,
        quantity: 1, // Assuming 1 unit for simplicity
        averagePrice: parseFloat(value),
        todayGain: parseFloat(todayGain),
        totalGain: parseFloat(totalGain),
      },
    })

    return NextResponse.json(newHolding)
  } catch (error) {
    console.error('Error adding mutual fund:', error)
    return NextResponse.json({ error: 'Error adding mutual fund' }, { status: 500 })
  }
}