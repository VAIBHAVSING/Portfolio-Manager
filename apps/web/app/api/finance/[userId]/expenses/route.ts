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
  const { category, amount } = await request.json()

  try {
    const newExpense = await prisma.expense.create({
      data: {
        userId,
        category,
        amount: parseFloat(amount),
      },
    })

    return NextResponse.json(newExpense)
  } catch (error) {
    console.error('Error adding expense:', error)
    return NextResponse.json({ error: 'Error adding expense' }, { status: 500 })
  }
}