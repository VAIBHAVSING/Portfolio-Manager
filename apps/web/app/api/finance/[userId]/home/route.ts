import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { handler } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(handler)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId } = params

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        investments: true,
        loans: true,
        expenses: true,
        netWorthHistory: {
          orderBy: { date: 'desc' },
          take: 12,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const totalInvestments = user.investments.reduce((sum, inv) => sum + inv.amount.toNumber(), 0)
    const totalLoans = user.loans.reduce((sum, loan) => sum + loan.amount.toNumber(), 0)
    const totalExpenses = user.expenses.reduce((sum, exp) => sum + exp.amount.toNumber(), 0)
    const netWorth = totalInvestments - totalLoans

    const netWorthHistory = user.netWorthHistory
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-12)

    return NextResponse.json({
      netWorth,
      totalInvestments,
      totalLoans,
      totalExpenses,
      netWorthHistory: {
        labels: netWorthHistory.map(h => h.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
        datasets: [{
          label: 'Net Worth',
          data: netWorthHistory.map(h => h.value),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        }],
      },
    })
  } catch (error) {
    console.error('Error fetching home page data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}