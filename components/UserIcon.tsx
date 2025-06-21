import React from 'react'
import { UserButton, SignedIn } from '@clerk/nextjs'


const UserIcon = () => {
    return (
        <div className="absolute top-2 right-2 md:right-6 flex items-center gap-4">
            <SignedIn>
                <UserButton afterSignOutUrl="/dash" />
            </SignedIn>
        </div>
    )
}

export default UserIcon