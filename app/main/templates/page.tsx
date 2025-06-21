import Templates from '@/components/Templates';
import React from 'react'
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

const Template = async () => {

  const { userId } = await auth();

  const data = await prisma.template.findMany({
    where : {
      userId: userId as string 
    }
  })

  return (
    <div className='w-full pl-12 md:pl-0'>
      <Templates data={data} />
    </div>
  )
}

export default Template;