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
        portfolios: {
          include: {
            holdings: true,
          },
        },
        netWorthHistory: {
          orderBy: { date: 'desc' },
          take: 6, // Last 6 months
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const investmentData = {
      labels: ['Equity', 'Fixed Deposit', 'Real Estate', 'Gold', 'Bonds', 'Mutual Funds'],
      datasets: [{
        data: user.investments.map(inv => Number(inv.amount)),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      }],
    }

    const loanData = {
      labels: ['Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan'],
      datasets: [{
        data: user.loans.map(loan => Number(loan.amount)),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      }],
    }

    const expenseData = {
      labels: ['Groceries', 'Utilities', 'Entertainment', 'Transportation', 'Healthcare'],
      datasets: [{
        label: 'Expenses',
        data: user.expenses.map(exp => Number(exp.amount)),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }],
    }

    const netWorthHistory = {
      labels: user.netWorthHistory.map(history => history.date.toISOString().split('T')[0]),
      datasets: [{
        label: 'Net Worth',
        data: user.netWorthHistory.map(history => Number(history.value)),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      }],
    }

    const mutualFunds = user.portfolios.flatMap(portfolio => 
      portfolio.holdings.filter(holding => holding.assetType === 'MUTUALFUND')
        .map(holding => ({
          name: holding.assetSymbol,
          value: Number(holding.quantity) * Number(holding.averagePrice),
          todayGain: Number(holding.todayGain),
          totalGain: Number(holding.totalGain),
        }))
    )

    const stocks = user.portfolios.flatMap(portfolio => 
      portfolio.holdings.filter(holding => holding.assetType === 'STOCK')
        .map(holding => ({
          name: holding.assetSymbol,
          value: Number(holding.quantity) * Number(holding.averagePrice),
          todayGain: Number(holding.todayGain),
          totalGain: Number(holding.totalGain),
        }))
    )

    const responseData = {
      investments: investmentData,
      loans: loanData,
      expenses: expenseData,
      mutualFunds,
      stocks,
      netWorthHistory,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching finance data:', error)
    return NextResponse.json({ error: 'Error fetching finance data' }, { status: 500 })
  }
}