// app/api/signup/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ERROR_NAME, ERROR_CODE } from '@/config/error.config';
import { SignupInterface, SignupSchema } from '@/lib/Validator/SignupSchema';
import { Prisma } from '@/app/lib/generateclient';
import { hash } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { Session } from 'inspector/promises';

export async function POST(req: NextRequest) {
  try {
    
    // Parse the request body
    const body = await req.json();
    if(!body){
        return NextResponse.json(
            { msg:"Insufficient Credentials" },
            { status: ERROR_CODE.UNAUTHORIZED });
    }
    // Validate the request body using Zod
    const validationResult = SignupSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { msg: validationResult.error.errors },
        { status: ERROR_CODE.VALIDATION_ERROR } // 422 Unprocessable Entity
      );
    }

    // Extract validated data
    const { username, password, name, email }: SignupInterface = validationResult.data;

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Attempt to create the user in the database
    try {
      const response = await Prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          name,
          email,
          AuthOption: "Credentials",
          watchlists:{},
          alerts:{},
          sessions:{},
          portfolios:{},
          transactions:{}
        },
      });
      return NextResponse.json({ msg: 'User registered successfully' }, { status: 201 });
    } catch (dbError: any) { // Assert that dbError can be any type
      console.error('Database error:', dbError);
      
      // Check if the error has a 'code' property
      if (dbError?.code === 'P2002') { // Prisma unique constraint error code
        return NextResponse.json(
          { msg: ERROR_NAME.CONFLICT },
          { status: ERROR_CODE.CONFLICT } // 409 Conflict
        );
      }
      
      return NextResponse.json(
        { msg: ERROR_NAME.DATABASE_ERROR },
        { status: ERROR_CODE.DATABASE_ERROR } // 500 Internal Server Error
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    // Handle unexpected errors
    return NextResponse.json(
      { msg: ERROR_NAME.INTERNAL_SERVER_ERROR },
      { status: ERROR_CODE.INTERNAL_SERVER_ERROR }
    );
  }
}
