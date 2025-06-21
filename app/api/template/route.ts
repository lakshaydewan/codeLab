'use server'
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getTemplate } from "@/app/user/actions";
import { auth } from "@clerk/nextjs/server";

export  async function POST(req: NextRequest) {

    const { userId } = await auth();
    const { templateID } = await req.json()

    if (!userId) {
        return NextResponse.json({ message: 'Unauthorized' })
    }

    const data = await getTemplate(templateID as string)
    return NextResponse.json(data)
}