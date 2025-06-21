'use client'
import { Template } from '@prisma/client'
import { AnimatePresence, motion } from 'framer-motion'
import {
    IconBrandJavascript,
    IconBrandPython,
    IconCode,
    IconBrandTypescript,
    IconBrandVite,
    IconBrandNodejs,
    IconAlertTriangle,
    IconExternalLink
} from '@tabler/icons-react'
import React from 'react'
import HoldToDeleteButton from './HoldToDelete'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'

const iconMap: Record<string, React.ReactNode> = {
    javascript: <IconBrandJavascript className="text-yellow-400" size={28} />,
    python: <IconBrandPython className="text-blue-400" size={28} />,
    express: <IconBrandNodejs className="text-blue-300" size={28} />,
    typescript: <IconBrandTypescript className="text-blue-500" size={28} />,
    vite: <IconBrandVite className="text-orange-500" size={28} />,
}

const Templates = ({ data }: { data: Template[] }) => {

    const [isOpen, setIsOpen] = React.useState(false)
    const userId = useUser()?.user?.id;
    const [activeTemplate, setActiveTemplate] = React.useState<Template | null>(null)
    const router = useRouter();

    const formatDate = (date: Date) => {
        const d = new Date(date)
        return `${d.getFullYear()}-${(d.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
    }

    return (
        <div className="w-full h-full max-w-7xl flex mx-auto px-4 py-6 flex-col">
            <AnimatePresence>
                {(isOpen && activeTemplate) && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        onClick={() => {
                            setActiveTemplate(null);
                            setIsOpen(false);
                        }}
                        className="w-screen z-50 h-screen absolute top-0 left-0 bg-neutral-900/50 backdrop-blur-md flex justify-center items-center"
                    >
                        <motion.div
                            transition={{ type: 'spring', damping: 1000, stiffness: 0 }}
                            className="md:max-w-lg border border-neutral-700 w-[80%] h-1/2 rounded-lg bg-gradient-to-b from-neutral-900 to-neutral-800 text-white p-6 flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className='w-full flex flex-col'>
                                <div className='w-full flex items-center mb-1 gap-3'>
                                    {iconMap[activeTemplate.type.toLowerCase()] ?? <IconCode size={28} />}
                                    <h2 className="md:text-2xl text-lg font-semibold">{activeTemplate.name}</h2>
                                </div>
                                <p className="text-sm text-neutral-400">
                                    Created on: {formatDate(activeTemplate.createdAt)}
                                </p>
                            </div>

                            <div className='flex font-sans font-bold items-center py-2 gap-1'>
                                <div>
                                    {
                                        activeTemplate.privacy === "public" ? "public" : "private"
                                    }
                                </div>
                                {
                                    activeTemplate.privacy === "public" ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                    )
                                }
                            </div>
                            <div className="flex h-full justify-between flex-col gap-1 mt-2">
                                <div className='w-full h-full flex flex-col justify-between items-center gap-1'>
                                    <div className='w-full font-sans font-bold tracking-tight'>
                                        Open in Code_Lab
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (!userId || !activeTemplate.id) return;
                                            // check if project is vite
                                            if (activeTemplate.type === "vite") {
                                                router.push(`/vite/${userId}/${activeTemplate.id}`)
                                            } else {
                                                router.push(`/main/${userId}/${activeTemplate.id}`)
                                            }
                                        }}
                                        className="w-full cursor-pointer h-full py-2 flex justify-center items-center gap-1 bg-blue-600 hover:bg-blue-700 transition rounded-md text-white font-medium"
                                    >
                                        Checkout <IconExternalLink className='w-4 h-4 text-white' />
                                    </button>
                                </div>

                                <div className='w-full h-full flex flex-col justify-between items-center gap-1'>
                                    <div className='w-full font-sans font-bold tracking-tight'>
                                        Edit Details
                                    </div>
                                    <button
                                        onClick={() => console.log("rename")}
                                        className="w-full cursor-pointer py-2 h-full bg-yellow-600 hover:bg-yellow-700 transition rounded-md text-white font-medium"
                                    >
                                        Edit Template
                                    </button>
                                </div>
                                
                                <div className='w-full h-full'>
                                    <div className='w-full h-fit font-sans font-bold mt-1 flex justify-start items-center gap-2'>
                                        <p className='text-white'>Caution ahead</p>
                                        <IconAlertTriangle size={20} />
                                    </div>
                                    <HoldToDeleteButton onHoldComplete={async() => {
                                        await axios.post('/api/delete', {
                                            templateID: activeTemplate.id
                                        })
                                        router.refresh();
                                        setIsOpen(false)
                                    }} />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <h2 className="text-white font-semibold text-3xl mb-6">Templates</h2>

            <div className="grid grid-cols-1 w-full max-h-full overflow-y-scroll sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="col-span-full text-center text-neutral-400">No templates available</motion.div>
                ) : (
                    data.map((template, index) => (
                        <motion.div
                            onClick={() => {
                                setActiveTemplate(template);
                                setIsOpen(true);
                            }}
                            initial={{ filter: "blur(5px)", opacity: 0 }}
                            animate={{ filter: "blur(0px)", opacity: 1 }}
                            transition={{ delay: 0.1 * index }}
                            key={template.id}
                            className="bg-neutral-800 h-[100px] cursor-pointer border border-neutral-700 rounded-xl p-3 hover:bg-neutral-700 transition duration-200 flex flex-col justify-center gap-3"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-neutral-900 rounded-md p-2">
                                    {iconMap[template.type.toLowerCase()] ?? <IconCode size={28} />}
                                </div>
                                <div className=''>
                                    <h3 className="text-white text-base lg:text-lg font-semibold">{template.name.split("").slice(0, 18).join("") + "..."}</h3>
                                    <p className="text-sm text-neutral-400">{template.type}</p>
                                </div>
                            </div>
                            <div className="text-xs text-neutral-500">
                                Created: {formatDate(template.createdAt)}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}

export default Templates
