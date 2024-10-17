"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import axios from "axios"
import { useSession } from "next-auth/react"

type Stock = {
  exchange: string
  assetType: string
  assetname: string
  assetSymbol: string
  id: number
  currentPrice: number
}

type Alert = {
  id: string
  userId: string
  alertName: string
  assetId: number
  conditionType: "ABOVE" | "BELOW"
  targetValue: number
  alertMethod: "EMAIL" | "SMS" | "PUSH"
  isActive: boolean
}

export default function AlertPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)
  const [alertToDelete, setAlertToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Stock[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { data: session } = useSession()

  const [newAlert, setNewAlert] = useState<Omit<Alert, "id">>({
    userId: session?.user?.id || "",
    alertName: "",
    assetId: 0,
    conditionType: "ABOVE",
    targetValue: 0,
    alertMethod: "EMAIL",
    isActive: true,
  })

  useEffect(() => {
    fetchAlerts()
  }, [session])

  const fetchAlerts = async () => {
    try {
      const response = await axios.get("/api/alerts", {
        headers: { userId: session?.user.id }
      });
      setAlerts(response.data.data);
    } catch (error) {
      console.error("Failed to fetch alerts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch alerts. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCreateAlert = async () => {
    if (alerts.length >= 5) {
      toast({
        title: "Alert limit reached",
        description: "You can create a maximum of 5 alerts.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await axios.post("/api/alerts", {
        alertName: newAlert.alertName,
        assetId: newAlert.assetId,
        conditionType: newAlert.conditionType,
        targetValue: newAlert.targetValue,
        alertMethod: newAlert.alertMethod,
        isActive: newAlert.isActive
      }, {
        headers: {
          userId: newAlert.userId,
        }
      });
      setAlerts([...alerts, response.data])
      setIsCreating(false)
      setNewAlert({
        userId: session?.user?.id || "",
        alertName: "",
        assetId: 0,
        conditionType: "ABOVE",
        targetValue: 0,
        alertMethod: "EMAIL",
        isActive: true,
      })
      toast({
        title: "Alert created",
        description: "Your new alert has been created successfully.",
      })
    } catch (error) {
      console.error("Failed to create alert:", error)
      toast({
        title: "Error",
        description: "Failed to create alert. Please try again.",
        variant: "destructive",
      })
    }
  }
  const handleUpdateAlert = async () => {
    if (!editingAlert) return

    try {
      const response = await axios.put(`/api/alerts/`, editingAlert, {
        headers: {
          userId: session?.user?.id,
          alertid: editingAlert.id
        }
      })
      setAlerts(alerts.map(alert =>
        alert.id === editingAlert.id ? response.data : alert
      ))
      setEditingAlert(null)
      toast({
        title: "Alert updated",
        description: "Your alert has been updated successfully.",
      })
    } catch (error) {
      console.error("Failed to update alert:", error)
      toast({
        title: "Error",
        description: "Failed to update alert. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAlert = async (id: string) => {
    try {
      await axios.delete(`/api/alerts/`, {
        headers: {
          userId: session?.user?.id,
          alertId: id
        }
      })
      setAlerts(alerts.filter(alert => alert.id !== id))
      setAlertToDelete(null)
      toast({
        title: "Alert deleted",
        description: "Your alert has been deleted successfully.",
      })
    } catch (error) {
      console.error("Failed to delete alert:", error)
      toast({
        title: "Error",
        description: "Failed to delete alert. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSearch = async () => {
    if (searchQuery.trim() === "") return
    setIsSearching(true)
    try {
      const response = await axios.get(`/api/search?query=${searchQuery}`)
      console.log(response.data);
      setSearchResults(response.data)
    } catch (error) {
      console.error("Failed to search stocks:", error)
      toast({
        title: "Error",
        description: "Failed to search stocks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Stock Alerts</h1>

      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Input
            type="text"
            placeholder="Search for stocks"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mr-2"
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? "Searching..." : <Search className="mr-2 h-4 w-4" />}
            Search
          </Button>
        </div>

        {searchResults.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              {searchResults.map((stock) => (
                <div key={stock.id} className="flex justify-between items-center mb-2">
                  <span>{stock.assetSymbol} - {stock.assetname}</span>
                  <span> {stock.assetType} - {stock.exchange}</span>
                  <Button
                    onClick={() => {
                      setNewAlert({ ...newAlert, assetId: stock.id })
                      setIsCreating(true)
                    }}
                  >
                    Create Alert
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Alert</DialogTitle>
              <DialogDescription>
                Set up a new stock price alert. You can create up to 5 alerts.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="alertName" className="text-right">
                  Alert Name
                </Label>
                <Input
                  id="alertName"
                  value={newAlert.alertName}
                  onChange={(e) => setNewAlert({ ...newAlert, alertName: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="conditionType" className="text-right">
                  Condition
                </Label>
                <Select
                  onValueChange={(value) => setNewAlert({ ...newAlert, conditionType: value as "ABOVE" | "BELOW" })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ABOVE">Above</SelectItem>
                    <SelectItem value="BELOW">Below</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="targetValue" className="text-right">
                  Target Price
                </Label>
                <Input
                  id="targetValue"
                  type="number"
                  value={newAlert.targetValue}
                  onChange={(e) => setNewAlert({ ...newAlert, targetValue: parseFloat(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="alertMethod" className="text-right">
                  Alert Method
                </Label>
                <Select
                  onValueChange={(value) => setNewAlert({ ...newAlert, alertMethod: value as "EMAIL" | "SMS" | "PUSH" })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select alert method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="TELEGRAM">TELEGRAM</SelectItem>
                    <SelectItem value="WHATSAPP">WHATSAPP</SelectItem>
                    <SelectItem value="PUSH">Push Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateAlert}>Create Alert</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alerts.map((alert) => (
          <Card key={alert.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {alert.alertName}
              </CardTitle>
              <div className="flex space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setEditingAlert(alert)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Alert</DialogTitle>
                      <DialogDescription>
                        Make changes to your stock price alert.
                      </DialogDescription>
                    </DialogHeader>
                    {editingAlert && (
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-alertName" className="text-right">
                            Alert Name
                          </Label>
                          <Input
                            id="edit-alertName"
                            value={editingAlert.alertName}
                            onChange={(e) => setEditingAlert({ ...editingAlert, alertName: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-conditionType" className="text-right">
                            Condition
                          </Label>
                          <Select
                            onValueChange={(value) => setEditingAlert({ ...editingAlert, conditionType: value as "ABOVE" | "BELOW" })}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ABOVE">Above</SelectItem>
                              <SelectItem value="BELOW">Below</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-targetValue" className="text-right">
                            Target Price
                          </Label>
                          <Input
                            id="edit-targetValue"
                            type="number"
                            value={editingAlert.targetValue}
                            onChange={(e) => setEditingAlert({ ...editingAlert, targetValue: parseFloat(e.target.value) })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-alertMethod" className="text-right">
                            Alert Method
                          </Label>
                          <Select
                            onValueChange={(value) => setEditingAlert({ ...editingAlert, alertMethod: value as "EMAIL" | "SMS" | "PUSH" })}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select alert method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EMAIL">Email</SelectItem>
                              <SelectItem value="SMS">SMS</SelectItem>
                              <SelectItem value="PUSH">Push Notification</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-isActive" className="text-right">
                            Active
                          </Label>
                          <Switch
                            id="edit-isActive"
                            checked={editingAlert.isActive}
                            onCheckedChange={(checked) => setEditingAlert({ ...editingAlert, isActive: checked })}
                          />
                        </div>
                      </div>
                    )}
                    <DialogFooter>

                      <Button onClick={handleUpdateAlert}>Update Alert</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setAlertToDelete(alert.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to delete this alert?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the alert.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setAlertToDelete(null)}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteAlert(alert.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {alert.assetId}
                {" "}
                {alert.conditionType === "ABOVE" ? "rises above" : "falls below"}
                {" "}
                ${alert.targetValue}
              </p>
              <p className="text-sm text-muted-foreground">
                Alert via: {alert.alertMethod}
              </p>
              <p className="text-sm text-muted-foreground">
                Status: {alert.isActive ? "Active" : "Inactive"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}