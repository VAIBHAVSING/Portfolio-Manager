"use client"

import { useState } from "react"
import { Pie, Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from "chart.js"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
)

// Mock data
const investmentData = {
  labels: [
    "Equity",
    "Fixed Deposit",
    "Real Estate",
    "Gold",
    "Bonds",
    "Mutual Funds",
  ],
  datasets: [
    {
      data: [300000, 200000, 500000, 100000, 150000, 250000],
      backgroundColor: [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
      ],
    },
  ],
}

const loanData = {
  labels: ["Home Loan", "Car Loan", "Personal Loan", "Education Loan"],
  datasets: [
    {
      data: [2000000, 500000, 300000, 1000000],
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
    },
  ],
}

const expensesData = {
  labels: [
    "Groceries",
    "Utilities",
    "Entertainment",
    "Transportation",
    "Healthcare",
  ],
  datasets: [
    {
      label: "Expenses",
      data: [15000, 10000, 8000, 6000, 5000],
      backgroundColor: "rgba(75, 192, 192, 0.6)",
    },
  ],
}


const mutualFundData = [
  { name: "Large Cap Fund", value: 100000, todayGain: 1500, totalGain: 15000 },
  { name: "Mid Cap Fund", value: 75000, todayGain: -500, totalGain: 8000 },
  { name: "Small Cap Fund", value: 50000, todayGain: 800, totalGain: 5000 },
  { name: "Debt Fund", value: 80000, todayGain: 200, totalGain: 3000 },
]

const stockData = [
  { name: "Company A", value: 50000, todayGain: 1000, totalGain: 10000 },
  { name: "Company B", value: 30000, todayGain: -500, totalGain: 5000 },
  { name: "Company C", value: 20000, todayGain: 300, totalGain: 2000 },
]

const netWorthHistory = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Net Worth",
      data: [1000000, 1050000, 1100000, 1080000, 1150000, 1200000],
      borderColor: "rgb(75, 192, 192)",
      tension: 0.1,
    },
  ],
}

export default function InteractiveFinanceDashboard() {
  const [activeDialog, setActiveDialog] = useState<string | null>(null)

  const totalInvestments = investmentData?.datasets?.[0]?.data?.reduce((a, b) => a + b, 0) || 0;
  const totalLoans = loanData?.datasets?.[0]?.data?.reduce((a, b) => a + b, 0) || 0;
  const totalMutualFunds = mutualFundData?.reduce((sum, fund) => sum + fund.value, 0) || 0;
  const totalStocks = stockData?.reduce((sum, stock) => sum + stock.value, 0) || 0;
  const netWorth = totalInvestments + totalMutualFunds + totalStocks - totalLoans;
  return (
    <div className="container mx-auto p-4">
      <Dialog open={!!activeDialog} onOpenChange={() => setActiveDialog(null)}>
        <h1 className="text-3xl font-bold mb-6">
          Interactive Personal Finance Dashboard
        </h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Total Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">
              ₹{netWorth.toLocaleString()}
            </div>
            <Line data={netWorthHistory} options={{ responsive: true }} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Investments by Sector</CardTitle>
            </CardHeader>
            <CardContent>
              <Pie data={investmentData} />
              <div className="mt-4 text-center">
                <p className="font-semibold">
                  Total: ₹{totalInvestments.toLocaleString()}
                </p>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setActiveDialog("investments")}
                  >
                    View Details
                  </Button>
                </DialogTrigger>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loans</CardTitle>
            </CardHeader>
            <CardContent>
              <Pie data={loanData} />
              <div className="mt-4 text-center">
                <p className="font-semibold">
                  Total: ₹{totalLoans.toLocaleString()}
                </p>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setActiveDialog("loans")}
                  >
                    View Details
                  </Button>
                </DialogTrigger>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>This Month's Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar
                data={expensesData}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
              <div className="mt-4 text-center">
                <p className="font-semibold">
                  Total: ₹
                  {expensesData.datasets[0]?.data
                    .reduce((a, b) => a + b, 0)
                    .toLocaleString()}
                </p>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setActiveDialog("expenses")}
                  >
                    View Details
                  </Button>
                </DialogTrigger>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Mutual Fund Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="value">
              <TabsList>
                <TabsTrigger value="value">Current Value</TabsTrigger>
                <TabsTrigger value="todayGain">Today's Gain</TabsTrigger>
                <TabsTrigger value="totalGain">Total Gain</TabsTrigger>
              </TabsList>
              <TabsContent value="value">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fund Name</TableHead>
                      <TableHead>Current Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mutualFundData.map((fund, index) => (
                      <TableRow key={index}>
                        <TableCell>{fund.name}</TableCell>
                        <TableCell>₹{fund.value.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="todayGain">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fund Name</TableHead>
                      <TableHead>Today's Gain</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mutualFundData.map((fund, index) => (
                      <TableRow key={index}>
                        <TableCell>{fund.name}</TableCell>
                        <TableCell
                          className={
                            fund.todayGain >= 0 ? "text-green-600" : "text-red-600"
                          }
                        >
                          ₹{fund.todayGain.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="totalGain">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fund Name</TableHead>
                      <TableHead>Total Gain</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mutualFundData.map((fund, index) => (
                      <TableRow key={index}>
                        <TableCell>{fund.name}</TableCell>
                        <TableCell>₹{fund.totalGain.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>


        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {activeDialog === "investments" && "Investment Details"}
              {activeDialog === "loans" && "Loan Details"}
              {activeDialog === "expenses" && "Expense Details"}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <ScrollArea className="h-64">
              {/* Details content */}
              {activeDialog === "investments" && (
                <p>Detailed view of investments...</p>
              )}
              {activeDialog === "loans" && <p>Detailed view of loans...</p>}
              {activeDialog === "expenses" && <p>Detailed view of expenses...</p>}
            </ScrollArea>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  )
}
