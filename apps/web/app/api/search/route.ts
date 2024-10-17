import { Prisma } from '@/lib/generateclient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    // Check if the query is valid
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ message: "Query parameter is missing or invalid" }, { status: 400 });
    }

    // Perform the search query on Asset model using Prisma
    const assets = await Prisma.asset.findMany({
      where: {
        OR: [
          {
            assetname: {
              contains: query, // Partial match for asset name
              mode: 'insensitive', // Case-insensitive search
            },
          },
          {
            assetSymbol: {
              contains: query, // Partial match for asset symbol
              mode: 'insensitive', // Case-insensitive search
            },
          },
        ],
      },
    });

    // Return the search results
    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}
