import { NextResponse } from 'next/server';
import { Prisma } from '@/lib/generateclient';
import { z } from 'zod';

// Zod schema to validate asset addition
const addAssetSchema = z.object({
  watchlistId: z.string(),
  assetId: z.number(), // Assuming assetId is an integer
});

// Zod schema to validate asset removal
const removeAssetSchema = z.object({
  watchlistId: z.string(),
  assetId: z.number(), // Assuming assetId is an integer
});

// Add an asset to a watchlist
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate the request body using Zod schema
    const validatedData = addAssetSchema.parse(body);

    const { watchlistId, assetId } = validatedData;

    // Ensure the watchlist exists
    const existingWatchlist = await Prisma.watchlist.findUnique({
      where: { id: watchlistId },
    });

    if (!existingWatchlist) {
      return NextResponse.json(
        { error: 'Watchlist not found' },
        { status: 404 } // Not Found
      );
    }

    // Add the asset to the watchlist
    await Prisma.watchlistAsset.create({
      data: {
        watchlistId: watchlistId,
        assetId: assetId,
      },
    });

    return NextResponse.json({ msg: 'Asset added successfully to watchlist' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: 'Failed to add asset' }, { status: 500 });
  }
}

// Remove an asset from a watchlist
export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    // Validate the request body using Zod schema
    const validatedData = removeAssetSchema.parse(body);

    const { watchlistId, assetId } = validatedData;

    // Check if the watchlist exists
    const existingWatchlist = await Prisma.watchlist.findUnique({
      where: { id: watchlistId },
    });

    if (!existingWatchlist) {
      return NextResponse.json(
        { error: 'Watchlist not found' },
        { status: 404 } // Not Found
      );
    }

    // Check if the asset exists in the watchlist
    const assetInWatchlist = await Prisma.watchlistAsset.findFirst({
      where: {
        watchlistId: watchlistId,
        assetId: assetId,
      },
    });

    if (!assetInWatchlist) {
      return NextResponse.json(
        { error: 'Asset not found in watchlist' },
        { status: 404 } // Not Found
      );
    }

    // Remove the asset from the watchlist
    await Prisma.watchlistAsset.delete({
      where: {
        id: assetInWatchlist.id,
      },
    });

    return NextResponse.json({ msg: 'Asset removed from watchlist' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: 'Failed to remove asset' }, { status: 500 });
  }
}
