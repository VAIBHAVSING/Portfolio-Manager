import * as fs from 'fs';
import csv from 'csv-parser';

// Define an interface to represent the structure of the CSV data
interface CompanyData {
    companyName: string;
    industry: string;
    symbol: string;
    series: string;
    isinCode: string;
}


// Function to read the CSV file and parse it into an array of CompanyData
export default async function readCompanyCsv(): Promise<CompanyData[]> {
    return new Promise((resolve, reject) => {
        const filePath = 'ind_nifty50list.csv'; // Update this with the path to your CSV file
        const results: CompanyData[] = []; // Array to store the parsed data
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data: { [x: string]: any; }) => {
                // Map the CSV data to the CompanyData interface and push to results array
                results.push({
                    companyName: data['Company Name'],
                    industry: data['Industry'],
                    symbol: data['Symbol'],
                    series: data['Series'],
                    isinCode: data['ISIN Code'],
                });
            })
            .on('end', () => {
                resolve(results); // Resolve the promise with the results array
            })
            .on('error', (err: any) => {
                reject(err); // Reject the promise on error
            });
    });
}

// Usage example
