import { Prisma } from "@/lib/generateclient";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req:NextRequest){
    try{
        const authorisation=req.headers.get('authorization');
        if(!(authorisation==='abcdefghijk')){
            return NextResponse.json({msg:"bad request"},{status:400})
        }
        const response=await Prisma.alert.findMany({
            where:{
                isActive:true
            }
        });
        return NextResponse.json(response);

    }catch(error){
        console.error('Error updating alert:', error);
        return  NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
    }
}