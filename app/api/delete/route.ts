import { NextRequest, NextResponse } from "next/server";
import { deleteTemplate } from "@/app/user/actions";

export async function POST(req: NextRequest) {

    const { templateID } = await req.json();

    try {
        await deleteTemplate(templateID)
        return NextResponse.json({ success: true, message: "Template deleted successfully!" });
    } catch (error) {
        return NextResponse.json({ success: false, error: error });
    }
}