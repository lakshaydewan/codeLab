'use server'
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { saveTemplate } from "@/app/user/actions";

export async function POST(req: NextRequest) {
    const { templateID, content } = await req.json()
    
    if (!templateID) {
        return NextResponse.json({ message: 'Unauthorized' })
    }

    try {
        const savedTemplate = await saveTemplate(templateID as string, content as string)
        return NextResponse.json({ success: true, template: savedTemplate })
    } catch (err) {
        console.error('Error saving template:', err)
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
    }
}