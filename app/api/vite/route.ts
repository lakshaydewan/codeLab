'use server'
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const { templateID, Newtree } = await req.json();
    console.log('Received request to save template:', { templateID, Newtree });
    
    if (!templateID) {
        return NextResponse.json({ message: 'Unauthorized' })
    }

    try {
        console.log('Updating STARTED WITH template with ID:', templateID);
        const savedTemplate = await prisma.template.update({
            where: { id: templateID as string },
            data: {
                fileSystemTree: Newtree
            }
        })
        console.log('Updated template:', savedTemplate);
        return NextResponse.json({ success: true, template: savedTemplate })
    } catch (err) {
        console.error('Error saving template:', err)
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const templateID = searchParams.get('templateID');

    if (!templateID) {
        return NextResponse.json({ message: 'Template ID is required' }, { status: 400 });
    }

    try {
        const template = await prisma.template.findUnique({
            where: { id: templateID as string }
        });

        if (!template) {
            return NextResponse.json({ message: 'Template not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, template });
    } catch (err) {
        console.error('Error fetching template:', err);
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
    }
}