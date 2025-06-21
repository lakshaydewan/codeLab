'use client'
import Link from "next/link";
import { IconBrandNodejs, IconBrandPython, IconPlus, IconBrandVite, IconArrowRight } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useState } from "react"
import { useUser } from "@clerk/nextjs";
import { Template } from "@prisma/client";
import StaggeredText from "./StaggerText";

export default function Sidebar({ data }: { data: Template[] }) {

    const userId = useUser().user?.id;
    const [isOpen, setIsOpen] = useState(true);
    const url = usePathname()
    const templates = data;
    const templateName = url.split("/")[3];

    const menuItems = [
        { name: "Create New", link: "/main/new", current: true },
    ]

    return (
        <div
            className={`${isOpen ? "w-64" : "w-[60px] md:w-14"
                } fixed top-0 left-0 md:static flex h-full z-30 bg-neutral-900 flex-col border-r md:pr-0 border-neutral-700 transition-all duration-300`}
        >
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center">
                    {isOpen && <span className="">
                        <StaggeredText text="Code-Lab" className="ml-3 text-lg font-mono text-white font-semibold" />
                    </span>}
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white focus:outline-none">
                    {isOpen ? "←" : "→"}
                </button>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.link}
                        className={`group flex ${isOpen ? "px-2 py-2" : "p-1 justify-center"} items-center  rounded-lg text-sm font-medium ${item.link === url ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                            }`}
                    >
                        <span>
                            <IconPlus className="h-5 w-5" />
                        </span>
                        {isOpen && <span>{item.name}</span>}
                    </Link>
                ))}
            </nav>
            {
                isOpen && (
                    <h1 className="text-lg font-sans font-bold flex justify-between items-center m-2">Templates
                        <Link href={'/main/templates'} className="p-0.5 px-1 cursor-pointer bg-neutral-700 rounded-md">
                            <span
                                className=""><IconArrowRight className="rotate-[-45deg]" size={18} />
                            </span>
                        </Link>
                    </h1>
                )
            }
            <div className={`w-full h-full ${isOpen ? "" : "py-2"} overflow-y-scroll`}>
                {
                    templates.length > 0 && templates.map((template) => (
                        <Link
                            key={template.name}
                            href={template.type === 'vite' ? `/vite/${userId}/${template.id}` : `/main/${userId}/${template.id}`}
                            className={`group flex items-center mx-2 rounded-lg px-2 py-2 text-sm font-medium ${template.id === templateName ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                }`}
                        >
                            <span>
                                {template.type === 'vite' ? <IconBrandVite className="h-5 w-5" /> : template.type === 'javascript' ? <IconBrandNodejs className="h-5 w-5" /> : <IconBrandPython className="h-5 w-5" />}
                            </span>
                            {isOpen && <span>{template.name}</span>}
                        </Link>
                    ))
                }
            </div>
            <div className="border-t p-2 w-full border-neutral-800">
                <a
                    href="https://github.com/lakshaydewan/proxy-app"
                    referrerPolicy="no-referrer"
                    target="_blank"
                    className="group flex items-center rounded-lg px-2 py-2 text-sm font-medium text-blue-400 hover:bg-gray-800"
                >
                    <span className="mr-2">⭐</span>
                    {isOpen && <span>Give a Star</span>}
                </a>
            </div>
        </div>
    )
}

