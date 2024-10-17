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
  const { type, amount } = await request.json()

  try {
    const newLoan = await prisma.loan.create({
      data: {
        userId,
        type,
        amount: parseFloat(amount),
      },
    })

    return NextResponse.json(newLoan)
  } catch (error) {
    console.error('Error adding loan:', error)
    return NextResponse.json({ error: 'Error adding loan' }, { status: 500 })
  }
}