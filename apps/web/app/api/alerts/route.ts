import { Prisma } from '@/lib/generateclient'; // Your Prisma client import
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';  // Optional, for request validation
import redisPromise, { MyRedisClient } from './controller';

// Define the Zod schema to validate the request body
const alertSchema = z.object({
  alertName: z.string(),
  assetId: z.number(),
  conditionType: z.enum(["ABOVE", "BELOW"]),
  targetValue: z.number(),
  alertMethod: z.enum(["EMAIL", "TELEGRAM", "PUSH", "WHATSAPP"]),
  isActive: z.boolean(),
});

// POST API handler
export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request body using the schema
    const body = await req.json();
    const validatedData = alertSchema.parse(body);
    const userId=req.headers.get("userId") as string;
    // Destructure the validated data
    const {  alertName, assetId, conditionType, targetValue, alertMethod, isActive } = validatedData;

    // Insert the new alert into the database using Prisma
    const newAlert = await Prisma.alert.create({
      data: {
        userId,
        alertName,
        assetId,
        conditionType,
        targetValue,
        alertMethod,
        isActive,
      },
      select:{
        id:true,
        assetId:true,
        conditionType:true,
        targetValue:true,
        isActive:true,
        alertMethod:true
      }
    });
    const Redis=await redisPromise;
    await MyRedisClient.addToQueue(JSON.stringify(newAlert));
    // Respond with the newly created alert
    return NextResponse.json(newAlert, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }

    // Handle other errors
    console.error('Error creating alert:', error);
    NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('userId');
    if (!userId) {
      return NextResponse.json({ msg: "userId required" }, { status: 400 });
    }
    const response = await Prisma.alert.findMany({
      where: {
        userId: userId
      }
    })
    return NextResponse.json({ data: response });
  } catch (e) {
    console.error('Error fetching alert:', e);
    return NextResponse.json({ error: 'Failed to fetch alert' }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get('userId') as string;
    const alertId = req.headers.get('alertId') as string;
    if (!(userId && alertId)) {
      return NextResponse.json({ msg: "userId and alertId required" }, { status: 400 });
    }
    const response = await Prisma.alert.delete({
      where: {
        userId: userId,
        id: alertId
      }
    });
    return NextResponse.json({ msg: "Alert deleted successful" });
  } catch (e) {
    console.error('Error deleting alert:', e);
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 });
  }
}
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('userId') as string;
    const alertId = req.headers.get('alertId') as string;
    if (!(userId && alertId)) {
      return NextResponse.json({ msg: "userId and alertId required" }, { status: 400 });
    }
    const body = await req.json();
    const validatedData = alertSchema.parse(body);
    const { alertName, assetId, conditionType, targetValue, alertMethod, isActive } = validatedData;
    const response=await Prisma.alert.update({
      where: {
        userId,
        id: alertId
      },
      data:{
        alertName,
        assetId,
        conditionType,
        targetValue,
        alertMethod,
        isActive
      },select:{
        id:true,
        assetId:true,
        conditionType:true,
        targetValue:true,
        isActive:true,
        alertMethod:true
      }
    });
    const Redis=await redisPromise;
    await MyRedisClient.addToQueue(JSON.stringify(response));
    return NextResponse.json({msg:"alert updated successful",response});
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }
    // Handle other errors
    console.error('Error updating alert:', error);
    return  NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}