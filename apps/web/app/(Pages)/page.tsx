'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowRight, TrendingUp, Wallet, CreditCard, PieChart } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

type HomePageData = {
  netWorth: number
  totalInvestments: number
  totalLoans: number
  totalExpenses: number
  netWorthHistory: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor: string
      tension: number
    }[]
  }
}

export default function HomePage() {
  const [data, setData] = useState<HomePageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.id) {
        try {
          const response = await axios.get(`/api/finance/${session.user.id}/home`)
          setData(response.data)
        } catch (error) {
          console.error('Error fetching home page data:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchData()
  }, [session])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!data) {
    return <div className="text-center">
      {/* <Navbar/> */}
      <h1>No data available</h1>
      </div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Your Financial Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data.netWorth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Your total assets minus liabilities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data.totalInvestments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Sum of all your investments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data.totalLoans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Sum of all your outstanding loans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Your average monthly expenses</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Net Worth Trend</CardTitle>
          <CardDescription>Your net worth over the last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Line data={data.netWorthHistory} options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  grid: {
                    display: false,
                  },
                },
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                  },
                },
              },
              plugins: {
                legend: {
                  display: false,
                },
              },
            }} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Link href="/dashboard">
          <Button size="lg">
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}