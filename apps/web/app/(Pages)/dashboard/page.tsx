'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { Pie, Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title)

type FinanceData = {
  investments: {
    labels: string[]
    datasets: { data: number[]; backgroundColor: string[] }[]
  }
  loans: {
    labels: string[]
    datasets: { data: number[]; backgroundColor: string[] }[]
  }
  expenses: {
    labels: string[]
    datasets: { label: string; data: number[]; backgroundColor: string }[]
  }
  mutualFunds: { name: string; value: number; todayGain: number; totalGain: number }[]
  stocks: { name: string; value: number; todayGain: number; totalGain: number }[]
  netWorthHistory: {
    labels: string[]
    datasets: { label: string; data: number[]; borderColor: string; tension: number }[]
  }
}

export default function Dashboard() {
  const [data, setData] = useState<FinanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()

  const [newInvestment, setNewInvestment] = useState({ type: '', amount: '' })
  const [newExpense, setNewExpense] = useState({ category: '', amount: '' })
  const [newLoan, setNewLoan] = useState({ type: '', amount: '' })
  const [newMutualFund, setNewMutualFund] = useState({ name: '', value: '', todayGain: '', totalGain: '' })
  const [newStock, setNewStock] = useState({ name: '', value: '', todayGain: '', totalGain: '' })

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.id) {
        try {
          const response = await axios.get(`/api/finance/${session.user.id}`)
          setData(response.data)
        } catch (error) {
          console.error('Error fetching data:', error)
          toast({
            title: 'Error',
            description: 'Failed to fetch dashboard data',
            variant: 'destructive',
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchData()
  }, [session])

  const handleAddInvestment = async () => {
    if (!session?.user?.id) return
    try {
      await axios.post(`/api/finance/${session.user.id}/investments`, newInvestment)
      toast({ title: 'Success', description: 'Investment added successfully' })
      // Refresh data
      const response = await axios.get(`/api/finance/${session.user.id}`)
      setData(response.data)
      setNewInvestment({ type: '', amount: '' })
    } catch (error) {
      console.error('Error adding investment:', error)
      toast({
        title: 'Error',
        description: 'Failed to add investment',
        variant: 'destructive',
      })
    }
  }

  const handleAddExpense = async () => {
    if (!session?.user?.id) return
    try {
      await axios.post(`/api/finance/${session.user.id}/expenses`, newExpense)
      toast({ title: 'Success', description: 'Expense added successfully' })
      // Refresh data
      const response = await axios.get(`/api/finance/${session.user.id}`)
      setData(response.data)
      setNewExpense({ category: '', amount: '' })
    } catch (error) {
      console.error('Error adding expense:', error)
      toast({
        title: 'Error',
        description: 'Failed to add expense',
        variant: 'destructive',
      })
    }
  }

  const handleAddLoan = async () => {
    if (!session?.user?.id) return
    try {
      await axios.post(`/api/finance/${session.user.id}/loans`, newLoan)
      toast({ title: 'Success', description: 'Loan added successfully' })
      // Refresh data
      const response = await axios.get(`/api/finance/${session.user.id}`)
      setData(response.data)
      setNewLoan({ type: '', amount: '' })
    } catch (error) {
      console.error('Error adding loan:', error)
      toast({
        title: 'Error',
        description: 'Failed to add loan',
        variant: 'destructive',
      })
    }
  }

  const handleAddMutualFund = async () => {
    if (!session?.user?.id) return
    try {
      await axios.post(`/api/finance/${session.user.id}/mutualfunds`, newMutualFund)
      toast({ title: 'Success', description: 'Mutual fund added successfully' })
      // Refresh data
      const response = await axios.get(`/api/finance/${session.user.id}`)
      setData(response.data)
      setNewMutualFund({ name: '', value: '', todayGain: '', totalGain: '' })
    } catch (error) {
      console.error('Error adding mutual fund:', error)
      toast({
        title: 'Error',
        description: 'Failed to add mutual fund',
        variant: 'destructive',
      })
    }
  }

  const handleAddStock = async () => {
    if (!session?.user?.id) return
    try {
      await axios.post(`/api/finance/${session.user.id}/stocks`, newStock)
      toast({ title: 'Success', description: 'Stock added successfully' })
      // Refresh data
      const response = await axios.get(`/api/finance/${session.user.id}`)
      setData(response.data)
      setNewStock({ name: '', value: '', todayGain: '', totalGain: '' })
    } catch (error) {
      console.error('Error adding stock:', error)
      toast({
        title: 'Error',
        description: 'Failed to add stock',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!data) {
    return <div className="text-center">No data available</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Financial Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Investments</CardTitle>
          </CardHeader>
          <CardContent>
            <Pie data={data.investments} />
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4"><Plus className="mr-2 h-4 w-4" />Add Investment</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Investment</DialogTitle>
                  <DialogDescription>Enter the details of your new investment.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="investment-type" className="text-right">Type</Label>
                    <Input
                      id="investment-type"
                      value={newInvestment.type}
                      onChange={(e) => setNewInvestment({ ...newInvestment, type: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="investment-amount" className="text-right">Amount</Label>
                    <Input
                      id="investment-amount"
                      type="number"
                      value={newInvestment.amount}
                      onChange={(e) => setNewInvestment({ ...newInvestment, amount: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <Button onClick={handleAddInvestment}>Add Investment</Button>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <Pie data={data.loans} />
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4"><Plus className="mr-2 h-4 w-4" />Add Loan</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Loan</DialogTitle>
                  <DialogDescription>Enter the details of your new loan.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="loan-type" className="text-right">Type</Label>
                    <Input
                      id="loan-type"
                      value={newLoan.type}
                      onChange={(e) => setNewLoan({ ...newLoan, type: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="loan-amount" className="text-right">Amount</Label>
                    <Input
                      id="loan-amount"
                      type="number"
                      value={newLoan.amount}
                      onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <Button onClick={handleAddLoan}>Add Loan</Button>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={data.expenses} />
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4"><Plus className="mr-2 h-4 w-4" />Add Expense</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                  <DialogDescription>Enter the details of your new expense.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expense-category" className="text-right">Category</Label>
                    <Input
                      id="expense-category"
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expense-amount" className="text-right">Amount</Label>
                    <Input
                      id="expense-amount"
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <Button onClick={handleAddExpense}>Add Expense</Button>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Net Worth History</CardTitle>
        </CardHeader>
        <CardContent>
          <Line data={data.netWorthHistory} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mutualFunds">
            <TabsList>
              <TabsTrigger value="mutualFunds">Mutual Funds</TabsTrigger>
              <TabsTrigger value="stocks">Stocks</TabsTrigger>
            </TabsList>
            <TabsContent value="mutualFunds">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Today's Gain</TableHead>
                    <TableHead>Total Gain</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.mutualFunds.map((fund, index) => (
                    <TableRow key={index}>
                      <TableCell>{fund.name}</TableCell>
                      <TableCell>₹{fund.value.toLocaleString()}</TableCell>
                      <TableCell className={fund.todayGain >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ₹{fund.todayGain.toLocaleString()}
                      </TableCell>
                      <TableCell className={fund.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ₹{fund.totalGain.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Dialog>
                <DialogTrigger  asChild>
                  <Button className="mt-4"><Plus className="mr-2 h-4 w-4" />Add Mutual Fund</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Mutual Fund</DialogTitle>
                    <DialogDescription>Enter the details of your new mutual fund.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="fund-name" className="text-right">Name</Label>
                      <Input
                        id="fund-name"
                        value={newMutualFund.name}
                        onChange={(e) => setNewMutualFund({ ...newMutualFund, name: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="fund-value" className="text-right">Value</Label>
                      <Input
                        id="fund-value"
                        type="number"
                        value={newMutualFund.value}
                        onChange={(e) => setNewMutualFund({ ...newMutualFund, value: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="fund-today-gain" className="text-right">Today's Gain</Label>
                      <Input
                        id="fund-today-gain"
                        type="number"
                        value={newMutualFund.todayGain}
                        onChange={(e) => setNewMutualFund({ ...newMutualFund, todayGain: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="fund-total-gain" className="text-right">Total Gain</Label>
                      <Input
                        id="fund-total-gain"
                        type="number"
                        value={newMutualFund.totalGain}
                        onChange={(e) => setNewMutualFund({ ...newMutualFund, totalGain: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddMutualFund}>Add Mutual Fund</Button>
                </DialogContent>
              </Dialog>
            </TabsContent>
            <TabsContent value="stocks">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Today's Gain</TableHead>
                    <TableHead>Total Gain</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.stocks.map((stock, index) => (
                    <TableRow key={index}>
                      <TableCell>{stock.name}</TableCell>
                      <TableCell>₹{stock.value.toLocaleString()}</TableCell>
                      <TableCell className={stock.todayGain >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ₹{stock.todayGain.toLocaleString()}
                      </TableCell>
                      <TableCell className={stock.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ₹{stock.totalGain.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-4"><Plus className="mr-2 h-4 w-4" />Add Stock</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Stock</DialogTitle>
                    <DialogDescription>Enter the details of your new stock.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stock-name" className="text-right">Name</Label>
                      <Input
                        id="stock-name"
                        value={newStock.name}
                        onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stock-value" className="text-right">Value</Label>
                      <Input
                        id="stock-value"
                        type="number"
                        value={newStock.value}
                        onChange={(e) => setNewStock({ ...newStock, value: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stock-today-gain" className="text-right">Today's Gain</Label>
                      <Input
                        id="stock-today-gain"
                        type="number"
                        value={newStock.todayGain}
                        onChange={(e) => setNewStock({ ...newStock, todayGain: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stock-total-gain" className="text-right">Total Gain</Label>
                      <Input
                        id="stock-total-gain"
                        type="number"
                        value={newStock.totalGain}
                        onChange={(e) => setNewStock({ ...newStock, totalGain: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddStock}>Add Stock</Button>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}