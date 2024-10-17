"use client"

import { useEffect, useState } from "react"
import { Plus, X, Trash2, Search } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSession } from "next-auth/react"
import axios from "axios"
import { useRecoilValue } from "recoil"
import { UserAtom } from "@/lib/store/atom"

type Stock = {
  id: string
  symbol: string
  name: string
  Exchange: string;
}

type Watchlist = {
  id: string
  name: string
  stocks: Stock[]
}

// Mock data for available stocks
const availableStocks: Stock[] = [
  { id: "1", Exchange: "NSE", symbol: "AAPL", name: "Apple Inc.", },
  { id: "2", Exchange: "NSE", symbol: "GOOGL", name: "Alphabet Inc.", },
  { id: "3", Exchange: "NSE", symbol: "MSFT", name: "Microsoft Corporation", },
  { id: "4", Exchange: "NSE", symbol: "AMZN", name: "Amazon.com, Inc.", },
  { id: "5", Exchange: "NSE", symbol: "FB", name: "Meta Platforms, Inc.", },
];

export default function WatchlistPage() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([])
  const [newWatchlistName, setNewWatchlistName] = useState("")
  const [selectedWatchlist, setSelectedWatchlist] = useState<Watchlist | null>(null)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [stockToRemove, setStockToRemove] = useState<{ watchlistId: string, stockId: string } | null>(null)
  const [watchlistToDelete, setWatchlistToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Stock[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const user = useRecoilValue(UserAtom);
  const { data: session, status } = useSession();

  const createWatchlist = async () => {
    if (watchlists.length >= 5) {
      alert("You can create a maximum of 5 watchlists.")
      return
    }
    if (newWatchlistName.trim() === "") {
      alert("Please enter a valid watchlist name.")
      return
    }
    const newWatchlist: Watchlist = {
      id: Date.now().toString(),
      name: newWatchlistName,
      stocks: [],
    }
    try {
      const response = await axios.post("http://localhost:3000/api/watchlist", {
        userID: user.id,
        watchlistName: newWatchlistName,
      });
      newWatchlist.id = response.data.watchlistid;
      setWatchlists([...watchlists, newWatchlist])
      setNewWatchlistName("")
    } catch (e) {
      alert("watchlist not created")
      console.error("error", e)
    }
  }

  const deleteWatchlist = (id: string) => {
    setWatchlists(watchlists.filter(watchlist => watchlist.id !== id))
    setWatchlistToDelete(null)
  }

  const addStockToWatchlist = async (stock: Stock, watchlistId: string) => {
    const watchlist = watchlists.find(w => w.id === watchlistId);
    if (!watchlist) return;
    if (watchlist.stocks.length >= 10) {
      alert("You can add a maximum of 10 stocks to a watchlist.")
      return
    }
    if (watchlist.stocks.some(s => s.id === stock.id)) {
      alert("This stock is already in the watchlist.")
      return
    }
    try {
      await axios.post("http://localhost:3000/api/watchlist/asset", {
        watchlistId: watchlistId,
        assetId: parseInt(stock.id)
      })
      const updatedWatchlists = watchlists.map(w =>
        w.id === watchlistId
          ? { ...w, stocks: [...w.stocks, stock] }
          : w
      )
      setWatchlists(updatedWatchlists)
    } catch (e) {
      alert("Stock Add Unsuccessful")
      console.error("error:", e)
    }
  }

  const removeStockFromWatchlist = async(watchlistId: string, stockId: string) => {
    try{
      const response = await axios.delete("http://localhost:3000/api/watchlist/asset", {
        data: {
            watchlistId,
            assetId:parseInt(stockId)
        }
      });    
      const updatedWatchlists = watchlists.map(watchlist =>
        watchlist.id === watchlistId
          ? { ...watchlist, stocks: watchlist.stocks.filter(stock => stock.id !== stockId) }
          : watchlist
      )
      setWatchlists(updatedWatchlists)
      setStockToRemove(null)
    }catch(e){
      console.error("error:",e)
    }
  }

  const handleSearch = async () => {
    if (searchQuery.trim() === "") return;
    setIsSearching(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/search?query=${searchQuery}`);
      setSearchResults(response.data.map((item: any) => ({
        id: item.id.toString(),
        symbol: item.assetSymbol,
        name: item.assetname,
        Exchange: item.exchange,
      })));
    } catch (error) {
      console.error("Search failed:", error);
      alert("An error occurred while searching for stocks.");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    async function fetchWatchlists() {
      try {
        const response = await axios.get("http://localhost:3000/api/watchlist", {
          headers: {
            userid: session?.user.id,
          },
        });

        const resp = response.data;

        const newWatchlist: Watchlist[] = resp.map((data: any) => {
          const stocks: Stock[] = data.assets.map((assetItem: any) => ({
            id: assetItem.asset.id.toString(),
            symbol: assetItem.asset.assetSymbol,
            name: assetItem.asset.assetname,
            Exchange: assetItem.asset.exchange,
          }));

          return {
            id: data.id,
            name: data.name,
            stocks: stocks,
          };
        });

        setWatchlists(newWatchlist);
      } catch (e) {
        console.error("error:", e);
      }
    }
    if (session?.user.id) {
      fetchWatchlists();
    }
  }, [session?.user.id]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Watchlists</h1>

      <div className="flex items-center mb-6">
        <Input
          type="text"
          placeholder="New Watchlist Name"
          value={newWatchlistName}
          onChange={(e) => setNewWatchlistName(e.target.value)}
          className="mr-2"
        />
        <Button onClick={createWatchlist}>
          <Plus className="mr-2 h-4 w-4" /> Create Watchlist
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center">
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
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                {searchResults.map((stock) => (
                  <div key={stock.id} className="flex justify-between items-center mb-2">
                    <span>{stock.symbol} - {stock.name} ({stock.Exchange})</span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">Add to Watchlist</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add to Watchlist</DialogTitle>
                          <DialogDescription>
                            Choose a watchlist to add {stock.symbol} to:
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          {watchlists.map((watchlist) => (
                            <Button
                              key={watchlist.id}
                              onClick={() => {
                                addStockToWatchlist(stock, watchlist.id);
                              }}
                            >
                              {watchlist.name}
                            </Button>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {watchlists.map(watchlist => (
          <Card key={watchlist.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {watchlist.name}
              </CardTitle>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => setWatchlistToDelete(watchlist.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this watchlist?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the watchlist and remove all its stocks.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteWatchlist(watchlist.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                {watchlist.stocks.map(stock => (
                  <div key={stock.id} className="flex justify-between items-center mb-2">
                    <span>{stock.symbol} - {stock.Exchange}</span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setStockToRemove({ watchlistId: watchlist.id, stockId: stock.id })}>
                          <X className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to remove this stock?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will remove {stock.symbol} from the watchlist.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeStockFromWatchlist(watchlist.id, stock.id)}>Remove</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}