import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import {handler} from '../auth/[...nextauth]/route';
import { Prisma } from '@/lib/generateclient';
import { createWatchlistSchema, CreateWatchlistType } from './Validator';
import { z } from 'zod';

export async function GET(req: Request) {
  try {
    // const session= await getServerSession(handler);
    // console.log(session);
     const UserId=req.headers.get("userid") as string;
    // if (!session ) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Fetch all watchlists for the user along with their associated assets
    const watchlists = await Prisma.watchlist.findMany({
      where: {
        userId: UserId,
      },
      include: {
        assets: {
          select:{
            asset:true
          }
        }, // Assuming 'assets' is the relation name in your Prisma schema
      },
    });

    return NextResponse.json(watchlists);
  } catch (error) {
    console.error(error); // Log error for debugging
    return NextResponse.json({ error: 'Failed to fetch watchlists' }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate the body against the Zod schema
    const validatedData = createWatchlistSchema.parse(body);

    const session = await getServerSession(handler);

    const resp=await Prisma.watchlist.create({
      data: {
        userId: validatedData.userID,
        name: validatedData.watchlistName,
        assets: {
        },
      },
      select:{
        id:true
      }
    });
    return NextResponse.json({ msg: "Data received!", watchlistid:resp.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }

    console.error(error); // Log other errors for debugging
    return NextResponse.json({ error: 'Failed to process data' }, { status: 500 });
  }
}
export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const watchlistId = body.watchlistId as string;

    // Verify if the watchlistId exists
    const existingWatchlist = await Prisma.watchlist.findUnique({
      where: {
        id: watchlistId,
      },
    });

    if (!existingWatchlist) {
      return NextResponse.json(
        { error: 'Watchlist not found' },
        { status: 404 } // 404 Not Found
      );
    }

    // Delete the watchlist and its associated assets
    await Prisma.watchlist.delete({
      where: {
        id: watchlistId,
      },
    });

    return NextResponse.json({ msg: 'Watchlist deleted successfully' });
  } catch (error) {
    console.error(error); // Log error for debugging
    return NextResponse.json({ error: 'Failed to delete watchlist' }, { status: 500 });
  }
}