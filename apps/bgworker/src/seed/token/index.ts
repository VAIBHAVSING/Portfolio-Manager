import axios from 'axios';

// Define the interface for the master data
export interface MasterData {
  token: string;
  exch_seg: string;
  symbol: string;
  name: string;
  instrumenttype?: string;
  expiry?: string;
  strike?: number;
}

// Load the data from the URL using axios
export async function loadData(url: string): Promise<MasterData[]> {
  const response = await axios.get(url);
  const data = response.data;
  
  // Convert 'expiry' to Date and 'strike' to number
  const processedData = data.map((item: MasterData) => ({
    ...item,
    expiry: item.expiry ? new Date(item.expiry) : null,
    strike: item.strike ? Number(item.strike) : 0
  }));
  
  return processedData;
}

// Export the getTokenInfo function
export function getTokenInfo(
  symbol: string,
  M: MasterData[],
  exch_seg: string = 'NSE',
  instrumenttype: string = "EQ",
  strike_price: number = 0,
  pe_ce: string = "none"
): string[] { // Return an array of strings for tokens
  strike_price *= 100; // Convert strike price to match the format
  
  if (exch_seg === 'NSE') {
    // Filter for NSE stocks with the given symbol
    const eq_M = M.filter((item) => item.exch_seg === 'NSE' && item.symbol.includes('EQ') && item.name === symbol);
    return eq_M.map(item => item.token); // Return only tokens
  } else if (exch_seg === 'NFO' && (instrumenttype === 'FUTSTK' || instrumenttype === 'FUTIDX')) {
    // Filter for futures
    const futures = M.filter((item) => item.exch_seg === 'NFO' && item.instrumenttype === instrumenttype && item.name === symbol);
    return futures.sort((a, b) => (a.expiry && b.expiry) ? new Date(a.expiry).getTime() - new Date(b.expiry).getTime() : 0)
                  .map(item => item.token); // Return only tokens
  } else if (exch_seg === 'NFO' && (instrumenttype === 'OPTSTK' || instrumenttype === 'OPTIDX')) {
    // Filter for options
    const options = M.filter((item) =>
      item.exch_seg === 'NFO' &&
      item.instrumenttype === instrumenttype &&
      item.name === symbol &&
      item.strike === strike_price &&
      item.symbol.endsWith(pe_ce)
    );
    return options.sort((a, b) => (a.expiry && b.expiry) ? new Date(a.expiry).getTime() - new Date(b.expiry).getTime() : 0)
                   .map(item => item.token); // Return only tokens
  }
  
  return [];
}
