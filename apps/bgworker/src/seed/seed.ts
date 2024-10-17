import { getTokenInfo, loadData } from './token/index'; // Adjust the path according to your project structure
import readCompanyCsv from './token/readcsv'; // Ensure this imports the function correctly
import { PrismaClient } from '@prisma/client';

const url = "https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json";
const prisma = new PrismaClient();

async function main() {
  // Load the data from the URL
  const data = await loadData(url);

  // Read company data from the CSV file
  const stocks = await readCompanyCsv(); // Ensure this function returns the correct array format

  // Iterate over each stock and create a corresponding asset in the database
  for (const stock of stocks) {
    const token = await getTokenInfo(stock.symbol, data, 'NSE');
    // Only proceed if a valid token is found
    if (token.length > 0) { // Assuming getTokenInfo returns an array
      await prisma.asset.create({
        data: {
          id: parseInt(token[0]), // Change this logic to ensure unique IDs
          assetType: "STOCK",
          exchange: 'NSE',
          assetname: stock.companyName,
          assetSymbol: stock.symbol,
        }
      });
      console.log(`Created asset for ${stock.companyName}`);
    } else {
      console.log(`No token found for ${stock.symbol}`);
    }
  }

  // Example usage of getTokenInfo for a specific stock
  const tokenInfo = await getTokenInfo('RELIANCE', data, 'NSE'); // Call getTokenInfo
  console.log('Token Info for RELIANCE:', tokenInfo);
}

// Execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect(); // Disconnect Prisma Client
  });
