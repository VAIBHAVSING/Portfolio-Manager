import { Prisma } from "@/lib/generateclient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const authorisation=req.headers.get('authorization')
        if(!(authorisation==='abcdefghijk')){
            return NextResponse.json({msg:"bad request"},{status:400})
        }
        const response=await Prisma.alert.findMany({});
        return NextResponse.json(response);
    } catch (e) {
        console.error('Error fetching assets:', e);
        return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }
}
