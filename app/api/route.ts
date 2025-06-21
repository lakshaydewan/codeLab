import { NextRequest, NextResponse } from 'next/server'
import { createTemplate, getTemplates } from '@/app/user/actions'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {

    const body = await req.json()

    const { userId, name, type, privacy } = body

    try {
        const template = await createTemplate(userId, name, type, privacy)
        return NextResponse.json({ success: true, template })
    } catch (err) {
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
    }
}

export async function GET() {

    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ message: 'Unauthorized' })
    }

    const data = await getTemplates(userId as string)
    return NextResponse.json({ data })
}
