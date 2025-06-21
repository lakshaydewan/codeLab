'use server'
import Sidebar from "@/components/SideBar";
import UserIcon from "@/components/UserIcon";
import { getTemplates } from "../user/actions";
import { auth } from "@clerk/nextjs/server";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    
    const{ userId }= await auth();
    const data = await getTemplates(userId as string)

    return (
        <div className="flex h-screen w-full bg-neutral-800 text-white">
            <Sidebar data={data}/>
            <UserIcon />
            {children}
        </div>
    )
}