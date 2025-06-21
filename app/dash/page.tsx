import React from 'react'
import { ArrowRight, Github, Terminal } from 'lucide-react'
import Link from 'next/link'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { redirect }from 'next/navigation'

const DashPage = async () => {
    
    // check if user is signed in
    const user = await currentUser();

    if (user) {
        redirect("/main/new");
    }

    return (
        <div>
            <section className="flex h-screen w-full items-center justify-center bg-neutral-900 text-white">
                <div className="flex items-center gap-4 top-5 right-4 md:right-10 absolute">
                        <SignedOut>
                            <SignInButton forceRedirectUrl={"/main"}>
                               <span className='font-mono border rounded-sm border-gray-600 p-1 px-3 cursor-pointer font-bold'>Sign-In</span>
                            </SignInButton> 
                        </SignedOut>
                        <SignedIn>
                            <UserButton afterSignOutUrl="/dash" />
                        </SignedIn>
                </div>
                <div className="flex items-center gap-2 absolute top-5 left-4 md:left-10">
                    <Terminal className="h-6 w-6" />
                    <span className="text-xl font-bold">CodeLab</span>
                </div>
                <div className="mx-auto flex flex-col items-center justify-center gap-4 text-center">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                        Code, Build <span>Instantly</span>
                    </h1>
                    <p className="max-w-[42rem] font-mono font-light text-muted-foreground sm:text-xl">
                        Your browser-based IDE for JavaScript and Python development. Start coding in seconds, no setup required.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link href={"/main/new"}>
                            <button className='bg-neutral-800 cursor-pointer flex justify-center items-center text-white px-4 py-2 rounded-md font-medium'>
                                 Start Coding <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        </Link>
                        <Link href="https://github.com/lakshaydewan/proxy-app" target="_blank" rel="noreferrer">
                            <button className='bg-neutral-800 cursor-pointer flex justify-center items-center text-white px-4 py-2 rounded-md font-medium'>
                                <Github className="mr-2 h-4 w-4" />Give a Star
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default DashPage